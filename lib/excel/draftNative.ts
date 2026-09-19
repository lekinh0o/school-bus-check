import { Directory, File, Paths } from 'expo-file-system';

import {
  DRAFT_JOURNAL_NAME,
  DRAFT_JOURNAL_TEMP_NAME,
  DRAFT_MANIFEST_NAME,
  DRAFT_SOURCE_NAME,
  DraftReadError,
  createManifest,
  emptyJournal,
  parseJournal,
  parseManifest,
  type DraftFiles,
  type DraftJournal,
  type DraftManifest,
  type DraftStore,
} from './draft';

function activeDirectory(): Directory {
  return new Directory(Paths.document, 'import-review', 'active');
}

function ensureDirectory(dir: Directory) {
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
}

function writeTextFile(file: File, contents: string) {
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(contents);
}

function writeBytesFile(file: File, bytes: Uint8Array) {
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(bytes);
}

export class NativeDraftStore implements DraftStore {
  async hasActive(): Promise<boolean> {
    const dir = activeDirectory();
    if (!dir.exists) {
      return false;
    }
    return new File(dir, DRAFT_SOURCE_NAME).exists;
  }

  async read(): Promise<DraftFiles | null> {
    const dir = activeDirectory();
    if (!dir.exists) {
      return null;
    }
    const sourceFile = new File(dir, DRAFT_SOURCE_NAME);
    const manifestFile = new File(dir, DRAFT_MANIFEST_NAME);
    const journalFile = new File(dir, DRAFT_JOURNAL_NAME);
    if (!sourceFile.exists && !manifestFile.exists && !journalFile.exists) {
      return null;
    }
    if (!sourceFile.exists) {
      throw new DraftReadError('Fonte ausente', 'source_missing');
    }
    if (!manifestFile.exists) {
      throw new DraftReadError('Rascunho incompatível', 'incompatible');
    }
    const manifest = parseManifest(await manifestFile.text());
    const journal = journalFile.exists
      ? parseJournal(await journalFile.text())
      : emptyJournal();
    const bytes = await sourceFile.bytes();
    return {
      source: bytes,
      manifest,
      journal,
    };
  }

  async create(
    source: Uint8Array,
    fileName: string,
    fileSize: number,
    journal: DraftJournal = emptyJournal(),
  ): Promise<DraftManifest> {
    await this.clear();
    const dir = activeDirectory();
    ensureDirectory(dir);
    const manifest = createManifest(fileName, fileSize);
    writeBytesFile(new File(dir, DRAFT_SOURCE_NAME), source);
    writeTextFile(new File(dir, DRAFT_MANIFEST_NAME), JSON.stringify(manifest));
    writeTextFile(new File(dir, DRAFT_JOURNAL_NAME), JSON.stringify(journal));
    return manifest;
  }

  async writeJournal(journal: DraftJournal): Promise<void> {
    const dir = activeDirectory();
    if (!dir.exists) {
      throw new Error('Nenhum rascunho ativo');
    }
    const encoded = JSON.stringify(journal);
    const tmp = new File(dir, DRAFT_JOURNAL_TEMP_NAME);
    writeTextFile(tmp, encoded);
    const dest = new File(dir, DRAFT_JOURNAL_NAME);
    if (dest.exists) {
      dest.delete();
    }
    tmp.moveSync(dest);
    const manifestFile = new File(dir, DRAFT_MANIFEST_NAME);
    if (manifestFile.exists) {
      const manifest = parseManifest(await manifestFile.text());
      writeTextFile(
        manifestFile,
        JSON.stringify({ ...manifest, updatedAt: new Date().toISOString() }),
      );
    }
  }

  async clear(): Promise<void> {
    const dir = activeDirectory();
    if (dir.exists) {
      dir.delete();
    }
  }
}

import type { ReviewOverlay, ImportCorrection, RowDecision } from './types';

export const DRAFT_FORMAT_VERSION = 1;
export const DRAFT_SOURCE_NAME = 'source.xlsx';
export const DRAFT_MANIFEST_NAME = 'manifest.json';
export const DRAFT_JOURNAL_NAME = 'journal.json';
export const DRAFT_JOURNAL_TEMP_NAME = 'journal.json.tmp';
export const DRAFT_RELATIVE_DIR = 'import-review/active';

export type DraftManifest = {
  version: number;
  fileName: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  sourceRelativePath: string;
  journalRelativePath: string;
};

export type DraftJournal = {
  corrections: Record<string, Record<string, ImportCorrection>>;
  decisions: Record<string, RowDecision>;
};

export type DraftFiles = {
  source: Uint8Array;
  manifest: DraftManifest;
  journal: DraftJournal;
};

export type DraftStore = {
  hasActive(): Promise<boolean>;
  read(): Promise<DraftFiles | null>;
  create(
    source: Uint8Array,
    fileName: string,
    fileSize: number,
    journal?: DraftJournal,
  ): Promise<DraftManifest>;
  writeJournal(journal: DraftJournal): Promise<void>;
  clear(): Promise<void>;
};

export class DraftReadError extends Error {
  constructor(
    message: string,
    readonly code: 'incompatible' | 'source_missing' | 'invalid',
  ) {
    super(message);
  }
}

export function emptyJournal(): DraftJournal {
  return { corrections: {}, decisions: {} };
}

export function journalFromOverlay(overlay: ReviewOverlay): DraftJournal {
  return {
    corrections: overlay.corrections,
    decisions: overlay.decisions,
  };
}

export function overlayFromJournal(journal: DraftJournal): ReviewOverlay {
  return {
    corrections: journal.corrections,
    decisions: journal.decisions,
  };
}

export function createManifest(
  fileName: string,
  fileSize: number,
  now = new Date().toISOString(),
): DraftManifest {
  return {
    version: DRAFT_FORMAT_VERSION,
    fileName,
    fileSize,
    createdAt: now,
    updatedAt: now,
    sourceRelativePath: `${DRAFT_RELATIVE_DIR}/${DRAFT_SOURCE_NAME}`,
    journalRelativePath: `${DRAFT_RELATIVE_DIR}/${DRAFT_JOURNAL_NAME}`,
  };
}

function assertNoAbsoluteOrPlan(raw: string, label: string) {
  if (raw.includes('ImportPlan') || raw.includes('file://') || raw.includes('content://')) {
    throw new DraftReadError(`${label} inválido`, 'invalid');
  }
}

export function parseManifest(raw: string): DraftManifest {
  assertNoAbsoluteOrPlan(raw, 'Manifesto');
  const parsed = JSON.parse(raw) as DraftManifest;
  if (parsed.version !== DRAFT_FORMAT_VERSION) {
    throw new DraftReadError('Rascunho incompatível', 'incompatible');
  }
  if (!parsed.sourceRelativePath.startsWith(DRAFT_RELATIVE_DIR)) {
    throw new DraftReadError('Caminho de rascunho inválido', 'invalid');
  }
  return parsed;
}

export function parseJournal(raw: string): DraftJournal {
  assertNoAbsoluteOrPlan(raw, 'Journal');
  const parsed = JSON.parse(raw) as DraftJournal;
  return {
    corrections: parsed.corrections ?? {},
    decisions: parsed.decisions ?? {},
  };
}

function cloneJournal(journal: DraftJournal): DraftJournal {
  return JSON.parse(JSON.stringify(journal)) as DraftJournal;
}

export class MemoryDraftStore implements DraftStore {
  private files: DraftFiles | null = null;
  private lastValidJournal: DraftJournal | null = null;
  failNextWrite = false;
  missingSource = false;
  writeCount = 0;
  lastTemp: string | null = null;

  async hasActive(): Promise<boolean> {
    return this.files != null;
  }

  async read(): Promise<DraftFiles | null> {
    if (!this.files) {
      return null;
    }
    if (this.missingSource) {
      throw new DraftReadError('Fonte ausente', 'source_missing');
    }
    parseManifest(JSON.stringify(this.files.manifest));
    return {
      source: new Uint8Array(this.files.source),
      manifest: { ...this.files.manifest },
      journal: cloneJournal(this.files.journal),
    };
  }

  async create(
    source: Uint8Array,
    fileName: string,
    fileSize: number,
    journal: DraftJournal = emptyJournal(),
  ): Promise<DraftManifest> {
    const manifest = createManifest(fileName, fileSize);
    const cloned = cloneJournal(journal);
    this.files = {
      source: new Uint8Array(source),
      manifest,
      journal: cloned,
    };
    this.lastValidJournal = cloneJournal(cloned);
    this.missingSource = false;
    return manifest;
  }

  async writeJournal(journal: DraftJournal): Promise<void> {
    if (!this.files) {
      throw new Error('Nenhum rascunho ativo');
    }
    const encoded = JSON.stringify(journal);
    this.lastTemp = encoded;
    if (this.failNextWrite) {
      this.failNextWrite = false;
      this.lastTemp = encoded.slice(0, Math.max(1, Math.floor(encoded.length / 3)));
      throw new Error('Falha ao salvar');
    }
    this.files.journal = cloneJournal(journal);
    this.lastValidJournal = cloneJournal(journal);
    this.lastTemp = null;
    this.writeCount += 1;
    this.files.manifest = {
      ...this.files.manifest,
      updatedAt: new Date().toISOString(),
    };
  }

  lastCommittedJournal(): DraftJournal | null {
    return this.lastValidJournal ? cloneJournal(this.lastValidJournal) : null;
  }

  markIncompatible(): void {
    if (this.files) {
      this.files.manifest = { ...this.files.manifest, version: 99 };
    }
  }

  async clear(): Promise<void> {
    this.files = null;
    this.lastValidJournal = null;
    this.lastTemp = null;
    this.missingSource = false;
  }
}

export class SerialJournalWriter {
  private queue: Promise<void> = Promise.resolve();
  status: 'idle' | 'saving' | 'saved' | 'save_error' = 'idle';
  lastError?: string;

  constructor(private readonly store: DraftStore) {}

  enqueue(journal: DraftJournal): Promise<void> {
    this.status = 'saving';
    this.queue = this.queue
      .catch(() => undefined)
      .then(async () => {
        this.status = 'saving';
        await this.store.writeJournal(journal);
        this.status = 'saved';
        this.lastError = undefined;
      })
      .catch((error: unknown) => {
        this.status = 'save_error';
        this.lastError = error instanceof Error ? error.message : 'Falha ao salvar';
        throw error;
      });
    return this.queue;
  }

  pending(): boolean {
    return this.status === 'saving';
  }

  flush(): Promise<void> {
    return this.queue.catch(() => undefined);
  }
}

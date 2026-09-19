import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as XLSX from 'xlsx';

import {
  MemoryDraftStore,
  SerialJournalWriter,
  createManifest,
  emptyJournal,
  journalFromOverlay,
  parseJournal,
  parseManifest,
} from './draft';
import { emptyOverlay } from './types';

function bufferFromTables(tables: Record<string, string[][]>): Uint8Array {
  const workbook = XLSX.utils.book_new();
  for (const [name, aoa] of Object.entries(tables)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(aoa), name);
  }
  const output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  if (output instanceof Uint8Array) {
    return output;
  }
  if (output instanceof ArrayBuffer) {
    return new Uint8Array(output);
  }
  return Uint8Array.from(output as number[]);
}

describe('draft repository', () => {
  it('stores relative manifest paths without ImportPlan or absolute URIs', async () => {
    const store = new MemoryDraftStore();
    const source = bufferFromTables({
      Alunos: [['Nome'], ['Lia']],
    });
    const manifest = await store.create(source, 'cadastros.xlsx', source.byteLength);
    const encoded = JSON.stringify(manifest);
    assert.equal(encoded.includes('ImportPlan'), false);
    assert.equal(encoded.includes('file://'), false);
    assert.match(manifest.sourceRelativePath, /^import-review\/active\//);
    const files = await store.read();
    assert.equal(JSON.stringify(files?.journal).includes('file://'), false);
  });

  it('rejects incompatible manifests and missing source', async () => {
    const store = new MemoryDraftStore();
    const source = bufferFromTables({ Alunos: [['Nome'], ['Lia']] });
    await store.create(source, 'a.xlsx', 10);
    store.markIncompatible();
    await assert.rejects(() => store.read(), /incompatível|inválido/i);
    store.missingSource = false;
    const store2 = new MemoryDraftStore();
    await store2.create(source, 'a.xlsx', 10);
    store2.missingSource = true;
    await assert.rejects(() => store2.read(), /Fonte ausente/);
  });

  it('writes journals serially, preserves last valid JSON on failure, and retries', async () => {
    const store = new MemoryDraftStore();
    const source = bufferFromTables({ Alunos: [['Nome'], ['Lia']] });
    await store.create(source, 'a.xlsx', 10);
    const writer = new SerialJournalWriter(store);
    const first = {
      corrections: {
        'students:2': {
          name: {
            field: 'name',
            originalValue: 'Lia',
            correctedValue: 'Lia Souza',
            reason: 'manual_edit' as const,
            correctedAt: '2026-01-01T00:00:00.000Z',
          },
        },
      },
      decisions: {},
    };
    await writer.enqueue(first);
    assert.equal(writer.status, 'saved');
    store.failNextWrite = true;
    const second = {
      corrections: first.corrections,
      decisions: { 'students:2': 'ignore' as const },
    };
    await assert.rejects(() => writer.enqueue(second));
    assert.equal(writer.status, 'save_error');
    assert.equal(store.lastCommittedJournal()?.decisions['students:2'], undefined);
    await writer.enqueue(second);
    assert.equal(writer.status, 'saved');
    assert.equal((await store.read())?.journal.decisions['students:2'], 'ignore');
    const third = { corrections: {}, decisions: { 'students:2': 'include' as const } };
    const fourth = { corrections: {}, decisions: { 'students:4': 'ignore' as const } };
    await Promise.all([writer.enqueue(third).catch(() => undefined), writer.enqueue(fourth)]);
    assert.equal((await store.read())?.journal.decisions['students:4'], 'ignore');
  });

  it('creates, resumes after a simulated restart, and clears on discard', async () => {
    const store = new MemoryDraftStore();
    const source = bufferFromTables({ Alunos: [['Nome'], ['Lia']] });
    await store.create(source, 'retomar.xlsx', source.byteLength, {
      corrections: {},
      decisions: { 'students:2': 'ignore' },
    });
    const resumed = new MemoryDraftStore();
    const snapshot = await store.read();
    assert.ok(snapshot);
    await resumed.create(
      snapshot.source,
      snapshot.manifest.fileName,
      snapshot.manifest.fileSize,
      snapshot.journal,
    );
    const again = await resumed.read();
    assert.equal(again?.journal.decisions['students:2'], 'ignore');
    await resumed.clear();
    assert.equal(await resumed.hasActive(), false);
    assert.equal(await resumed.read(), null);
  });

  it('grows the journal only with corrections and decisions, not with source rows', async () => {
    const header = [
      'Nome',
      'Escola',
      'Rota',
      'Ponto de embarque',
      'Veículo',
      'Assento',
    ];
    const rows = Array.from({ length: 2000 }, (_, index) => [
      `Aluno ${index + 1}`,
      'ESC-01',
      'Linha Centro',
      'Porta',
      'ABC1D23',
      String((index % 9) + 1),
    ]);
    const source = bufferFromTables({ Alunos: [header, ...rows] });
    const empty = JSON.stringify(emptyJournal()).length;
    const overlay = emptyOverlay();
    overlay.corrections['students:2'] = {
      name: {
        field: 'name',
        originalValue: 'Aluno 1',
        correctedValue: 'Aluno Um',
        reason: 'manual_edit',
        correctedAt: '2026-01-01T00:00:00.000Z',
      },
    };
    overlay.decisions['students:3'] = 'ignore';
    const journalSize = JSON.stringify(journalFromOverlay(overlay)).length;
    assert.ok(source.byteLength > 20_000, `source ${source.byteLength}`);
    assert.ok(journalSize < source.byteLength / 10, `journal ${journalSize} source ${source.byteLength}`);
    assert.ok(journalSize > empty);
    const started = Date.now();
    const { parseWorkbookBuffer } = await import('./workbook');
    const { buildImportPlanFromParsed } = await import('./plan');
    const parsed = parseWorkbookBuffer(source);
    buildImportPlanFromParsed(
      { vehicles: [], schools: [], routes: [], students: [] },
      parsed,
    );
    const elapsed = Date.now() - started;
    console.log(
      `[import-review fixture] source=${source.byteLength}B journal=${journalSize}B emptyJournal=${empty}B parse+plan=${elapsed}ms rows=2000`,
    );
    assert.ok(elapsed < 15_000, `revalidation too slow: ${elapsed}ms`);
    assert.equal(createManifest('a.xlsx', 1).sourceRelativePath.includes('file://'), false);
    assert.doesNotThrow(() => parseManifest(JSON.stringify(createManifest('a.xlsx', 1))));
    assert.doesNotThrow(() => parseJournal('{"corrections":{},"decisions":{}}'));
  });
});

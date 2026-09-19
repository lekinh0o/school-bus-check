import * as DocumentPicker from 'expo-document-picker';

import type { ExcelEntityKind } from './contract';
import type { ImportSnapshot } from './types';
import { writeWorkbookBuffer } from './workbook';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export type PickedExcel = {
  buffer: ArrayBuffer;
  bytes: Uint8Array;
  fileName: string;
  fileSize: number;
};

export async function pickExcelFile(): Promise<PickedExcel | undefined> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [XLSX_MIME, 'application/vnd.ms-excel'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets[0]) {
    return undefined;
  }
  const asset = result.assets[0];
  const response = await fetch(asset.uri);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return {
    buffer,
    bytes,
    fileName: asset.name ?? 'arquivo.xlsx',
    fileSize: asset.size ?? bytes.byteLength,
  };
}

export async function pickExcelBuffer(): Promise<ArrayBuffer | undefined> {
  const picked = await pickExcelFile();
  return picked?.buffer;
}

export async function shareExcelSnapshot(
  snapshot: ImportSnapshot,
  kinds: ExcelEntityKind[],
  fileName = 'SchoolBusCheck.xlsx',
): Promise<void> {
  const buffer = writeWorkbookBuffer(snapshot, kinds);
  const blob = new Blob([buffer], { type: XLSX_MIME });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

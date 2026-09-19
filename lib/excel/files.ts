import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { ExcelEntityKind } from './contract';
import type { ImportSnapshot } from './types';
import { writeWorkbookBuffer } from './workbook';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function pickExcelBuffer(): Promise<ArrayBuffer | undefined> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [XLSX_MIME, 'application/vnd.ms-excel'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets[0]) {
    return undefined;
  }
  const file = new File(result.assets[0].uri);
  const bytes = await file.bytes();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export async function shareExcelSnapshot(
  snapshot: ImportSnapshot,
  kinds: ExcelEntityKind[],
  fileName = 'SchoolBusCheck.xlsx',
): Promise<void> {
  const buffer = writeWorkbookBuffer(snapshot, kinds);
  const file = new File(Paths.cache, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(new Uint8Array(buffer));
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartilhamento indisponível neste dispositivo.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: XLSX_MIME,
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
    dialogTitle: 'Exportar cadastros',
  });
}

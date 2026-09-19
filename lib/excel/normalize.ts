import {
  formatPhoneBr,
  formatPlate,
  isValidHhMm,
  isValidPhoneBr,
  isValidPlate,
  parsePositiveInt,
} from '../inputMasks';
import { optionalText } from '../optionalFields';
import type { OperationType, RoutePeriod } from '../../types';

export function exactText(value: string | undefined | null): string | undefined {
  if (value == null) {
    return undefined;
  }
  const normalized = value.normalize('NFC').trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function businessCode(value: string | undefined | null): string | undefined {
  return exactText(value);
}

export function cellToString(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  return String(value);
}

export function normalizePlate(value: string): string | undefined {
  const raw = exactText(value);
  if (!raw) {
    return undefined;
  }
  const formatted = formatPlate(raw);
  return isValidPlate(formatted) ? formatted : formatted;
}

export function validPlate(value: string): string | undefined {
  const formatted = normalizePlate(value);
  if (!formatted || !isValidPlate(formatted)) {
    return undefined;
  }
  return formatted;
}

export function validPhone(value: string): string | undefined {
  const raw = optionalText(value);
  if (!raw) {
    return undefined;
  }
  const formatted = formatPhoneBr(raw);
  return isValidPhoneBr(formatted) ? formatted : undefined;
}

export function parsePeriod(value: string): RoutePeriod | undefined {
  const folded = exactText(value)
    ?.normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  if (!folded) {
    return undefined;
  }
  if (folded === 'manha') {
    return 'Manha';
  }
  if (folded === 'tarde') {
    return 'Tarde';
  }
  if (folded === 'noite') {
    return 'Noite';
  }
  return undefined;
}

export function formatPeriod(period: RoutePeriod): string {
  if (period === 'Manha') {
    return 'Manhã';
  }
  return period;
}

export function parseOperationType(value: string): OperationType | undefined {
  const folded = exactText(value)
    ?.normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!folded) {
    return undefined;
  }
  if (
    folded.includes('ida e volta') ||
    folded === 'ida_e_volta' ||
    folded === 'idaevolta'
  ) {
    return 'IDA_E_VOLTA';
  }
  if (folded.includes('somente ida') || folded.includes('apenas ida')) {
    return 'SOMENTE_IDA';
  }
  if (folded.includes('somente volta') || folded.includes('apenas volta')) {
    return 'SOMENTE_VOLTA';
  }
  return undefined;
}

export function formatOperationType(type: OperationType): string {
  if (type === 'SOMENTE_IDA') {
    return 'Somente Ida';
  }
  if (type === 'SOMENTE_VOLTA') {
    return 'Somente Volta';
  }
  return 'Ida e Volta';
}

export function parseBoardingPointNames(value: string): string[] {
  const raw = exactText(value);
  if (!raw) {
    return [];
  }
  const names: string[] = [];
  for (const part of raw.split('|')) {
    const name = exactText(part);
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }
  return names;
}

export function formatBoardingPointNames(names: string[]): string {
  return names.join(' | ');
}

export function parseOptionalNumber(value: string): number | undefined {
  const raw = exactText(value);
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export { isValidHhMm, parsePositiveInt, optionalText, formatPlate, isValidPlate };

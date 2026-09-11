export function formatPlate(raw: string): string {
  const chars = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (chars.length <= 3) {
    return chars;
  }

  const letters = chars.slice(0, 3);
  const rest = chars.slice(3);

  if (/^\d[A-Z]/.test(rest)) {
    return `${letters}${rest}`;
  }

  return `${letters}-${rest.slice(0, 4)}`;
}

export function isValidPlate(value: string): boolean {
  const normalized = value.toUpperCase().trim();
  return /^[A-Z]{3}-\d{4}$/.test(normalized) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(normalized);
}

export function digitsOnly(value: string, max = 11): string {
  return value.replace(/\D/g, '').slice(0, max);
}

export function formatPhoneBr(raw: string): string {
  const digits = digitsOnly(raw);
  if (digits.length === 0) {
    return '';
  }
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function isValidPhoneBr(value: string): boolean {
  const digits = digitsOnly(value);
  return digits.length >= 10 && digits.length <= 11;
}

export function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) {
    return '';
  }
  if (digits.length <= 2) {
    if (digits.length === 2 && Number.parseInt(digits, 10) > 23) {
      return '23';
    }
    return digits;
  }
  const hourNum = Math.min(23, Number.parseInt(digits.slice(0, 2), 10));
  let minute = digits.slice(2);
  if (minute.length === 2) {
    minute = String(Math.min(59, Number.parseInt(minute, 10))).padStart(2, '0');
  } else if (minute.length === 1 && Number.parseInt(minute, 10) > 5) {
    minute = '5';
  }
  return `${String(hourNum).padStart(2, '0')}:${minute}`;
}

export function isValidHhMm(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

export function parsePositiveInt(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }
  const parsed = Number.parseInt(value.trim(), 10);
  return parsed > 0 ? parsed : null;
}

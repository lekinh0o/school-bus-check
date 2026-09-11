export function localDateKey(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateKey(key: string): string {
  if (!isValidDateKey(key)) {
    return '';
  }
  const [year, month, day] = key.split('-');
  return `${day}/${month}/${year}`;
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return false;
  }
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function dateKeyFromParts(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function shiftDateKey(key: string, days: number): string {
  if (!isValidDateKey(key)) {
    return '';
  }
  const [year, month, day] = key.split('-').map(Number);
  return dateKeyFromParts(year, month, day + days);
}

export function monthStartKey(key: string): string {
  if (!isValidDateKey(key)) {
    return '';
  }
  return `${key.slice(0, 7)}-01`;
}

export function formatLocalDate(iso?: string): string {
  const key = localDateKey(iso);
  if (!key) {
    return '';
  }
  return formatDateKey(key);
}

function capitalizePt(value: string): string {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatLongDate(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const weekday = capitalizePt(
    date.toLocaleDateString('pt-BR', { weekday: 'long' }),
  );
  const day = String(date.getDate()).padStart(2, '0');
  const month = capitalizePt(date.toLocaleDateString('pt-BR', { month: 'long' }));
  return `${weekday}, ${day} de ${month}`;
}

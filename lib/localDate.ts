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

export function formatLocalDate(iso?: string): string {
  const key = localDateKey(iso);
  if (!key) {
    return '';
  }
  const [year, month, day] = key.split('-');
  return `${day}/${month}/${year}`;
}

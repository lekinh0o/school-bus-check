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

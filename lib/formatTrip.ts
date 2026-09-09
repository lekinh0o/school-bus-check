export function formatClock(iso: string): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTripDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('pt-BR');
}

export function formatDuration(startedAt: string, finishedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  if (!startedAt || Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return '—';
  }
  const minutes = Math.max(1, Math.ceil((end - start) / 60000));
  return `${minutes} min`;
}

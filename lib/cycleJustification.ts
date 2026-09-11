import type { CycleJustification } from '@/types/execution';

export function cycleJustificationLabel(
  justification: CycleJustification,
): string {
  if (justification.kind === 'forgot_morning') {
    return 'Esqueci de iniciar de manhã';
  }
  if (justification.kind === 'afternoon_only') {
    return 'Período exclusivo à tarde';
  }
  if (justification.kind === 'return_done_offline') {
    return 'Volta realizada sem o app';
  }
  if (justification.kind === 'period_cancelled') {
    return 'Período cancelado/Feriado';
  }
  return justification.note?.trim() || 'Texto livre';
}

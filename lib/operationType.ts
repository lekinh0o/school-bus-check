import type { OperationType, Route, RouteDirection } from '@/types';

export const OPERATION_TYPE_LABEL: Record<OperationType, string> = {
  IDA_E_VOLTA: '🔄 Ida e Volta',
  SOMENTE_IDA: '☀️ Apenas Ida',
  SOMENTE_VOLTA: '🌙 Apenas Volta',
};

export function resolveOperationType(route: Route): OperationType {
  return route.operationType ?? 'IDA_E_VOLTA';
}

export function allowedDirections(type: OperationType): RouteDirection[] {
  if (type === 'SOMENTE_IDA') {
    return ['IDA'];
  }
  if (type === 'SOMENTE_VOLTA') {
    return ['VOLTA'];
  }
  return ['IDA', 'VOLTA'];
}

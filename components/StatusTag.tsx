import { Text, View } from 'react-native';

import type { ExecutionStatus } from '@/types/execution';

const TAG = {
  amber: { wrap: 'bg-amber-100', text: 'text-amber-950' },
  emerald: { wrap: 'bg-emerald-100', text: 'text-emerald-950' },
  orange: { wrap: 'bg-orange-100', text: 'text-orange-950' },
  slate: { wrap: 'bg-slate-100', text: 'text-slate-700' },
  blue: { wrap: 'bg-blue-100', text: 'text-blue-950' },
} as const;

const EXECUTION_STATUS_TAG: Record<
  ExecutionStatus,
  { label: string; tone: keyof typeof TAG }
> = {
  PENDING: { label: 'Pendente', tone: 'slate' },
  PRESENT: { label: 'Presente', tone: 'emerald' },
  ABSENT: { label: 'Ausente', tone: 'orange' },
  DROPPED_OFF: { label: 'Desembarcou', tone: 'blue' },
};

export function StatusTag({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof TAG;
}) {
  const style = TAG[tone];
  return (
    <View className={`mt-1 self-start rounded-md px-2 py-1 ${style.wrap}`}>
      <Text className={`text-xs font-bold ${style.text}`}>{label}</Text>
    </View>
  );
}

export function ExecutionStatusBadge({ status }: { status: ExecutionStatus }) {
  const tag = EXECUTION_STATUS_TAG[status];
  return <StatusTag label={tag.label} tone={tag.tone} />;
}

export function MissedIdaBadge({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }
  return <StatusTag label="⚠️ Faltou na Ida" tone="amber" />;
}

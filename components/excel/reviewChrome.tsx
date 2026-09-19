import { Feather } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cardShadow, palette } from '@/constants/Colors';
import type { ReviewStep } from '@/lib/excel/controller';
import type { ReviewFilter } from '@/lib/excel/reviewModel';
import { FILTER_LABEL, VALIDATION_LABEL, OPERATION_LABEL } from '@/lib/excel/reviewModel';
import type { PlannedRow, RowValidation } from '@/lib/excel/types';

const STEPS: { id: ReviewStep; label: string }[] = [
  { id: 'analysis', label: 'Análise' },
  { id: 'review', label: 'Revisão' },
  { id: 'confirmation', label: 'Confirmação' },
];

function stepIndex(step: ReviewStep): number {
  if (step === 'analysis') {
    return 0;
  }
  if (step === 'confirmation') {
    return 2;
  }
  return 1;
}

export function ReviewStepper({ step }: { step: ReviewStep }) {
  const current = stepIndex(step);
  return (
    <View
      accessibilityRole="header"
      className="flex-row items-center justify-between">
      {STEPS.map((item, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <View key={item.id} className="flex-1 items-center">
            <Text
              className={`text-[12px] font-bold ${
                active ? 'text-primary' : done ? 'text-success' : 'text-ink-muted'
              }`}>
              {index + 1}. {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function SaveStatusLabel({
  status,
  error,
}: {
  status: 'idle' | 'saving' | 'saved' | 'save_error';
  error?: string;
}) {
  if (status === 'saving') {
    return (
      <Text accessibilityLiveRegion="polite" className="text-[12px] text-info">
        Salvando rascunho…
      </Text>
    );
  }
  if (status === 'saved') {
    return (
      <Text accessibilityLiveRegion="polite" className="text-[12px] text-success">
        Rascunho salvo para retomar
      </Text>
    );
  }
  if (status === 'save_error') {
    return (
      <Text accessibilityLiveRegion="polite" className="text-[12px] text-error">
        {error ?? 'Alteração ainda não está protegida para retomada'}
      </Text>
    );
  }
  return null;
}

const TONE = {
  success: { wrap: 'bg-green-100', text: 'text-green-800', icon: '#15803D' },
  warning: { wrap: 'bg-amber-100', text: 'text-amber-900', icon: '#D97706' },
  danger: { wrap: 'bg-red-100', text: 'text-red-800', icon: '#B91C1C' },
  info: { wrap: 'bg-blue-100', text: 'text-blue-800', icon: '#2563EB' },
} as const;

export function SemanticBadge({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof TONE;
}) {
  const style = TONE[tone];
  return (
    <View className={`self-start rounded-md px-2 py-1 ${style.wrap}`}>
      <Text className={`text-[11px] font-bold ${style.text}`}>{label}</Text>
    </View>
  );
}

export function validationTone(validation: RowValidation): keyof typeof TONE {
  if (validation === 'valid') {
    return 'success';
  }
  if (validation === 'error') {
    return 'danger';
  }
  if (validation === 'conflict' || validation === 'warning') {
    return 'warning';
  }
  return 'info';
}

export function RowStatusBadges({ row }: { row: PlannedRow }) {
  return (
    <View className="mt-2 flex-row flex-wrap gap-2">
      <SemanticBadge label={OPERATION_LABEL[row.operation]} tone={row.operation === 'create' ? 'info' : row.operation === 'update' ? 'warning' : 'info'} />
      <SemanticBadge
        label={VALIDATION_LABEL[row.validation]}
        tone={validationTone(row.validation)}
      />
      {row.corrected ? <SemanticBadge label="Corrigido" tone="info" /> : null}
      {row.decision === 'ignore' ? <SemanticBadge label="Ignorado" tone="warning" /> : null}
    </View>
  );
}

export function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONE;
}) {
  const style = TONE[tone];
  return (
    <View
      style={cardShadow}
      className="min-h-[84px] flex-1 rounded-card bg-surface p-3">
      <Text className={`text-[22px] font-bold ${style.text}`}>{value}</Text>
      <Text className="mt-1 text-[12px] font-semibold text-ink-muted">{label}</Text>
    </View>
  );
}

export function ActionFooter({
  children,
  paddingBottom,
}: {
  children: ReactNode;
  paddingBottom: number;
}) {
  return (
    <View
      className="border-t border-[#EEF2F6] bg-surface px-4 pt-3"
      style={{ paddingBottom: 12 + paddingBottom }}>
      {children}
    </View>
  );
}

export function FooterButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const wrap =
    variant === 'primary'
      ? disabled
        ? 'bg-disabled'
        : 'bg-primary'
      : variant === 'danger'
        ? 'border border-error'
        : 'border border-[#EEF2F6]';
  const text =
    variant === 'primary'
      ? 'text-white'
      : variant === 'danger'
        ? 'text-error'
        : 'text-ink';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      className={`min-h-14 flex-1 items-center justify-center rounded-button ${wrap}`}>
      <Text className={`font-semibold ${text}`}>{label}</Text>
    </Pressable>
  );
}

export function FilterChips({
  value,
  onChange,
}: {
  value: ReviewFilter;
  onChange: (filter: ReviewFilter) => void;
}) {
  const filters: ReviewFilter[] = ['problems', 'eligible', 'ignored', 'all'];
  return (
    <View className="flex-row flex-wrap gap-2">
      {filters.map((filter) => {
        const selected = value === filter;
        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            accessibilityRole="button"
            accessibilityLabel={FILTER_LABEL[filter]}
            accessibilityState={{ selected }}
            className={`min-h-11 items-center justify-center rounded-full px-3 ${
              selected ? 'bg-primary' : 'bg-background'
            }`}>
            <Text
              className={`text-[13px] font-semibold ${
                selected ? 'text-white' : 'text-ink'
              }`}>
              {FILTER_LABEL[filter]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CloseIconButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-11 min-w-11 items-center justify-center">
      <Feather name="x" size={22} color={palette.textPrimary} />
    </Pressable>
  );
}

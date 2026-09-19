import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { cardShadow } from '@/constants/Colors';
import {
  formatPhoneBr,
  formatPlate,
  formatTimeInput,
} from '@/lib/inputMasks';
import type { ExcelEntityKind } from '@/lib/excel/contract';
import {
  boardingPointOptions,
  editableColumns,
  effectiveRouteId,
  effectiveSchoolId,
  entityLabel,
  routeOptions,
  rowTitle,
  schoolOptions,
  vehicleOptions,
  type RefOption,
} from '@/lib/excel/reviewModel';
import type { ImportCorrection, ImportSnapshot, PlannedRow } from '@/lib/excel/types';
import { isEligibleRow } from '@/lib/excel/types';

import {
  ActionFooter,
  FooterButton,
  RowStatusBadges,
  SemanticBadge,
} from './reviewChrome';

function maskValue(key: string, value: string): string {
  if (key === 'plate') {
    return formatPlate(value);
  }
  if (key === 'phone' || key === 'phone1' || key === 'phone2') {
    return formatPhoneBr(value);
  }
  if (
    key === 'departureTimeIda' ||
    key === 'arrivalTimeIda' ||
    key === 'departureTimeVolta' ||
    key === 'arrivalTimeVolta'
  ) {
    return formatTimeInput(value);
  }
  return value;
}

function isReferenceField(key: string): boolean {
  return key === 'school' || key === 'route' || key === 'vehicle' || key === 'boardingPoint';
}

export function CorrectionStep({
  row,
  snapshot,
  paddingBottom,
  onSave,
  onBack,
  onNext,
  onIgnore,
}: {
  row: PlannedRow;
  snapshot: ImportSnapshot;
  paddingBottom: number;
  onSave: (corrections: ImportCorrection[]) => void;
  onBack: () => void;
  onNext: () => void;
  onIgnore: () => void;
}) {
  const columns = editableColumns(row.kind);
  const [values, setValues] = useState<Record<string, string>>(row.effectiveValues);
  const [refs, setRefs] = useState<Record<string, RefOption | undefined>>({});
  const success = isEligibleRow(row) && row.corrected;

  useEffect(() => {
    setValues(row.effectiveValues);
  }, [row.rowKey, row.effectiveValues]);

  const schoolId = refs.school?.id ?? effectiveSchoolId(row);
  const routeId = refs.route?.id ?? effectiveRouteId(row);
  const schools = useMemo(() => schoolOptions(snapshot), [snapshot]);
  const routes = useMemo(
    () => routeOptions(snapshot, schoolId),
    [snapshot, schoolId],
  );
  const vehicles = useMemo(() => vehicleOptions(snapshot), [snapshot]);
  const points = useMemo(
    () => boardingPointOptions(snapshot, routeId),
    [snapshot, routeId],
  );

  function optionsFor(key: string): RefOption[] {
    if (key === 'school') {
      return schools;
    }
    if (key === 'route') {
      return routes;
    }
    if (key === 'vehicle') {
      return vehicles;
    }
    if (key === 'boardingPoint') {
      return points;
    }
    return [];
  }

  function handleSave() {
    const now = new Date().toISOString();
    const corrections: ImportCorrection[] = [];
    for (const column of columns) {
      const original = row.originalValues[column.key] ?? '';
      const next = values[column.key] ?? '';
      const selected = refs[column.key];
      if (selected) {
        corrections.push({
          field: column.key,
          originalValue: original,
          correctedValue: selected.label,
          selectedEntityKind: selected.kind,
          selectedEntityId: selected.id,
          selectedEntityLabel: selected.label,
          reason: 'selected_reference',
          correctedAt: now,
        });
        continue;
      }
      if (next !== original) {
        corrections.push({
          field: column.key,
          originalValue: original,
          correctedValue: next,
          reason: 'manual_edit',
          correctedAt: now,
        });
      }
    }
    onSave(corrections);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={8}>
      <ScrollView
        className="flex-1 px-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={cardShadow} className="mt-3 rounded-card bg-surface p-4">
          <Text className="text-[13px] font-semibold uppercase text-ink-muted">
            {entityLabel(row.kind)} · linha {row.rowNumber}
          </Text>
          <Text className="mt-1 text-[18px] font-bold text-ink">{rowTitle(row)}</Text>
          <RowStatusBadges row={row} />
          {success ? (
            <View className="mt-3">
              <SemanticBadge label="Registro apto após revalidação" tone="success" />
            </View>
          ) : null}
          {row.issues.map((issue) => (
            <Text key={`${issue.code}-${issue.field ?? ''}`} className="mt-2 text-[13px] text-error">
              {issue.field ? `${issue.field}: ` : ''}
              {issue.message}
            </Text>
          ))}
        </View>

        {columns.map((column) => {
          const original = row.originalValues[column.key] ?? '';
          const current = values[column.key] ?? '';
          const options = isReferenceField(column.key) ? optionsFor(column.key) : [];
          return (
            <View key={column.key} className="mt-4">
              <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {column.label}
                {column.required ? '' : ' (opcional)'}
              </Text>
              {original !== current ? (
                <Text className="mb-1 text-[12px] text-ink-muted">
                  Original: {original || '—'}
                </Text>
              ) : null}
              <TextInput
                value={current}
                onChangeText={(text) =>
                  setValues((prev) => ({ ...prev, [column.key]: maskValue(column.key, text) }))
                }
                accessibilityLabel={column.label}
                className="min-h-12 rounded-card border border-[#EEF2F6] bg-surface px-3 text-[16px] text-ink"
              />
              {isReferenceField(column.key) ? (
                <View className="mt-2">
                  {options.length === 0 ? (
                    <Text className="text-[13px] text-ink-muted">
                      Nenhuma opção persistida compatível. A central não cria{' '}
                      {column.label.toLowerCase()} automaticamente.
                    </Text>
                  ) : (
                    options.map((option) => {
                      const selected = refs[column.key]?.id === option.id;
                      return (
                        <Pressable
                          key={option.id}
                          onPress={() => {
                            setRefs((prev) => ({ ...prev, [column.key]: option }));
                            setValues((prev) => ({ ...prev, [column.key]: option.label }));
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Selecionar ${option.label}`}
                          accessibilityState={{ selected }}
                          className={`mt-2 min-h-11 rounded-card border px-3 py-2 ${
                            selected ? 'border-primary bg-primary-light' : 'border-[#EEF2F6] bg-surface'
                          }`}>
                          <Text className="font-semibold text-ink">{option.label}</Text>
                          {option.detail ? (
                            <Text className="text-[12px] text-ink-muted">{option.detail}</Text>
                          ) : null}
                        </Pressable>
                      );
                    })
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      <ActionFooter paddingBottom={paddingBottom}>
        {success ? (
          <View className="flex-row gap-3">
            <FooterButton label="Voltar para revisão" variant="secondary" onPress={onBack} />
            <FooterButton label="Corrigir próximo" onPress={onNext} />
          </View>
        ) : (
          <View className="gap-2">
            <View className="flex-row gap-3">
              <FooterButton label="Voltar" variant="secondary" onPress={onBack} />
              <FooterButton label="Salvar correção" onPress={handleSave} />
            </View>
            <FooterButton label="Ignorar este registro" variant="danger" onPress={onIgnore} />
          </View>
        )}
      </ActionFooter>
    </KeyboardAvoidingView>
  );
}

export function kindFromRowKey(rowKey: string): ExcelEntityKind {
  return rowKey.split(':')[0] as ExcelEntityKind;
}

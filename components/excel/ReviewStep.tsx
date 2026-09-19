import { Feather } from '@expo/vector-icons';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { cardShadow, palette } from '@/constants/Colors';
import { reviewCounts } from '@/lib/excel/controller';
import {
  entityLabel,
  rowTitle,
  type ReviewFilter,
} from '@/lib/excel/reviewModel';
import type { ImportReviewSession } from '@/lib/excel/session';
import type { PlannedRow } from '@/lib/excel/types';

import {
  ActionFooter,
  FilterChips,
  FooterButton,
  RowStatusBadges,
} from './reviewChrome';

export function ReviewStep({
  session,
  filter,
  query,
  rows,
  paddingBottom,
  onFilter,
  onQuery,
  onCorrect,
  onIgnore,
  onRestore,
  onRevalidate,
  onConfirmEligible,
  onConfirmAll,
  onBack,
}: {
  session: ImportReviewSession;
  filter: ReviewFilter;
  query: string;
  rows: PlannedRow[];
  paddingBottom: number;
  onFilter: (filter: ReviewFilter) => void;
  onQuery: (query: string) => void;
  onCorrect: (row: PlannedRow) => void;
  onIgnore: (row: PlannedRow) => void;
  onRestore: (row: PlannedRow) => void;
  onRevalidate: () => void;
  onConfirmEligible: () => void;
  onConfirmAll: () => void;
  onBack: () => void;
}) {
  const counts = reviewCounts(session);
  return (
    <View className="flex-1">
      <View className="px-4 pt-3">
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Buscar nome, placa, matrícula..."
          accessibilityLabel="Buscar registros"
          className="min-h-12 rounded-card border border-[#EEF2F6] bg-surface px-3 text-[16px] text-ink"
        />
        <View className="mt-3">
          <FilterChips value={filter} onChange={onFilter} />
        </View>
        <Text className="mt-3 text-[13px] text-ink-muted">
          {counts.eligible} aptos · {counts.blocking} problemas · {counts.ignored} ignorados
        </Text>
      </View>
      <FlatList
        className="mt-2 flex-1"
        data={rows}
        keyExtractor={(item) => item.rowKey}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ListEmptyComponent={
          <View className="mt-10 items-center px-6">
            <Feather name="search" size={28} color={palette.textMuted} />
            <Text className="mt-3 text-center text-[15px] text-ink-muted">
              Nenhum registro neste filtro. Ajuste a busca ou escolha Todos.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={cardShadow} className="mb-3 rounded-card bg-surface p-4">
            <Text className="text-[13px] font-semibold uppercase text-ink-muted">
              {entityLabel(item.kind)} · linha {item.rowNumber}
            </Text>
            <Text className="mt-1 text-[16px] font-bold text-ink">{rowTitle(item)}</Text>
            <RowStatusBadges row={item} />
            {item.issues.map((issue) => (
              <Text key={`${issue.code}-${issue.field ?? ''}`} className="mt-2 text-[13px] text-error">
                {issue.field ? `${issue.field}: ` : ''}
                {issue.message}
              </Text>
            ))}
            <View className="mt-3 flex-row gap-2">
              <Pressable
                onPress={() => onCorrect(item)}
                accessibilityRole="button"
                accessibilityLabel={`Corrigir ${rowTitle(item)}`}
                className="min-h-11 flex-1 items-center justify-center rounded-button bg-primary">
                <Text className="font-semibold text-white">Corrigir</Text>
              </Pressable>
              {item.decision === 'ignore' ? (
                <Pressable
                  onPress={() => onRestore(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Restaurar ${rowTitle(item)}`}
                  className="min-h-11 flex-1 items-center justify-center rounded-button border border-[#EEF2F6]">
                  <Text className="font-semibold text-ink">Restaurar</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => onIgnore(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ignorar ${rowTitle(item)}`}
                  className="min-h-11 flex-1 items-center justify-center rounded-button border border-[#EEF2F6]">
                  <Text className="font-semibold text-ink">Ignorar</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
      <ActionFooter paddingBottom={paddingBottom}>
        <Text className="mb-2 text-center text-[12px] text-info">
          Revalidação usa os cadastros atuais. Nada é gravado nesta etapa.
        </Text>
        <View className="flex-row gap-3">
          <FooterButton label="Voltar" variant="secondary" onPress={onBack} />
          <FooterButton label="Revalidar" variant="secondary" onPress={onRevalidate} />
        </View>
        <View className="mt-2 flex-row gap-3">
          <FooterButton
            label={
              counts.canImportAll
                ? `Confirmar ${counts.eligible}`
                : `Importar ${counts.eligible} aptos`
            }
            disabled={counts.eligible === 0}
            onPress={counts.canImportAll ? onConfirmAll : onConfirmEligible}
            accessibilityHint={
              counts.canImportAll
                ? 'Importa todos os registros incluídos e aptos'
                : `Importa somente ${counts.eligible} registros aptos`
            }
          />
        </View>
      </ActionFooter>
    </View>
  );
}

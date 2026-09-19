import { ScrollView, Text, View } from 'react-native';

import { cardShadow } from '@/constants/Colors';
import { reviewCounts } from '@/lib/excel/controller';
import type { ImportReviewSession } from '@/lib/excel/session';
import type { ApplySummary } from '@/lib/excel/apply';

import { ActionFooter, FooterButton, SummaryCard } from './reviewChrome';

export function ConfirmationStep({
  session,
  paddingBottom,
  result,
  onBack,
  onImportAll,
  onImportEligible,
  onDone,
}: {
  session: ImportReviewSession;
  paddingBottom: number;
  result?: ApplySummary;
  onBack: () => void;
  onImportAll: () => void;
  onImportEligible: () => void;
  onDone: () => void;
}) {
  const counts = reviewCounts(session);
  if (result) {
    return (
      <View className="flex-1">
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 16 }}>
          <View style={cardShadow} className="mt-4 rounded-card bg-surface p-4">
            <Text className="text-[22px] font-bold text-ink">Importação concluída</Text>
            <Text className="mt-2 text-[14px] text-ink-muted">
              Este resultado não fica salvo como histórico.
            </Text>
            <Text className="mt-4 text-[16px] text-ink">
              {result.created} criados · {result.updated} atualizados · {result.skipped} de fora
            </Text>
          </View>
        </ScrollView>
        <ActionFooter paddingBottom={paddingBottom}>
          <FooterButton label="Fechar" onPress={onDone} />
        </ActionFooter>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="mt-4 text-[22px] font-bold text-ink">Confirmar importação</Text>
        <Text className="mt-2 text-[14px] text-ink-muted">
          Nada é gravado até você escolher uma ação explícita.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-3">
          <SummaryCard label="Aptos" value={counts.eligible} tone="success" />
          <SummaryCard label="Novos" value={counts.news} tone="info" />
        </View>
        <View className="mt-3 flex-row flex-wrap gap-3">
          <SummaryCard label="Atualizações" value={counts.updates} tone="warning" />
          <SummaryCard label="Ignorados" value={counts.ignored} tone="warning" />
        </View>
        <View className="mt-3">
          <SummaryCard label="Impeditivos" value={counts.blocking} tone="danger" />
        </View>
        {!counts.canImportAll ? (
          <Text className="mt-4 text-[13px] text-error">
            A importação completa está bloqueada. Você pode importar somente os {counts.eligible}{' '}
            registros aptos; {counts.blocking} ficarão de fora.
          </Text>
        ) : (
          <Text className="mt-4 text-[13px] text-success">
            Todas as linhas incluídas estão aptas.
          </Text>
        )}
      </ScrollView>
      <ActionFooter paddingBottom={paddingBottom}>
        <View className="flex-row gap-3">
          <FooterButton label="Voltar à revisão" variant="secondary" onPress={onBack} />
          {counts.canImportAll ? (
            <FooterButton
              label="Importar todos"
              onPress={onImportAll}
              disabled={counts.eligible === 0}
            />
          ) : (
            <FooterButton
              label={`Importar ${counts.eligible} aptos`}
              onPress={onImportEligible}
              disabled={counts.eligible === 0}
            />
          )}
        </View>
      </ActionFooter>
    </View>
  );
}

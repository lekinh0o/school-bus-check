import { ScrollView, Text, View } from 'react-native';

import { cardShadow } from '@/constants/Colors';
import { SHEET_TITLES } from '@/lib/excel/contract';
import { analysisTotals } from '@/lib/excel/reviewModel';
import type { ImportPlan } from '@/lib/excel/types';

import { ActionFooter, FooterButton, SummaryCard } from './reviewChrome';

export function AnalysisStep({
  plan,
  fileName,
  fileSize,
  paddingBottom,
  onContinue,
  onLeave,
}: {
  plan: ImportPlan;
  fileName: string;
  fileSize: number;
  paddingBottom: number;
  onContinue: () => void;
  onLeave: () => void;
}) {
  const totals = analysisTotals(plan);
  const sizeKb = Math.max(1, Math.round(fileSize / 1024));
  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={cardShadow} className="mt-4 rounded-card bg-surface p-4">
          <Text className="text-[13px] font-semibold uppercase text-ink-muted">
            Arquivo
          </Text>
          <Text className="mt-1 text-[18px] font-bold text-ink">{fileName}</Text>
          <Text className="mt-1 text-[13px] text-ink-muted">{sizeKb} KB</Text>
        </View>

        <Text className="mt-5 text-[14px] font-semibold text-ink">Abas encontradas</Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {plan.sheetsFound.length === 0 ? (
            <Text className="text-[13px] text-ink-muted">Nenhuma aba reconhecida</Text>
          ) : (
            plan.sheetsFound.map((kind) => (
              <View key={kind} className="rounded-full bg-blue-100 px-3 py-2">
                <Text className="text-[13px] font-semibold text-blue-800">
                  {SHEET_TITLES[kind]}
                </Text>
              </View>
            ))
          )}
        </View>
        {plan.ignoredSheets.length > 0 ? (
          <Text className="mt-2 text-[13px] text-ink-muted">
            Abas ignoradas: {plan.ignoredSheets.join(', ')}
          </Text>
        ) : null}
        {plan.headerErrors.map((item) => (
          <Text key={item.sheet} className="mt-2 text-[13px] text-error">
            {item.sheet}: {item.message}
          </Text>
        ))}

        <View className="mt-4 flex-row flex-wrap gap-3">
          <SummaryCard label="Aptos" value={totals.eligible} tone="success" />
          <SummaryCard label="Novos" value={totals.news} tone="info" />
        </View>
        <View className="mt-3 flex-row flex-wrap gap-3">
          <SummaryCard label="Atualizações" value={totals.updates} tone="warning" />
          <SummaryCard label="Problemas" value={totals.problems} tone="danger" />
        </View>
      </ScrollView>
      <ActionFooter paddingBottom={paddingBottom}>
        <View className="flex-row gap-3">
          <FooterButton label="Sair e continuar depois" variant="secondary" onPress={onLeave} />
          <FooterButton label="Revisar registros" onPress={onContinue} />
        </View>
      </ActionFooter>
    </View>
  );
}

import { Pressable, Text, View } from 'react-native';

type ExecutionBottomBarProps = {
  canGoPrevious: boolean;
  canSkip: boolean;
  lastPoint: boolean;
  canFinish: boolean;
  pointComplete: boolean;
  pendingCount: number;
  onPrevious: () => void;
  onComplete: () => void;
  onSkip: () => void;
};

export function ExecutionBottomBar({
  canGoPrevious,
  canSkip,
  lastPoint,
  canFinish,
  pointComplete,
  pendingCount,
  onPrevious,
  onComplete,
  onSkip,
}: ExecutionBottomBarProps) {
  const completeEnabled = lastPoint ? canFinish : pointComplete;
  const completeLabel = lastPoint ? 'Encerrar rota' : 'Concluir';
  const blockHint =
    !completeEnabled && pendingCount > 0
      ? `${pendingCount} ${pendingCount === 1 ? 'aluno ainda precisa' : 'alunos ainda precisam'} ser avaliados`
      : lastPoint && !canFinish
        ? 'Ainda há aluno na van'
        : null;

  return (
    <View className="border-t border-[#EEF2F6] bg-surface px-3 pb-3 pt-2">
      {blockHint ? (
        <Text className="mb-2 text-center text-sm font-semibold text-warning">
          {blockHint}
        </Text>
      ) : null}
      <View className="flex-row gap-2">
        <Pressable
          disabled={!canGoPrevious}
          onPress={onPrevious}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o ponto anterior"
          className={`min-h-12 flex-1 items-center justify-center rounded-button border ${
            canGoPrevious ? 'border-divider bg-surface' : 'border-divider bg-background'
          }`}>
          <Text
            className={`text-sm font-extrabold ${
              canGoPrevious ? 'text-ink' : 'text-disabled'
            }`}>
            ← Anterior
          </Text>
        </Pressable>
        <Pressable
          onPress={onComplete}
          accessibilityRole="button"
          accessibilityLabel={completeLabel}
          accessibilityState={{ disabled: !completeEnabled }}
          className={`min-h-12 flex-[1.2] items-center justify-center rounded-button ${
            completeEnabled ? 'bg-primary' : 'bg-[#E2E8F0]'
          }`}>
          <Text
            className={`text-center text-sm font-extrabold ${
              completeEnabled ? 'text-white' : 'text-ink-muted'
            }`}>
            {completeLabel}
          </Text>
        </Pressable>
        <Pressable
          disabled={!canSkip}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Pular para o próximo ponto"
          className={`min-h-12 flex-1 items-center justify-center rounded-button border ${
            canSkip ? 'border-divider bg-surface' : 'border-divider bg-background'
          }`}>
          <Text
            className={`text-sm font-extrabold ${canSkip ? 'text-ink' : 'text-disabled'}`}>
            Próximo →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

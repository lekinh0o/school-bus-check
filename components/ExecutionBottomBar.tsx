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
  const completeLabel = lastPoint ? 'Encerrar rota' : 'Concluir ponto';
  const blockHint =
    !completeEnabled && pendingCount > 0
      ? `${pendingCount} ${pendingCount === 1 ? 'aluno ainda precisa' : 'alunos ainda precisam'} ser avaliados`
      : lastPoint && !canFinish
        ? 'Ainda há aluno na van'
        : null;

  return (
    <View className="border-t border-slate-700 bg-slate-900 px-3 pb-3 pt-2">
      {blockHint ? (
        <Text className="mb-2 text-center text-sm font-semibold text-amber-200">
          {blockHint}
        </Text>
      ) : null}
      <View className="flex-row gap-2">
        <Pressable
          disabled={!canGoPrevious}
          onPress={onPrevious}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o ponto anterior"
          className={`min-h-14 flex-1 items-center justify-center rounded-2xl border ${
            canGoPrevious ? 'border-slate-500 bg-slate-800' : 'border-slate-700 bg-slate-900'
          }`}>
          <Text
            className={`text-sm font-extrabold ${
              canGoPrevious ? 'text-white' : 'text-slate-500'
            }`}>
            Anterior
          </Text>
        </Pressable>
        <Pressable
          onPress={onComplete}
          accessibilityRole="button"
          accessibilityLabel={completeLabel}
          accessibilityState={{ disabled: !completeEnabled }}
          className={`min-h-14 flex-[1.2] items-center justify-center rounded-2xl ${
            completeEnabled ? 'bg-brand' : 'bg-slate-600'
          }`}>
          <Text className="text-center text-sm font-extrabold text-white">
            {completeLabel}
          </Text>
        </Pressable>
        <Pressable
          disabled={!canSkip}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Pular para o próximo ponto"
          className={`min-h-14 flex-1 items-center justify-center rounded-2xl border ${
            canSkip ? 'border-slate-500 bg-slate-800' : 'border-slate-700 bg-slate-900'
          }`}>
          <Text
            className={`text-sm font-extrabold ${canSkip ? 'text-white' : 'text-slate-500'}`}>
            Próximo
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

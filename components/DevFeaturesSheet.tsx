import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

import { palette } from '@/constants/Colors';

export function DevFeaturesSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-3xl bg-surface px-5 pb-10 pt-4">
          <View className="mb-4 items-center">
            <View className="h-1 w-12 rounded-full bg-divider" />
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-ink">Configurações</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
              <Feather name="x" size={22} color={palette.textMuted} />
            </Pressable>
          </View>
          <View className="items-center rounded-card bg-primary-light px-4 py-8">
            <Feather name="tool" size={32} color={palette.primary} />
            <Text className="mt-3 text-center text-base font-bold text-ink">
              Funcionalidade em desenvolvimento
            </Text>
            <Text className="mt-2 text-center text-sm text-ink-muted">
              Preferências, perfil e avisos extras chegarão em uma próxima versão.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

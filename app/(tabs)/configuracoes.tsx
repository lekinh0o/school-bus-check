import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DevFeaturesSheet } from '@/components/DevFeaturesSheet';
import { palette } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

export default function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(true);

  return (
    <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top + 8 }}>
      <Text className="text-[30px] font-bold text-ink">Configurações</Text>
      <Text className="mt-2 text-[15px] text-ink-muted">
        Preferências do aplicativo.
      </Text>
      <Pressable
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir configurações em desenvolvimento"
        className="mt-6 flex-row items-center rounded-card border border-[#EEF2F6] bg-surface px-4 py-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-light">
          <Feather name="settings" size={22} color={palette.primary} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-bold text-ink">Ajustes</Text>
          <Text className="mt-0.5 text-[13px] text-ink-muted">
            Funcionalidade em desenvolvimento
          </Text>
        </View>
        <Feather name="chevron-up" size={20} color={palette.primary} />
      </Pressable>
      <DevFeaturesSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

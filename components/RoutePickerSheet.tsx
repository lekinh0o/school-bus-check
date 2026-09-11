import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { palette } from '@/constants/Colors';
import type { Route } from '@/types';

export type RoutePickerItem = {
  route: Route;
  schoolName: string;
  pending: boolean;
};

type RoutePickerSheetProps = {
  visible: boolean;
  selectedId: string | null;
  items: RoutePickerItem[];
  onClose: () => void;
  onSelect: (routeId: string) => void;
};

export function RoutePickerSheet({
  visible,
  selectedId,
  items,
  onClose,
  onSelect,
}: RoutePickerSheetProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter(
      (item) =>
        item.route.title.toLowerCase().includes(term) ||
        item.schoolName.toLowerCase().includes(term),
    );
  }, [items, query]);

  function handleSelect(routeId: string) {
    onSelect(routeId);
    setQuery('');
    onClose();
  }

  function handleClose() {
    setQuery('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-ink">Escolher rota</Text>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar">
              <Feather name="x" size={22} color={palette.textMuted} />
            </Pressable>
          </View>
          <View className="mb-3 flex-row items-center rounded-button border border-[#EEF2F6] bg-background px-3">
            <Feather name="search" size={16} color={palette.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por rota ou escola"
              placeholderTextColor={palette.textMuted}
              className="ml-2 min-h-12 flex-1 text-[15px] text-ink"
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.route.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text className="py-8 text-center text-sm text-ink-muted">
                Nenhuma rota encontrada.
              </Text>
            }
            renderItem={({ item }) => {
              const selected = item.route.id === selectedId;
              return (
                <Pressable
                  onPress={() => handleSelect(item.route.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar rota ${item.route.title}`}
                  className={`mb-2 flex-row items-center rounded-card border px-3 py-3 ${
                    selected
                      ? 'border-primary bg-primary-light'
                      : 'border-[#EEF2F6] bg-surface'
                  }`}>
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-pastel-route">
                    <Feather name="map" size={18} color={palette.iconRoute} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-[16px] font-bold text-ink">
                      {item.route.title}
                    </Text>
                    <Text className="mt-0.5 text-[13px] text-ink-muted">
                      {item.schoolName}
                    </Text>
                  </View>
                  {item.pending ? (
                    <Text className="mr-2 text-[11px] font-semibold text-warning">
                      Pendente
                    </Text>
                  ) : null}
                  {selected ? (
                    <Feather name="check" size={18} color={palette.primary} />
                  ) : (
                    <Feather name="chevron-right" size={18} color={palette.disabled} />
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
});

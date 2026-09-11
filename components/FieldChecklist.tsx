import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { palette } from '@/constants/Colors';

export type ChecklistItem = {
  label: string;
  done: boolean;
};

export function FieldChecklist({ items }: { items: ChecklistItem[] }) {
  const pending = items.filter((item) => !item.done).length;
  return (
    <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-sm font-bold text-ink">
        {pending === 0
          ? 'Tudo pronto para salvar'
          : `${pending} ${pending === 1 ? 'item pendente' : 'itens pendentes'}`}
      </Text>
      <Text className="mt-1 text-xs text-ink-muted">
        Confira o que ainda impede o cadastro.
      </Text>
      {items.map((item) => (
        <View key={item.label} className="mt-2 flex-row items-center">
          <Feather
            name={item.done ? 'check-circle' : 'circle'}
            size={16}
            color={item.done ? palette.success : palette.disabled}
          />
          <Text
            className={`ml-2 text-sm ${
              item.done ? 'text-ink-secondary' : 'font-semibold text-ink'
            }`}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

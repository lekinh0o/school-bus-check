import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { palette } from '@/constants/Colors';
import { isValidHhMm } from '@/lib/inputMasks';

const HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, '0'),
);
const MINUTES = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, '0'),
);

function parseParts(value: string): { hour: string; minute: string } {
  if (isValidHhMm(value)) {
    const [hour, minute] = value.split(':');
    return { hour, minute };
  }
  return { hour: '07', minute: '00' };
}

type TimePickerFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

export function TimePickerField({
  label,
  value,
  onChange,
  placeholder = 'Escolher horário',
}: TimePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const initial = parseParts(value);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  function openPicker() {
    const parts = parseParts(value);
    setHour(parts.hour);
    setMinute(parts.minute);
    setOpen(true);
  }

  const display = isValidHhMm(value) ? value : '';

  return (
    <View className="mt-2">
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-4">
        <View className="flex-1">
          <Text className="text-xs font-semibold text-slate-500">{label}</Text>
          <Text className={`mt-1 text-lg ${display ? 'text-slate-900' : 'text-slate-400'}`}>
            {display || placeholder}
          </Text>
        </View>
        <Feather name="clock" size={20} color={palette.primary} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-4">
            <Text className="mb-3 text-lg font-bold text-ink">{label}</Text>
            <View className="flex-row gap-3">
              <Wheel
                title="Hora"
                values={HOURS}
                selected={hour}
                onSelect={setHour}
              />
              <Wheel
                title="Minuto"
                values={MINUTES}
                selected={minute}
                onSelect={setMinute}
              />
            </View>
            <Pressable
              onPress={() => {
                onChange(`${hour}:${minute}`);
                setOpen(false);
              }}
              className="mt-4 items-center rounded-button bg-primary py-4">
              <Text className="text-base font-extrabold text-white">
                Confirmar {hour}:{minute}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Wheel({
  title,
  values,
  selected,
  onSelect,
}: {
  title: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-2 text-center text-xs font-semibold text-ink-muted">{title}</Text>
      <ScrollView className="h-48 rounded-2xl border border-slate-200 bg-slate-50">
        {values.map((item) => {
          const active = item === selected;
          return (
            <Pressable
              key={item}
              onPress={() => onSelect(item)}
              className={`items-center py-2 ${active ? 'bg-primary-light' : ''}`}>
              <Text
                className={`text-lg font-semibold ${
                  active ? 'text-primary-dark' : 'text-slate-600'
                }`}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { palette } from '@/constants/Colors';
import {
  dateKeyFromParts,
  daysInMonth,
  formatDateKey,
  isValidDateKey,
  localDateKey,
} from '@/lib/localDate';

const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function parseParts(value: string): { year: number; month: number; day: number } {
  if (isValidDateKey(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return { year, month, day };
  }
  const today = localDateKey();
  const [year, month, day] = today.split('-').map(Number);
  return { year, month, day };
}

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  minYear: number;
  maxYear: number;
};

export function DatePickerField({
  label,
  value,
  onChange,
  minYear,
  maxYear,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const initial = parseParts(value);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  function openPicker() {
    const parts = parseParts(value);
    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
    setOpen(true);
  }

  const years = Array.from(
    { length: Math.max(1, maxYear - minYear + 1) },
    (_, index) => minYear + index,
  );
  const maxDay = daysInMonth(year, month);
  const safeDay = Math.min(day, maxDay);
  const display = isValidDateKey(value) ? formatDateKey(value) : '';

  return (
    <View className="flex-1">
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="rounded-2xl border border-[#EEF2F6] bg-surface px-3 py-3">
        <Text className="text-[11px] font-semibold uppercase text-ink-muted">
          {label}
        </Text>
        <View className="mt-1 flex-row items-center justify-between">
          <Text className={`text-[15px] font-bold ${display ? 'text-ink' : 'text-ink-muted'}`}>
            {display || 'Escolher'}
          </Text>
          <Feather name="calendar" size={16} color={palette.primary} />
        </View>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-4">
            <Text className="mb-3 text-lg font-bold text-ink">{label}</Text>
            <View className="flex-row gap-2">
              <Wheel
                title="Dia"
                values={Array.from({ length: maxDay }, (_, index) =>
                  String(index + 1).padStart(2, '0'),
                )}
                selected={String(safeDay).padStart(2, '0')}
                onSelect={(next) => setDay(Number.parseInt(next, 10))}
              />
              <Wheel
                title="Mês"
                values={MONTHS}
                selected={MONTHS[month - 1]}
                onSelect={(next) => {
                  const nextMonth = MONTHS.indexOf(next) + 1;
                  setMonth(nextMonth);
                  setDay((current) => Math.min(current, daysInMonth(year, nextMonth)));
                }}
              />
              <Wheel
                title="Ano"
                values={years.map(String)}
                selected={String(year)}
                onSelect={(next) => {
                  const nextYear = Number.parseInt(next, 10);
                  setYear(nextYear);
                  setDay((current) => Math.min(current, daysInMonth(nextYear, month)));
                }}
              />
            </View>
            <Pressable
              onPress={() => {
                onChange(dateKeyFromParts(year, month, safeDay));
                setOpen(false);
              }}
              className="mt-4 items-center rounded-button bg-primary py-4">
              <Text className="text-base font-extrabold text-white">
                Confirmar {formatDateKey(dateKeyFromParts(year, month, safeDay))}
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
      <Text className="mb-2 text-center text-xs font-semibold text-ink-muted">
        {title}
      </Text>
      <ScrollView className="h-48 rounded-2xl border border-slate-200 bg-slate-50">
        {values.map((item) => {
          const active = item === selected;
          return (
            <Pressable
              key={item}
              onPress={() => onSelect(item)}
              className={`items-center py-2 ${active ? 'bg-primary-light' : ''}`}>
              <Text
                className={`text-base font-semibold ${
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

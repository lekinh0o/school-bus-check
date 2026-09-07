import { Pressable, Text, View } from 'react-native';

import {
  AFTERNOON_STATUSES,
  MORNING_STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
} from '@/constants/attendance';
import type { AfternoonStatus, AttendanceStatus, MorningStatus, Shift } from '@/types/attendance';

type StatusButtonsProps = {
  shift: Shift;
  selected?: AttendanceStatus;
  onSelectMorning: (status: MorningStatus) => void;
  onSelectAfternoon: (status: AfternoonStatus) => void;
};

export function StatusButtons({
  shift,
  selected,
  onSelectMorning,
  onSelectAfternoon,
}: StatusButtonsProps) {
  const statuses = shift === 'morning' ? MORNING_STATUSES : AFTERNOON_STATUSES;

  return (
    <View className="mt-3 flex-row flex-wrap gap-2">
      {statuses.map((status) => {
        const isSelected = selected === status;
        return (
          <Pressable
            key={status}
            onPress={() => {
              if (shift === 'morning') {
                onSelectMorning(status as MorningStatus);
              } else {
                onSelectAfternoon(status as AfternoonStatus);
              }
            }}
            className={`rounded-full px-3 py-2 ${
              isSelected ? STATUS_STYLES[status] : 'bg-slate-200'
            }`}>
            <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
              {STATUS_LABELS[status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

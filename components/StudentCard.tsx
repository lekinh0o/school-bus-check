import { Text, View } from 'react-native';

import { STATUS_HINTS, STATUS_LABELS } from '@/constants/attendance';
import type { AfternoonStatus, MorningStatus, Shift, Student } from '@/types/attendance';

import { StatusButtons } from './StatusButtons';

type StudentCardProps = {
  student: Student;
  shift: Shift;
  morningStatus?: MorningStatus;
  afternoonStatus?: AfternoonStatus;
  onSelectMorning: (status: MorningStatus) => void;
  onSelectAfternoon: (status: AfternoonStatus) => void;
};

export function StudentCard({
  student,
  shift,
  morningStatus,
  afternoonStatus,
  onSelectMorning,
  onSelectAfternoon,
}: StudentCardProps) {
  const selected = shift === 'morning' ? morningStatus : afternoonStatus;
  const hint = selected ? STATUS_HINTS[selected] : 'Aguardando registro neste turno.';

  return (
    <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Text className="text-lg font-bold text-slate-900">{student.name}</Text>
      <Text className="text-sm text-slate-500">
        {student.grade} · {student.pickupAddress}
      </Text>
      <Text className="mt-2 text-xs font-medium text-brand">
        {selected ? STATUS_LABELS[selected] : 'Sem status'}
      </Text>
      <Text className="mt-1 text-xs text-slate-500">{hint}</Text>
      <StatusButtons
        shift={shift}
        selected={selected}
        onSelectMorning={onSelectMorning}
        onSelectAfternoon={onSelectAfternoon}
      />
    </View>
  );
}

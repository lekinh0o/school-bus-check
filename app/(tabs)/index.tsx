import { Pressable, ScrollView, Text, View } from 'react-native';

import { StudentCard } from '@/components/StudentCard';
import { SHIFT_LABELS } from '@/constants/attendance';
import { useAttendance } from '@/hooks/useAttendance';
import type { Shift } from '@/types/attendance';

export default function DashboardScreen() {
  const {
    students,
    attendance,
    shift,
    setShift,
    setMorningStatus,
    setAfternoonStatus,
  } = useAttendance();

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-4">
      <Text className="text-2xl font-bold text-slate-900">Painel de chamada</Text>
      <Text className="mt-1 text-sm text-slate-500">
        Registre ingresso, ausência e desembarque por turno.
      </Text>

      <View className="mt-4 flex-row gap-2">
        {(['morning', 'afternoon'] as Shift[]).map((item) => {
          const isActive = shift === item;
          return (
            <Pressable
              key={item}
              onPress={() => setShift(item)}
              className={`rounded-full px-4 py-2 ${isActive ? 'bg-brand' : 'bg-white border border-slate-200'}`}>
              <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                {SHIFT_LABELS[item]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-4">
        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            shift={shift}
            morningStatus={attendance[student.id]?.morning}
            afternoonStatus={attendance[student.id]?.afternoon}
            onSelectMorning={(status) => setMorningStatus(student.id, status)}
            onSelectAfternoon={(status) => setAfternoonStatus(student.id, status)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

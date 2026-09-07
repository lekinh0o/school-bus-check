import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { removeStudent, selectAllStudents } from '@/store/studentSlice';
import { updateSchool } from '@/store/schoolSlice';
import { removeSeat } from '@/store/vehicleSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { Student } from '@/types';

export default function StudentsListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const students = useAppSelector(selectAllStudents);
  const schoolEntities = useAppSelector((state) => state.schools.entities);
  const routeEntities = useAppSelector((state) => state.routes.entities);

  function handleCreate() {
    router.push('/students/new' as Href);
  }

  function handleEdit(studentId: string) {
    router.push(`/students/${studentId}` as Href);
  }

  function handleDelete(student: Student) {
    Alert.alert(
      'Excluir aluno',
      `Deseja excluir ${student.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            dispatch(
              removeSeat({
                vehicleId: student.vehicleId,
                seatNumber: student.seatNumber,
              }),
            );
            const school = schoolEntities[student.schoolId];
            if (school) {
              dispatch(
                updateSchool({
                  id: school.id,
                  changes: {
                    studentIds: school.studentIds.filter((id) => id !== student.id),
                  },
                }),
              );
            }
            dispatch(removeStudent(student.id));
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-28">
        {students.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-center text-base text-slate-500">
              Nenhum aluno cadastrado ainda. Adicione o primeiro para ocupar um
              assento na van.
            </Text>
          </View>
        ) : (
          students.map((student) => {
            const school = schoolEntities[student.schoolId];
            const route = routeEntities[student.routeId];
            return (
              <View
                key={student.id}
                className="mb-3 flex-row items-center rounded-2xl border border-slate-200 bg-white p-4">
                {student.photoUri ? (
                  <Image
                    source={{ uri: student.photoUri }}
                    className="mr-3 h-14 w-14 rounded-full bg-slate-200"
                  />
                ) : (
                  <View className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <Feather name="user" size={22} color="#94A3B8" />
                  </View>
                )}
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-bold text-slate-900">
                    {student.name}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500">{student.grade}</Text>
                  <Text className="mt-1 text-sm text-slate-600">
                    {school?.name ?? 'Escola não encontrada'}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500">
                    {route?.title ?? 'Rota não encontrada'} · Assento{' '}
                    {student.seatNumber}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleEdit(student.id)}
                  hitSlop={8}
                  className="h-10 w-10 items-center justify-center">
                  <Feather name="edit-2" size={20} color="#0F6B4D" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(student)}
                  hitSlop={8}
                  className="h-10 w-10 items-center justify-center">
                  <Feather name="trash-2" size={20} color="#DC2626" />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable
        onPress={handleCreate}
        className="absolute bottom-6 left-4 right-4 items-center rounded-2xl bg-brand py-4 shadow-lg">
        <Text className="text-base font-bold text-white">Adicionar Novo Aluno</Text>
      </Pressable>
    </View>
  );
}

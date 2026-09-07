import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { removeSchool, selectAllSchools } from '@/store/schoolSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { School } from '@/types';

export default function SchoolsListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const schools = useAppSelector(selectAllSchools);

  function handleCreate() {
    router.push('/schools/new' as Href);
  }

  function handleEdit(schoolId: string) {
    router.push(`/schools/${schoolId}` as Href);
  }

  function handleDelete(school: School) {
    Alert.alert(
      'Excluir escola',
      `Deseja excluir ${school.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => dispatch(removeSchool(school.id)),
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-28">
        {schools.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-center text-base text-slate-500">
              Nenhuma escola cadastrada ainda. Adicione a primeira para vincular
              rotas e alunos.
            </Text>
          </View>
        ) : (
          schools.map((school) => (
            <View
              key={school.id}
              className="mb-3 flex-row items-center rounded-2xl border border-slate-200 bg-white p-4">
              <View className="flex-1 pr-2">
                <Text className="text-lg font-bold text-slate-900">{school.name}</Text>
                <Text className="mt-1 text-sm text-slate-500">
                  Diretor(a): {school.principal}
                </Text>
                <Text className="mt-2 text-sm font-semibold text-brand">
                  {school.studentIds.length} Alunos | {school.routeIds.length} Rotas
                </Text>
              </View>
              <Pressable
                onPress={() => handleEdit(school.id)}
                hitSlop={8}
                className="h-10 w-10 items-center justify-center">
                <Feather name="edit-2" size={20} color="#0F6B4D" />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(school)}
                hitSlop={8}
                className="h-10 w-10 items-center justify-center">
                <Feather name="trash-2" size={20} color="#DC2626" />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={handleCreate}
        className="absolute bottom-6 left-4 right-4 items-center rounded-2xl bg-brand py-4 shadow-lg">
        <Text className="text-base font-bold text-white">Adicionar Nova Escola</Text>
      </Pressable>
    </View>
  );
}

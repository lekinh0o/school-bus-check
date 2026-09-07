import { Feather } from '@expo/vector-icons';
import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { addRoute, selectRouteById, updateRoute } from '@/store/routeSlice';
import { selectAllSchools, updateSchool } from '@/store/schoolSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { RouteDirection, RoutePeriod } from '@/types';
import { formatTimeInput, isValidHhMm } from '@/lib/inputMasks';
import { pickLocalImage } from '@/lib/pickImage';

const PERIOD_OPTIONS: { value: RoutePeriod; label: string }[] = [
  { value: 'Manha', label: 'Manhã' },
  { value: 'Tarde', label: 'Tarde' },
  { value: 'Noite', label: 'Noite' },
];

const DIRECTION_OPTIONS: { value: RouteDirection; label: string }[] = [
  { value: 'IDA', label: 'Ida' },
  { value: 'VOLTA', label: 'Volta' },
];

function withRouteId(routeIds: string[], routeId: string): string[] {
  return routeIds.includes(routeId) ? routeIds : [...routeIds, routeId];
}

function withoutRouteId(routeIds: string[], routeId: string): string[] {
  return routeIds.filter((id) => id !== routeId);
}

export default function RouteFormScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isCreate = id === 'new';

  const existing = useAppSelector((state) =>
    !isCreate && id ? selectRouteById(state, id) : undefined,
  );
  const schools = useAppSelector(selectAllSchools);

  const [title, setTitle] = useState('');
  const [direction, setDirection] = useState<RouteDirection | null>(null);
  const [responsible, setResponsible] = useState('');
  const [monitor, setMonitor] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [period, setPeriod] = useState<RoutePeriod | null>(null);
  const [schoolId, setSchoolId] = useState('');
  const [streets, setStreets] = useState<string[]>([]);
  const [streetDraft, setStreetDraft] = useState('');
  const [responsiblePhotoUri, setResponsiblePhotoUri] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!existing) {
      return;
    }
    setTitle(existing.title);
    setDirection(existing.direction);
    setResponsible(existing.responsible);
    setMonitor(existing.monitor);
    setStartPoint(existing.startPoint);
    setStartTime(existing.startTime);
    setEndTime(existing.endTime);
    setPeriod(existing.period);
    setSchoolId(existing.schoolId);
    setStreets(existing.streetsCovered);
    setResponsiblePhotoUri(existing.responsiblePhotoUri);
  }, [existing]);

  const canSubmit =
    title.trim().length > 0 &&
    direction !== null &&
    responsible.trim().length > 0 &&
    monitor.trim().length > 0 &&
    startPoint.trim().length > 0 &&
    isValidHhMm(startTime) &&
    isValidHhMm(endTime) &&
    period !== null &&
    schoolId.length > 0;

  function handleAddStreet() {
    const normalized = streetDraft.trim();
    if (!normalized || streets.includes(normalized)) {
      return;
    }
    setStreets((current) => [...current, normalized]);
    setStreetDraft('');
  }

  function handleRemoveStreet(index: number) {
    setStreets((current) => current.filter((_, i) => i !== index));
  }

  function moveStreet(index: number, delta: number) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= streets.length) {
      return;
    }
    setStreets((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  }

  async function handlePickPhoto() {
    const uri = await pickLocalImage([1, 1]);
    if (uri) {
      setResponsiblePhotoUri(uri);
    }
  }

  function handleSubmit() {
    if (!canSubmit || period === null || direction === null) {
      return;
    }

    const fields = {
      title: title.trim(),
      direction,
      responsible: responsible.trim(),
      monitor: monitor.trim(),
      startPoint: startPoint.trim(),
      streetsCovered: streets,
      schoolId,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      period,
      responsiblePhotoUri,
    };

    if (isCreate) {
      const newId = Date.now().toString();
      dispatch(addRoute({ id: newId, ...fields }));
      const school = schools.find((item) => item.id === schoolId);
      if (school) {
        dispatch(
          updateSchool({
            id: school.id,
            changes: { routeIds: withRouteId(school.routeIds, newId) },
          }),
        );
      }
    } else if (id && existing) {
      dispatch(
        updateRoute({
          id,
          changes: fields,
        }),
      );
      if (existing.schoolId !== schoolId) {
        const previousSchool = schools.find((item) => item.id === existing.schoolId);
        if (previousSchool) {
          dispatch(
            updateSchool({
              id: previousSchool.id,
              changes: {
                routeIds: withoutRouteId(previousSchool.routeIds, id),
              },
            }),
          );
        }
        const nextSchool = schools.find((item) => item.id === schoolId);
        if (nextSchool) {
          dispatch(
            updateSchool({
              id: nextSchool.id,
              changes: { routeIds: withRouteId(nextSchool.routeIds, id) },
            }),
          );
        }
      }
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/routes' as Href);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{ title: isCreate ? 'Nova rota' : 'Editar rota' }}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-10"
        keyboardShouldPersistTaps="handled">
        {responsiblePhotoUri ? (
          <Image
            source={{ uri: responsiblePhotoUri }}
            className="mb-4 h-24 w-24 self-center rounded-full bg-slate-200"
          />
        ) : null}
        <Pressable
          onPress={handlePickPhoto}
          className="mb-4 items-center rounded-2xl border border-brand bg-brand-light py-4">
          <Text className="text-base font-semibold text-brand-dark">
            Foto do responsável
          </Text>
        </Pressable>

        <Text className="mb-2 text-sm font-semibold text-slate-700">
          Título da rota
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Rota Bairro Cruzeiro - Manhã"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Sentido
        </Text>
        <View className="flex-row gap-2">
          {DIRECTION_OPTIONS.map((option) => {
            const selected = direction === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setDirection(option.value)}
                className={`flex-1 items-center rounded-2xl border py-3 ${
                  selected
                    ? 'border-brand bg-brand-light'
                    : 'border-slate-200 bg-white'
                }`}>
                <Text
                  className={`text-sm font-semibold ${
                    selected ? 'text-brand-dark' : 'text-slate-600'
                  }`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Responsável
        </Text>
        <TextInput
          value={responsible}
          onChangeText={setResponsible}
          placeholder="Nome do responsável"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Monitor(a)
        </Text>
        <TextInput
          value={monitor}
          onChangeText={setMonitor}
          placeholder="Nome do monitor ou monitora"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Ponto de início
        </Text>
        <TextInput
          value={startPoint}
          onChangeText={setStartPoint}
          placeholder="Ponto de partida"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Horário de início
        </Text>
        <TextInput
          value={startTime}
          onChangeText={(value) => setStartTime(formatTimeInput(value))}
          keyboardType="number-pad"
          placeholder="07:00"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Horário de fim
        </Text>
        <TextInput
          value={endTime}
          onChangeText={(value) => setEndTime(formatTimeInput(value))}
          keyboardType="number-pad"
          placeholder="08:30"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Período
        </Text>
        <View className="flex-row gap-2">
          {PERIOD_OPTIONS.map((option) => {
            const selected = period === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPeriod(option.value)}
                className={`flex-1 items-center rounded-2xl border py-3 ${
                  selected
                    ? 'border-brand bg-brand-light'
                    : 'border-slate-200 bg-white'
                }`}>
                <Text
                  className={`text-sm font-semibold ${
                    selected ? 'text-brand-dark' : 'text-slate-600'
                  }`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Escola de destino
        </Text>
        {schools.length === 0 ? (
          <Text className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-500">
            Cadastre uma escola em Cadastros antes de criar a rota.
          </Text>
        ) : (
          schools.map((school) => {
            const selected = schoolId === school.id;
            return (
              <Pressable
                key={school.id}
                onPress={() => setSchoolId(school.id)}
                className={`mb-2 rounded-2xl border px-4 py-4 ${
                  selected
                    ? 'border-brand bg-brand-light'
                    : 'border-slate-200 bg-white'
                }`}>
                <Text
                  className={`text-base font-semibold ${
                    selected ? 'text-brand-dark' : 'text-slate-900'
                  }`}>
                  {school.name}
                </Text>
                <Text className="mt-1 text-sm text-slate-500">{school.address}</Text>
              </Pressable>
            );
          })
        )}

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Ruas percorridas
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={streetDraft}
            onChangeText={setStreetDraft}
            placeholder="Nome da rua"
            placeholderTextColor="#94A3B8"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
          />
          <Pressable
            onPress={handleAddStreet}
            className="h-14 w-14 items-center justify-center rounded-2xl bg-brand">
            <Text className="text-2xl font-bold text-white">+</Text>
          </Pressable>
        </View>
        {streets.map((street, index) => (
          <View
            key={`${street}-${index}`}
            className="mt-2 flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <View className="mr-1">
              <Pressable
                disabled={index === 0}
                onPress={() => moveStreet(index, -1)}
                className="h-8 w-8 items-center justify-center">
                <Feather
                  name="chevron-up"
                  size={20}
                  color={index === 0 ? '#CBD5E1' : '#0F6B4D'}
                />
              </Pressable>
              <Pressable
                disabled={index === streets.length - 1}
                onPress={() => moveStreet(index, 1)}
                className="h-8 w-8 items-center justify-center">
                <Feather
                  name="chevron-down"
                  size={20}
                  color={index === streets.length - 1 ? '#CBD5E1' : '#0F6B4D'}
                />
              </Pressable>
            </View>
            <Text className="flex-1 text-base text-slate-900">{street}</Text>
            <Pressable
              onPress={() => handleRemoveStreet(index)}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center">
              <Feather name="x" size={20} color="#DC2626" />
            </Pressable>
          </View>
        ))}

        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`mt-8 items-center rounded-2xl py-5 ${
            canSubmit ? 'bg-brand' : 'bg-slate-300'
          }`}>
          <Text className="text-lg font-bold text-white">Salvar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

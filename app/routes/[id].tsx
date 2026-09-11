import { Feather } from '@expo/vector-icons';
import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';

import { addRoute, selectRouteById, updateRoute } from '@/store/routeSlice';
import { selectAllSchools, updateSchool } from '@/store/schoolSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { BoardingPoint, OperationType, RoutePeriod } from '@/types';
import { BoardingPointMapPicker } from '@/components/BoardingPointMapPicker';
import { FieldChecklist } from '@/components/FieldChecklist';
import { TimePickerField } from '@/components/TimePickerField';
import { useLeaveConfirmation } from '@/hooks/useLeaveConfirmation';
import {
  coordsFromValues,
  createBoardingPoint,
  hasCoordinates,
} from '@/lib/boardingPoints';
import { pointCoords, type MapCoords } from '@/lib/geocode';
import { isValidHhMm } from '@/lib/inputMasks';
import { OPERATION_TYPE_LABEL } from '@/lib/operationType';
import { pickLocalImage } from '@/lib/pickImage';

const PERIOD_OPTIONS: { value: RoutePeriod; label: string }[] = [
  { value: 'Manha', label: 'Manhã' },
  { value: 'Tarde', label: 'Tarde' },
  { value: 'Noite', label: 'Noite' },
];

const OPERATION_OPTIONS: OperationType[] = [
  'IDA_E_VOLTA',
  'SOMENTE_IDA',
  'SOMENTE_VOLTA',
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
  const [responsible, setResponsible] = useState('');
  const [monitor, setMonitor] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [departureTimeIda, setDepartureTimeIda] = useState('');
  const [arrivalTimeIda, setArrivalTimeIda] = useState('');
  const [departureTimeVolta, setDepartureTimeVolta] = useState('');
  const [arrivalTimeVolta, setArrivalTimeVolta] = useState('');
  const [period, setPeriod] = useState<RoutePeriod | null>(null);
  const [operationType, setOperationType] =
    useState<OperationType>('IDA_E_VOLTA');
  const [schoolId, setSchoolId] = useState('');
  const [boardingPoints, setBoardingPoints] = useState<BoardingPoint[]>([]);
  const [pointDraft, setPointDraft] = useState('');
  const [pendingCoords, setPendingCoords] = useState<MapCoords | undefined>();
  const [mapTarget, setMapTarget] = useState<
    | { kind: 'draft' }
    | { kind: 'edit'; index: number }
    | { kind: 'start' }
    | null
  >(null);
  const [startCoords, setStartCoords] = useState<MapCoords | undefined>();
  const [responsiblePhotoUri, setResponsiblePhotoUri] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!existing) {
      return;
    }
    setTitle(existing.title);
    setResponsible(existing.responsible);
    setMonitor(existing.monitor);
    setStartPoint(existing.startPoint);
    setStartCoords(
      coordsFromValues(existing.startLatitude, existing.startLongitude),
    );
    setDepartureTimeIda(existing.departureTimeIda);
    setArrivalTimeIda(existing.arrivalTimeIda);
    setDepartureTimeVolta(existing.departureTimeVolta);
    setArrivalTimeVolta(existing.arrivalTimeVolta);
    setPeriod(existing.period);
    setOperationType(existing.operationType ?? 'IDA_E_VOLTA');
    setSchoolId(existing.schoolId);
    setBoardingPoints(existing.boardingPoints ?? []);
    setResponsiblePhotoUri(existing.responsiblePhotoUri);
  }, [existing]);

  const canSubmit =
    title.trim().length > 0 &&
    responsible.trim().length > 0 &&
    monitor.trim().length > 0 &&
    startPoint.trim().length > 0 &&
    isValidHhMm(departureTimeIda) &&
    isValidHhMm(arrivalTimeIda) &&
    isValidHhMm(departureTimeVolta) &&
    isValidHhMm(arrivalTimeVolta) &&
    period !== null &&
    schoolId.length > 0;

  const checklist = [
    { label: 'Título', done: title.trim().length > 0 },
    { label: 'Responsável', done: responsible.trim().length > 0 },
    { label: 'Monitor', done: monitor.trim().length > 0 },
    { label: 'Ponto de início', done: startPoint.trim().length > 0 },
    { label: 'Horário de início da Ida (00:00–23:59)', done: isValidHhMm(departureTimeIda) },
    { label: 'Horário de término da Ida', done: isValidHhMm(arrivalTimeIda) },
    { label: 'Horário de início da Volta', done: isValidHhMm(departureTimeVolta) },
    { label: 'Horário de término da Volta', done: isValidHhMm(arrivalTimeVolta) },
    { label: 'Período', done: period !== null },
    { label: 'Escola', done: schoolId.length > 0 },
  ];

  const isDirty = isCreate
    ? title.length > 0 ||
      responsible.length > 0 ||
      monitor.length > 0 ||
      startPoint.length > 0 ||
      departureTimeIda.length > 0 ||
      boardingPoints.length > 0
    : Boolean(
        existing &&
          (title !== existing.title ||
            responsible !== existing.responsible ||
            monitor !== existing.monitor ||
            startPoint !== existing.startPoint ||
            departureTimeIda !== existing.departureTimeIda ||
            arrivalTimeIda !== existing.arrivalTimeIda ||
            departureTimeVolta !== existing.departureTimeVolta ||
            arrivalTimeVolta !== existing.arrivalTimeVolta ||
            period !== existing.period ||
            schoolId !== existing.schoolId),
      );

  const { allowNextLeave } = useLeaveConfirmation({
    shouldConfirm: isDirty,
    title: 'Sair do cadastro?',
    message: 'As alterações não salvas serão perdidas. Deseja sair mesmo assim?',
  });

  function handleAddPoint() {
    const normalized = pointDraft.trim();
    if (
      !normalized ||
      boardingPoints.some((point) => point.name.trim() === normalized)
    ) {
      return;
    }
    setBoardingPoints((current) => [
      ...current,
      createBoardingPoint(normalized, pendingCoords),
    ]);
    setPointDraft('');
    setPendingCoords(undefined);
  }

  async function captureCoords(
    apply: (coords: { latitude: number; longitude: number }) => void,
  ) {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        'Localização',
        'Permissão recusada. O ponto permanece sem GPS.',
      );
      return;
    }
    try {
      const position = await Location.getCurrentPositionAsync({});
      apply({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      Alert.alert(
        'Localização',
        'Não foi possível ler o GPS. O ponto permanece sem coordenadas novas.',
      );
    }
  }

  function handleRemovePoint(index: number) {
    setBoardingPoints((current) => current.filter((_, i) => i !== index));
  }

  function movePoint(index: number, delta: number) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= boardingPoints.length) {
      return;
    }
    setBoardingPoints((current) => {
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
    if (!canSubmit || period === null) {
      return;
    }

    const fields = {
      title: title.trim(),
      responsible: responsible.trim(),
      monitor: monitor.trim(),
      startPoint: startPoint.trim(),
      ...(startCoords
        ? {
            startLatitude: startCoords.latitude,
            startLongitude: startCoords.longitude,
          }
        : {}),
      boardingPoints,
      schoolId,
      departureTimeIda: departureTimeIda.trim(),
      arrivalTimeIda: arrivalTimeIda.trim(),
      departureTimeVolta: departureTimeVolta.trim(),
      arrivalTimeVolta: arrivalTimeVolta.trim(),
      period,
      operationType,
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

    allowNextLeave();
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
        <Pressable
          onPress={() => setMapTarget({ kind: 'start' })}
          className="mt-2 items-center rounded-2xl border border-brand bg-brand-light py-3">
          <Text className="text-sm font-semibold text-brand-dark">
            {startCoords
              ? 'Local de início marcado · tocar para ajustar'
              : 'Escolher início no mapa'}
          </Text>
        </Pressable>

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Turno da Ida
        </Text>
        <Text className="mb-2 text-xs text-slate-500">
          Horário de início e término na escola (00:00 às 23:59)
        </Text>
        <TimePickerField
          label="Início da Ida"
          value={departureTimeIda}
          onChange={setDepartureTimeIda}
          placeholder="Ex: 06:00"
        />
        <TimePickerField
          label="Término na escola"
          value={arrivalTimeIda}
          onChange={setArrivalTimeIda}
          placeholder="Ex: 07:10"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Turno da Volta
        </Text>
        <Text className="mb-2 text-xs text-slate-500">
          Horário de início na escola e término (00:00 às 23:59)
        </Text>
        <TimePickerField
          label="Início da Volta"
          value={departureTimeVolta}
          onChange={setDepartureTimeVolta}
          placeholder="Ex: 11:00"
        />
        <TimePickerField
          label="Término da Volta"
          value={arrivalTimeVolta}
          onChange={setArrivalTimeVolta}
          placeholder="Ex: 12:10"
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
          Tipo de operação
        </Text>
        <View className="gap-2">
          {OPERATION_OPTIONS.map((value) => {
            const selected = operationType === value;
            return (
              <Pressable
                key={value}
                onPress={() => setOperationType(value)}
                className={`items-center rounded-2xl border py-3 ${
                  selected
                    ? 'border-brand bg-brand-light'
                    : 'border-slate-200 bg-white'
                }`}>
                <Text
                  className={`text-sm font-semibold ${
                    selected ? 'text-brand-dark' : 'text-slate-600'
                  }`}>
                  {OPERATION_TYPE_LABEL[value]}
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
          Pontos de embarque
        </Text>
        <Text className="mb-2 text-xs text-slate-500">
          Digite o nome, marque o local no mapa e toque em +. Não precisa ir até
          a rua.
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={pointDraft}
            onChangeText={setPointDraft}
            placeholder="Adicionar ponto de embarque"
            placeholderTextColor="#94A3B8"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
          />
          <Pressable
            onPress={handleAddPoint}
            className="h-14 w-14 items-center justify-center rounded-2xl bg-brand">
            <Text className="text-2xl font-bold text-white">+</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => setMapTarget({ kind: 'draft' })}
          className="mt-2 items-center rounded-2xl border border-brand bg-brand-light py-3">
          <Text className="text-sm font-semibold text-brand-dark">
            {pendingCoords
              ? 'Local marcado no mapa · tocar para ajustar'
              : 'Escolher no mapa'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            captureCoords((coords) => {
              setPendingCoords(coords);
            })
          }
          className="mt-2 items-center py-2">
          <Text className="text-xs font-semibold text-slate-500">
            Estou neste local agora (GPS do aparelho)
          </Text>
        </Pressable>
        {boardingPoints.map((point, index) => (
          <View
            key={point.id}
            className="mt-2 flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <View className="mr-1">
              <Pressable
                disabled={index === 0}
                onPress={() => movePoint(index, -1)}
                className="h-8 w-8 items-center justify-center">
                <Feather
                  name="chevron-up"
                  size={20}
                  color={index === 0 ? '#CBD5E1' : '#0F6B4D'}
                />
              </Pressable>
              <Pressable
                disabled={index === boardingPoints.length - 1}
                onPress={() => movePoint(index, 1)}
                className="h-8 w-8 items-center justify-center">
                <Feather
                  name="chevron-down"
                  size={20}
                  color={index === boardingPoints.length - 1 ? '#CBD5E1' : '#0F6B4D'}
                />
              </Pressable>
            </View>
            <View className="flex-1">
              <Text className="text-base text-slate-900">{point.name}</Text>
              <Text className="text-xs text-slate-500">
                {hasCoordinates(point) ? 'Local no mapa' : 'Sem local no mapa'}
              </Text>
            </View>
            <Pressable
              onPress={() => setMapTarget({ kind: 'edit', index })}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center">
              <Feather name="map-pin" size={20} color="#0F6B4D" />
            </Pressable>
            <Pressable
              onPress={() => handleRemovePoint(index)}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center">
              <Feather name="x" size={20} color="#DC2626" />
            </Pressable>
          </View>
        ))}

        <FieldChecklist items={checklist} />
        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`mt-8 items-center rounded-2xl py-5 ${
            canSubmit ? 'bg-brand' : 'bg-slate-300'
          }`}>
          <Text className="text-lg font-bold text-white">Salvar</Text>
        </Pressable>
      </ScrollView>
      <BoardingPointMapPicker
        visible={mapTarget !== null}
        title={
          mapTarget?.kind === 'start'
            ? 'Local do ponto de início'
            : mapTarget?.kind === 'edit' && boardingPoints[mapTarget.index]
              ? boardingPoints[mapTarget.index].name
              : 'Local do ponto de embarque'
        }
        searchHint={
          mapTarget?.kind === 'start'
            ? startPoint
            : mapTarget?.kind === 'edit' && boardingPoints[mapTarget.index]
              ? boardingPoints[mapTarget.index].name
              : pointDraft
        }
        initialCoords={
          mapTarget?.kind === 'start'
            ? startCoords
            : mapTarget?.kind === 'edit' && boardingPoints[mapTarget.index]
              ? pointCoords(boardingPoints[mapTarget.index])
              : pendingCoords
        }
        onClose={() => setMapTarget(null)}
        onConfirm={(coords) => {
          if (mapTarget?.kind === 'start') {
            setStartCoords(coords);
          } else if (mapTarget?.kind === 'edit') {
            const index = mapTarget.index;
            setBoardingPoints((current) =>
              current.map((item, i) =>
                i === index ? { ...item, ...coords } : item,
              ),
            );
          } else {
            setPendingCoords(coords);
          }
          setMapTarget(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

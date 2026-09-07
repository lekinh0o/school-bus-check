import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

import { BusSeatMap } from '@/components/BusSeatMap';
import { selectAllRoutes, selectRouteById, updateRoute } from '@/store/routeSlice';
import { selectAllSchools, updateSchool } from '@/store/schoolSlice';
import {
  addStudent,
  selectStudentById,
  updateStudent,
} from '@/store/studentSlice';
import { useAppDispatch, useAppSelector, persistor } from '@/store/store';
import {
  assignSeat,
  removeSeat,
  selectAllVehicles,
  selectVehicleById,
} from '@/store/vehicleSlice';
import {
  formatPhoneBr,
  isValidPhoneBr,
  parsePositiveInt,
} from '@/lib/inputMasks';
import { pickLocalImage } from '@/lib/pickImage';

function withId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

function withoutId(ids: string[], id: string): string[] {
  return ids.filter((item) => item !== id);
}

export default function StudentFormScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isCreate = id === 'new';

  const existing = useAppSelector((state) =>
    !isCreate && id ? selectStudentById(state, id) : undefined,
  );
  const schools = useAppSelector(selectAllSchools);
  const allRoutes = useAppSelector(selectAllRoutes);
  const vehicles = useAppSelector(selectAllVehicles);

  const [name, setName] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [responsible, setResponsible] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [grade, setGrade] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [boardingStreet, setBoardingStreet] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [seatNumber, setSeatNumber] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  useEffect(() => {
    if (!existing) {
      return;
    }
    setName(existing.name);
    setAgeInput(String(existing.age));
    setResponsible(existing.responsible);
    setPhone1(formatPhoneBr(existing.contactPhones[0] ?? ''));
    setPhone2(formatPhoneBr(existing.contactPhones[1] ?? ''));
    setGrade(existing.grade);
    setSchoolId(existing.schoolId);
    setRouteId(existing.routeId);
    setBoardingStreet(existing.boardingStreet);
    setVehicleId(existing.vehicleId);
    setSeatNumber(existing.seatNumber);
    setPhotoUri(existing.photoUri);
  }, [existing]);

  const routesForSchool = useMemo(
    () => allRoutes.filter((route) => route.schoolId === schoolId),
    [allRoutes, schoolId],
  );

  const selectedRoute = useAppSelector((state) =>
    routeId ? selectRouteById(state, routeId) : undefined,
  );
  const selectedVehicle = useAppSelector((state) =>
    vehicleId ? selectVehicleById(state, vehicleId) : undefined,
  );

  const streetName = boardingStreet.trim();
  const age = parsePositiveInt(ageInput);

  const canSubmit =
    name.trim().length > 0 &&
    age !== null &&
    responsible.trim().length > 0 &&
    isValidPhoneBr(phone1) &&
    isValidPhoneBr(phone2) &&
    grade.trim().length > 0 &&
    schoolId.length > 0 &&
    routeId.length > 0 &&
    streetName.length > 0 &&
    vehicleId.length > 0 &&
    seatNumber !== null;

  const missingFields: string[] = [];
  if (name.trim().length === 0) missingFields.push('nome');
  if (age === null) missingFields.push('idade');
  if (responsible.trim().length === 0) missingFields.push('responsável');
  if (!isValidPhoneBr(phone1)) missingFields.push('telefone 1');
  if (!isValidPhoneBr(phone2)) missingFields.push('telefone 2');
  if (grade.trim().length === 0) missingFields.push('série');
  if (!schoolId) missingFields.push('escola');
  if (!routeId) missingFields.push('rota');
  if (!streetName) missingFields.push('rua de embarque');
  if (!vehicleId) missingFields.push('veículo');
  if (seatNumber === null) missingFields.push('assento');

  function handleSelectSchool(nextId: string) {
    setSchoolId(nextId);
    setRouteId('');
    setBoardingStreet('');
  }

  function handleSelectRoute(nextId: string) {
    setRouteId(nextId);
    setBoardingStreet('');
  }

  function handleSelectVehicle(nextId: string) {
    setVehicleId(nextId);
    if (existing && existing.vehicleId === nextId) {
      setSeatNumber(existing.seatNumber);
      return;
    }
    setSeatNumber(null);
  }

  async function handlePickPhoto() {
    const uri = await pickLocalImage([1, 1]);
    if (uri) {
      setPhotoUri(uri);
    }
  }

  function handleSubmit() {
    if (!canSubmit || seatNumber === null || age === null) {
      return;
    }

    const extraPhones = existing?.contactPhones.slice(2) ?? [];
    const fields = {
      name: name.trim(),
      age,
      responsible: responsible.trim(),
      contactPhones: [formatPhoneBr(phone1), formatPhoneBr(phone2), ...extraPhones],
      schoolId,
      grade: grade.trim(),
      routeId,
      boardingStreet: streetName,
      vehicleId,
      seatNumber,
      photoUri,
    };

    function appendStreetIfNeeded() {
      if (!selectedRoute || selectedRoute.streetsCovered.includes(streetName)) {
        return;
      }
      dispatch(
        updateRoute({
          id: selectedRoute.id,
          changes: {
            streetsCovered: [...selectedRoute.streetsCovered, streetName],
          },
        }),
      );
    }

    if (isCreate) {
      const newId = Date.now().toString();
      dispatch(addStudent({ id: newId, ...fields }));
      dispatch(assignSeat({ vehicleId, seatNumber, studentId: newId }));
      const school = schools.find((item) => item.id === schoolId);
      if (school) {
        dispatch(
          updateSchool({
            id: school.id,
            changes: { studentIds: withId(school.studentIds, newId) },
          }),
        );
      }
      appendStreetIfNeeded();
    } else if (id && existing) {
      if (
        existing.vehicleId !== vehicleId ||
        existing.seatNumber !== seatNumber
      ) {
        dispatch(
          removeSeat({
            vehicleId: existing.vehicleId,
            seatNumber: existing.seatNumber,
          }),
        );
      }
      dispatch(updateStudent({ id, changes: fields }));
      dispatch(assignSeat({ vehicleId, seatNumber, studentId: id }));
      if (existing.schoolId !== schoolId) {
        const previous = schools.find((item) => item.id === existing.schoolId);
        if (previous) {
          dispatch(
            updateSchool({
              id: previous.id,
              changes: { studentIds: withoutId(previous.studentIds, id) },
            }),
          );
        }
        const next = schools.find((item) => item.id === schoolId);
        if (next) {
          dispatch(
            updateSchool({
              id: next.id,
              changes: { studentIds: withId(next.studentIds, id) },
            }),
          );
        }
      }
      appendStreetIfNeeded();
    }

    void persistor.flush();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/students' as Href);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{ title: isCreate ? 'Novo aluno' : 'Editar aluno' }}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-10"
        keyboardShouldPersistTaps="handled">
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            className="mb-4 h-24 w-24 self-center rounded-full bg-slate-200"
          />
        ) : null}
        <Pressable
          onPress={handlePickPhoto}
          className="mb-4 items-center rounded-2xl border border-brand bg-brand-light py-4">
          <Text className="text-base font-semibold text-brand-dark">Foto do Aluno</Text>
        </Pressable>

        <Text className="mb-2 text-sm font-semibold text-slate-700">Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nome completo"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">Idade</Text>
        <TextInput
          value={ageInput}
          onChangeText={(value) => setAgeInput(value.replace(/[^\d]/g, '').slice(0, 2))}
          keyboardType="number-pad"
          placeholder="8"
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
          Telefone 1
        </Text>
        <TextInput
          value={phone1}
          onChangeText={(value) => setPhone1(formatPhoneBr(value))}
          keyboardType="phone-pad"
          placeholder="(31) 99999-9999"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Telefone 2
        </Text>
        <TextInput
          value={phone2}
          onChangeText={(value) => setPhone2(formatPhoneBr(value))}
          keyboardType="phone-pad"
          placeholder="(31) 3333-3333"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Série / Ano
        </Text>
        <TextInput
          value={grade}
          onChangeText={setGrade}
          placeholder="5º ano"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">Escola</Text>
        {schools.map((school) => {
          const selected = schoolId === school.id;
          return (
            <Pressable
              key={school.id}
              onPress={() => handleSelectSchool(school.id)}
              className={`mb-2 rounded-2xl border px-4 py-4 ${
                selected ? 'border-brand bg-brand-light' : 'border-slate-200 bg-white'
              }`}>
              <Text
                className={`text-base font-semibold ${
                  selected ? 'text-brand-dark' : 'text-slate-900'
                }`}>
                {school.name}
              </Text>
            </Pressable>
          );
        })}

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">Rota</Text>
        {!schoolId ? (
          <Text className="text-sm text-slate-500">Escolha uma escola primeiro.</Text>
        ) : routesForSchool.length === 0 ? (
          <Text className="text-sm text-slate-500">
            Esta escola ainda não tem rotas cadastradas.
          </Text>
        ) : (
          routesForSchool.map((route) => {
            const selected = routeId === route.id;
            return (
              <Pressable
                key={route.id}
                onPress={() => handleSelectRoute(route.id)}
                className={`mb-2 rounded-2xl border px-4 py-4 ${
                  selected ? 'border-brand bg-brand-light' : 'border-slate-200 bg-white'
                }`}>
                <Text
                  className={`text-base font-semibold ${
                    selected ? 'text-brand-dark' : 'text-slate-900'
                  }`}>
                  {route.title}
                </Text>
              </Pressable>
            );
          })
        )}

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Rua de embarque
        </Text>
        {selectedRoute && selectedRoute.streetsCovered.length > 0 ? (
          <View className="mb-3 flex-row flex-wrap gap-2">
            {selectedRoute.streetsCovered.map((street) => {
              const selected = boardingStreet.trim() === street;
              return (
                <Pressable
                  key={street}
                  onPress={() => setBoardingStreet(street)}
                  className={`rounded-full border px-3 py-2 ${
                    selected
                      ? 'border-brand bg-brand-light'
                      : 'border-slate-200 bg-white'
                  }`}>
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-brand-dark' : 'text-slate-700'
                    }`}>
                    {street}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <TextInput
          value={boardingStreet}
          onChangeText={setBoardingStreet}
          placeholder="Digite a rua ou toque numa sugestão"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">Veículo</Text>
        {vehicles.map((vehicle) => {
          const selected = vehicleId === vehicle.id;
          return (
            <Pressable
              key={vehicle.id}
              onPress={() => handleSelectVehicle(vehicle.id)}
              className={`mb-2 rounded-2xl border px-4 py-4 ${
                selected ? 'border-brand bg-brand-light' : 'border-slate-200 bg-white'
              }`}>
              <Text
                className={`text-base font-semibold ${
                  selected ? 'text-brand-dark' : 'text-slate-900'
                }`}>
                {vehicle.plate}
              </Text>
            </Pressable>
          );
        })}

        {selectedVehicle ? (
          <View className="mt-4">
            <Text className="mb-3 text-center text-sm font-semibold text-slate-700">
              Mapa de assentos
            </Text>
            <BusSeatMap
              seatsMap={selectedVehicle.seatsMap}
              selectedSeat={seatNumber}
              currentStudentId={isCreate ? undefined : id}
              onSelectSeat={setSeatNumber}
            />
          </View>
        ) : null}

        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`mt-8 items-center rounded-2xl py-5 ${
            canSubmit ? 'bg-brand' : 'bg-slate-300'
          }`}>
          <Text className="text-lg font-bold text-white">Salvar</Text>
        </Pressable>
        {!canSubmit ? (
          <Text className="mt-3 text-center text-sm text-slate-500">
            Falta preencher: {missingFields.join(', ')}. Telefones precisam de
            DDD e pelo menos 10 dígitos. Escolha um assento livre no mapa após
            o veículo.
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

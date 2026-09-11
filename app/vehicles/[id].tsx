import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
import { FieldChecklist } from '@/components/FieldChecklist';
import { useLeaveConfirmation } from '@/hooks/useLeaveConfirmation';
import { addVehicle, selectVehicleById, updateVehicle } from '@/store/vehicleSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { SeatAssignment, Vehicle } from '@/types';
import { formatPlate, isValidPlate, parsePositiveInt } from '@/lib/inputMasks';
import { pickLocalImage } from '@/lib/pickImage';

const MAX_SEATS = 60;

function buildSeatsMap(
  totalSeats: number,
  current: SeatAssignment[] = [],
): SeatAssignment[] {
  return Array.from({ length: totalSeats }, (_, index) => {
    const seatNumber = index + 1;
    const previous = current.find((seat) => seat.seatNumber === seatNumber);
    return previous ?? { seatNumber, studentId: null };
  });
}

export default function VehicleFormScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isCreate = id === 'new';

  const existing = useAppSelector((state) =>
    !isCreate && id ? selectVehicleById(state, id) : undefined,
  );

  const [plate, setPlate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [totalSeatsInput, setTotalSeatsInput] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  useEffect(() => {
    if (!existing) {
      return;
    }
    setPlate(existing.plate);
    setResponsible(existing.responsible);
    setTotalSeatsInput(String(existing.totalSeats));
    setPhotoUri(existing.photoUri);
  }, [existing]);

  const seatCount = useMemo(() => {
    const parsed = parsePositiveInt(totalSeatsInput);
    if (parsed === null) {
      return 0;
    }
    return Math.min(parsed, MAX_SEATS);
  }, [totalSeatsInput]);

  const previewSeats = useMemo(
    () => buildSeatsMap(seatCount, existing?.seatsMap),
    [seatCount, existing?.seatsMap],
  );
  const occupiedCount = previewSeats.filter(
    (seat) => seat.studentId != null && seat.studentId.length > 0,
  ).length;

  const canSubmit =
    isValidPlate(plate) && responsible.trim().length > 0 && seatCount > 0;

  const checklist = [
    { label: 'Placa válida', done: isValidPlate(plate) },
    { label: 'Responsável', done: responsible.trim().length > 0 },
    { label: 'Quantidade de assentos', done: seatCount > 0 },
  ];

  const isDirty = isCreate
    ? plate.length > 0 || responsible.length > 0 || totalSeatsInput.length > 0
    : Boolean(
        existing &&
          (plate !== existing.plate ||
            responsible !== existing.responsible ||
            totalSeatsInput !== String(existing.totalSeats) ||
            photoUri !== existing.photoUri),
      );

  const { allowNextLeave } = useLeaveConfirmation({
    shouldConfirm: isDirty,
    title: 'Sair do cadastro?',
    message: 'As alterações não salvas serão perdidas. Deseja sair mesmo assim?',
  });

  async function handlePickPhoto() {
    const uri = await pickLocalImage([4, 3]);
    if (uri) {
      setPhotoUri(uri);
    }
  }

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    const payload: Omit<Vehicle, 'id'> = {
      plate: formatPlate(plate),
      responsible: responsible.trim(),
      totalSeats: seatCount,
      seatsMap: previewSeats,
      photoUri,
    };

    if (isCreate) {
      dispatch(
        addVehicle({
          id: Date.now().toString(),
          ...payload,
        }),
      );
    } else if (id) {
      dispatch(
        updateVehicle({
          id,
          changes: payload,
        }),
      );
    }

    allowNextLeave();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/cadastros');
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{ title: isCreate ? 'Cadastrar veículo' : 'Editar veículo' }}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-10"
        keyboardShouldPersistTaps="handled">
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            className="mb-4 h-40 w-full rounded-2xl bg-slate-200"
            resizeMode="cover"
          />
        ) : null}

        <Pressable
          onPress={handlePickPhoto}
          className="mb-2 items-center rounded-2xl border border-brand bg-brand-light py-4">
          <Text className="text-base font-semibold text-brand-dark">
            Adicionar Foto do Veículo
          </Text>
        </Pressable>

        <Text className="mt-4 mb-2 text-sm font-semibold text-slate-700">Placa</Text>
        <TextInput
          value={plate}
          onChangeText={(value) => setPlate(formatPlate(value))}
          autoCapitalize="characters"
          placeholder="ABC1D23 ou ABC-1234"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Responsável
        </Text>
        <TextInput
          value={responsible}
          onChangeText={setResponsible}
          placeholder="Nome do motorista ou monitor"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Quantidade de assentos
        </Text>
        <TextInput
          value={totalSeatsInput}
          onChangeText={(value) =>
            setTotalSeatsInput(value.replace(/[^\d]/g, '').slice(0, 2))
          }
          keyboardType="number-pad"
          placeholder="Ex: 16"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        {seatCount > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-center text-sm font-semibold text-slate-700">
              Mapa de assentos · {occupiedCount} ocupados de {seatCount}
            </Text>
            <BusSeatMap seatsMap={previewSeats} />
          </View>
        ) : null}

        <FieldChecklist items={checklist} />
        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`mt-8 items-center rounded-2xl py-5 ${
            canSubmit ? 'bg-brand' : 'bg-slate-300'
          }`}>
          <Text className="text-lg font-bold text-white">
            {isCreate ? 'Cadastrar Veículo' : 'Salvar alterações'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

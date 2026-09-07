import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SeatMapPicker } from '@/components/SeatMapPicker';
import { removeVehicle, selectAllVehicles } from '@/store/vehicleSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { Vehicle } from '@/types';

type VehicleListModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (vehicleId: string) => void;
};

function freeSeatsCount(vehicle: Vehicle) {
  return vehicle.seatsMap.filter((seat) => seat.studentId === null).length;
}

export function VehicleListModal({
  visible,
  onClose,
  onSelect,
}: VehicleListModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(selectAllVehicles);

  function handleSelect(vehicleId: string) {
    onSelect(vehicleId);
    onClose();
  }

  function handleCreateVehicle() {
    onClose();
    router.push('/vehicles/new' as Href);
  }

  function handleEdit(vehicleId: string) {
    onClose();
    router.push(`/vehicles/${vehicleId}` as Href);
  }

  function handleDelete(vehicle: Vehicle) {
    Alert.alert(
      'Excluir veículo',
      `Deseja excluir o veículo ${vehicle.plate}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => dispatch(removeVehicle(vehicle.id)),
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">Veículos</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Text className="text-lg font-semibold text-slate-600">✕</Text>
            </Pressable>
          </View>

          {vehicles.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-center text-base text-slate-500">
                Nenhum veículo cadastrado ainda. Cadastre a van para começar a
                chamada.
              </Text>
              <Pressable
                onPress={handleCreateVehicle}
                className="mt-6 w-full items-center rounded-2xl bg-brand py-4">
                <Text className="text-base font-bold text-white">
                  Cadastrar veículo
                </Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {vehicles.map((vehicle) => {
                const free = freeSeatsCount(vehicle);
                return (
                  <View
                    key={vehicle.id}
                    className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <Pressable
                      onPress={() => handleSelect(vehicle.id)}
                      className="flex-row items-center">
                      {vehicle.photoUri ? (
                        <Image
                          source={{ uri: vehicle.photoUri }}
                          className="h-14 w-14 rounded-full bg-slate-200"
                        />
                      ) : (
                        <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-light">
                          <Text className="text-lg">🚌</Text>
                        </View>
                      )}
                      <View className="ml-3 flex-1">
                        <Text className="text-lg font-bold text-slate-900">
                          {vehicle.plate}
                        </Text>
                        <Text className="text-sm text-slate-500">
                          {vehicle.responsible}
                        </Text>
                        <Text className="mt-1 text-sm font-semibold text-brand">
                          {free} assentos livres de {vehicle.totalSeats}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleEdit(vehicle.id)}
                        hitSlop={8}
                        className="h-10 w-10 items-center justify-center">
                        <Feather name="edit-2" size={20} color="#0F6B4D" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(vehicle)}
                        hitSlop={8}
                        className="h-10 w-10 items-center justify-center">
                        <Feather name="trash-2" size={20} color="#DC2626" />
                      </Pressable>
                    </Pressable>
                    {vehicle.seatsMap?.length ? (
                      <View className="mt-3">
                        <SeatMapPicker seatsMap={vehicle.seatsMap} />
                      </View>
                    ) : null}
                  </View>
                );
              })}
              <Pressable
                onPress={handleCreateVehicle}
                className="mb-2 mt-1 items-center rounded-2xl bg-brand py-4">
                <Text className="text-base font-bold text-white">Novo veículo</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
});

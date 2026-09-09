import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { startRouteExecution } from '@/store/attendanceSlice';
import { selectAllStudents } from '@/store/studentSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { Route, RouteDirection } from '@/types';

type StartRouteSheetProps = {
  route: Route | null;
  visible: boolean;
  onClose: () => void;
};

export function StartRouteSheet({
  route,
  visible,
  onClose,
}: StartRouteSheetProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const allStudents = useAppSelector(selectAllStudents);
  const [direction, setDirection] = useState<RouteDirection>('IDA');

  function handleStart() {
    if (!route) {
      return;
    }
    const routeStudents = allStudents.filter(
      (student) => student.routeId === route.id,
    );
    dispatch(
      startRouteExecution({
        routeId: route.id,
        schoolId: route.schoolId,
        direction,
        boardingPoints: route.boardingPoints,
        students: routeStudents.map((student) => ({
          studentId: student.id,
          boardingPoint: student.boardingPoint,
        })),
      }),
    );
    onClose();
    router.push(`/routes/execute/${route.id}` as Href);
  }

  return (
    <Modal
      visible={visible && route !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          onPress={() => undefined}
          className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
          <Text className="text-lg font-bold text-slate-900">
            {route?.title}
          </Text>
          <Text className="mt-1 text-sm text-slate-500">
            Escolha o sentido e inicie o trajeto.
          </Text>
          <View className="mt-4 flex-row gap-2">
            <Pressable
              onPress={() => setDirection('IDA')}
              className={`flex-1 items-center rounded-2xl border py-4 ${
                direction === 'IDA'
                  ? 'border-brand bg-brand-light'
                  : 'border-slate-200 bg-white'
              }`}>
              <Text className="text-base font-bold text-slate-900">IDA</Text>
              <Text className="mt-1 text-xs text-slate-500">Casa → Escola</Text>
            </Pressable>
            <Pressable
              onPress={() => setDirection('VOLTA')}
              className={`flex-1 items-center rounded-2xl border py-4 ${
                direction === 'VOLTA'
                  ? 'border-brand bg-brand-light'
                  : 'border-slate-200 bg-white'
              }`}>
              <Text className="text-base font-bold text-slate-900">VOLTA</Text>
              <Text className="mt-1 text-xs text-slate-500">Escola → Casa</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleStart}
            className="mt-5 items-center rounded-2xl bg-brand py-4">
            <Text className="text-base font-bold text-white">Iniciar Trajeto</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

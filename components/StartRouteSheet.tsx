import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import {
  justifyIncompleteCycle,
  selectHasCompletedIdaToday,
  selectIncompleteIdaTrip,
  startRouteExecution,
} from '@/store/attendanceSlice';
import { selectAllStudents } from '@/store/studentSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { Route, RouteDirection } from '@/types';
import type { CycleJustification } from '@/types/execution';
import { formatLocalDate } from '@/lib/localDate';
import {
  allowedDirections,
  resolveOperationType,
} from '@/lib/operationType';
import { formatRouteTimeWindow } from '@/lib/routeSchedule';

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
  const hasIdaToday = useAppSelector((state) =>
    selectHasCompletedIdaToday(state, route?.id ?? ''),
  );
  const incompleteIda = useAppSelector((state) =>
    selectIncompleteIdaTrip(state, route?.id ?? ''),
  );
  const operationType = route
    ? resolveOperationType(route)
    : 'IDA_E_VOLTA';
  const directions = allowedDirections(operationType);
  const [direction, setDirection] = useState<RouteDirection>('IDA');
  const [justifyOpen, setJustifyOpen] = useState(false);
  const [incompleteOpen, setIncompleteOpen] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [cycleNote, setCycleNote] = useState('');

  useEffect(() => {
    if (!route || !visible) {
      return;
    }
    const next = allowedDirections(resolveOperationType(route));
    setDirection(next[0]);
    setJustifyOpen(false);
    setIncompleteOpen(false);
    setFreeText('');
    setCycleNote('');
  }, [route?.id, visible]);

  function beginTrip(justification?: CycleJustification) {
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
        startPoint: route.startPoint,
        boardingPoints: route.boardingPoints,
        students: routeStudents.map((student) => ({
          studentId: student.id,
          boardingPoint: student.boardingPoint,
        })),
        ...(justification ? { cycleJustification: justification } : {}),
      }),
    );
    setJustifyOpen(false);
    setIncompleteOpen(false);
    setFreeText('');
    setCycleNote('');
    onClose();
    router.push(`/routes/execute/${route.id}` as Href);
  }

  function startNewIdaAfterJustify(justification: CycleJustification) {
    if (!route) {
      return;
    }
    dispatch(
      justifyIncompleteCycle({
        routeId: route.id,
        justification,
      }),
    );
    beginTrip();
  }

  function handleStart() {
    if (!route) {
      return;
    }
    if (
      direction === 'VOLTA' &&
      operationType === 'IDA_E_VOLTA' &&
      !hasIdaToday
    ) {
      setJustifyOpen(true);
      return;
    }
    if (
      direction === 'IDA' &&
      operationType === 'IDA_E_VOLTA' &&
      incompleteIda
    ) {
      setIncompleteOpen(true);
      return;
    }
    beginTrip();
  }

  function handleClose() {
    setJustifyOpen(false);
    setIncompleteOpen(false);
    setFreeText('');
    setCycleNote('');
    onClose();
  }

  return (
    <>
      <Modal
        visible={visible && route !== null}
        animationType="slide"
        transparent
        onRequestClose={handleClose}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={handleClose}>
          <Pressable
            onPress={() => undefined}
            className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
            <Text className="text-lg font-bold text-slate-900">
              {route?.title}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              Escolha o sentido e inicie o trajeto.
            </Text>
            <Text className="mt-2 text-sm font-semibold text-brand-dark">
              {route
                ? `${direction === 'IDA' ? 'Ida' : 'Volta'} · ${formatRouteTimeWindow(route, direction)}`
                : ''}
            </Text>
            <View className="mt-4 flex-row gap-2">
              {directions.includes('IDA') ? (
                <Pressable
                  onPress={() => setDirection('IDA')}
                  className={`flex-1 items-center rounded-2xl border py-4 ${
                    direction === 'IDA'
                      ? 'border-brand bg-brand-light'
                      : 'border-slate-200 bg-white'
                  }`}>
                  <Text className="text-base font-bold text-slate-900">IDA</Text>
                  <Text className="mt-1 text-xs text-slate-500">
                    Casa → Escola
                  </Text>
                </Pressable>
              ) : null}
              {directions.includes('VOLTA') ? (
                <Pressable
                  onPress={() => setDirection('VOLTA')}
                  className={`flex-1 items-center rounded-2xl border py-4 ${
                    direction === 'VOLTA'
                      ? 'border-brand bg-brand-light'
                      : 'border-slate-200 bg-white'
                  }`}>
                  <Text className="text-base font-bold text-slate-900">
                    VOLTA
                  </Text>
                  <Text className="mt-1 text-xs text-slate-500">
                    Escola → Casa
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Pressable
              onPress={handleStart}
              className="mt-5 items-center rounded-2xl bg-brand py-4">
              <Text className="text-base font-bold text-white">
                Iniciar Trajeto
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={justifyOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setJustifyOpen(false)}>
        <View className="flex-1 justify-center bg-black/50 px-6">
          <View className="rounded-2xl bg-white p-5">
            <Text className="text-lg font-bold text-slate-900">
              Nenhuma IDA hoje
            </Text>
            <Text className="mt-2 text-sm text-slate-600">
              Não há IDA encerrada desta rota no dia. Informe o motivo para
              iniciar a VOLTA.
            </Text>
            <Pressable
              onPress={() => beginTrip({ kind: 'forgot_morning' })}
              className="mt-4 items-center rounded-xl bg-brand py-3">
              <Text className="text-sm font-bold text-white">
                Esqueci de iniciar de manhã
              </Text>
            </Pressable>
            <Pressable
              onPress={() => beginTrip({ kind: 'afternoon_only' })}
              className="mt-2 items-center rounded-xl border border-slate-300 py-3">
              <Text className="text-sm font-bold text-slate-800">
                Período exclusivo à tarde
              </Text>
            </Pressable>
            <Text className="mt-4 text-xs font-semibold text-slate-500">
              Justificativa em texto livre
            </Text>
            <TextInput
              value={freeText}
              onChangeText={setFreeText}
              placeholder="Descreva o motivo"
              className="mt-2 rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-900"
            />
            <Pressable
              disabled={freeText.trim().length === 0}
              onPress={() =>
                beginTrip({ kind: 'free_text', note: freeText.trim() })
              }
              className={`mt-2 items-center rounded-xl py-3 ${
                freeText.trim().length === 0 ? 'bg-slate-300' : 'bg-orange-500'
              }`}>
              <Text className="text-sm font-bold text-white">Confirmar texto</Text>
            </Pressable>
            <Pressable
              onPress={() => setJustifyOpen(false)}
              className="mt-3 items-center py-2">
              <Text className="text-sm font-semibold text-slate-500">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={incompleteOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIncompleteOpen(false)}>
        <View className="flex-1 justify-center bg-black/50 px-6">
          <View className="rounded-2xl bg-white p-5">
            <Text className="text-lg font-bold text-slate-900">
              Ciclo Anterior Incompleto
            </Text>
            <Text className="mt-2 text-sm text-slate-600">
              {route?.title}
              {incompleteIda
                ? ` · ${formatLocalDate(incompleteIda.startedAt)}`
                : ''}
            </Text>
            <Text className="mt-2 text-sm text-slate-600">
              Há uma Ida sem Volta posterior. Informe o motivo para iniciar uma
              nova Ida.
            </Text>
            <Pressable
              onPress={() =>
                startNewIdaAfterJustify({ kind: 'return_done_offline' })
              }
              className="mt-4 items-center rounded-xl bg-brand py-3">
              <Text className="text-sm font-bold text-white">
                Volta realizada sem o app
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                startNewIdaAfterJustify({ kind: 'period_cancelled' })
              }
              className="mt-2 items-center rounded-xl border border-slate-300 py-3">
              <Text className="text-sm font-bold text-slate-800">
                Período cancelado/Feriado
              </Text>
            </Pressable>
            <Text className="mt-4 text-xs font-semibold text-slate-500">
              Outro
            </Text>
            <TextInput
              value={cycleNote}
              onChangeText={setCycleNote}
              placeholder="Descreva o motivo"
              className="mt-2 rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-900"
            />
            <Pressable
              disabled={cycleNote.trim().length === 0}
              onPress={() =>
                startNewIdaAfterJustify({
                  kind: 'free_text',
                  note: cycleNote.trim(),
                })
              }
              className={`mt-2 items-center rounded-xl py-3 ${
                cycleNote.trim().length === 0 ? 'bg-slate-300' : 'bg-orange-500'
              }`}>
              <Text className="text-sm font-bold text-white">Confirmar</Text>
            </Pressable>
            <Pressable
              onPress={() => setIncompleteOpen(false)}
              className="mt-3 items-center py-2">
              <Text className="text-sm font-semibold text-slate-500">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

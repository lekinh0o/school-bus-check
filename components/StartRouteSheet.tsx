import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';

import {
  justifyIncompleteCycle,
  selectActiveExecution,
  selectHasCompletedIdaToday,
  selectIncompleteIdaTrip,
  startRouteExecution,
} from '@/store/attendanceSlice';
import { selectAllStudents } from '@/store/studentSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { Route, RouteDirection } from '@/types';
import type { CycleJustification } from '@/types/execution';
import { boardingPointNames } from '@/lib/boardingPoints';
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
  initialDirection?: RouteDirection;
  openIncompleteOnShow?: boolean;
};

export function StartRouteSheet({
  route,
  visible,
  onClose,
  initialDirection,
  openIncompleteOnShow = false,
}: StartRouteSheetProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeExecution = useAppSelector(selectActiveExecution);
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
  const [incompleteLabel, setIncompleteLabel] = useState('');
  const [freeText, setFreeText] = useState('');
  const [cycleNote, setCycleNote] = useState('');

  useEffect(() => {
    if (!route || !visible) {
      return;
    }
    const next = allowedDirections(resolveOperationType(route));
    const preferred =
      initialDirection && next.includes(initialDirection)
        ? initialDirection
        : next[0];
    setDirection(preferred);
    setJustifyOpen(false);
    const showIncomplete = Boolean(openIncompleteOnShow && incompleteIda);
    setIncompleteOpen(showIncomplete);
    setIncompleteLabel(
      incompleteIda
        ? `${route.title} · ${formatLocalDate(incompleteIda.startedAt)}`
        : route.title,
    );
    setFreeText('');
    setCycleNote('');
    // incompleteIda só é lido na abertura da sheet; se entrar nas deps, a
    // justificativa fecha a pendência e reseta o fluxo no meio da confirmação.
  }, [route?.id, visible, initialDirection, openIncompleteOnShow]);

  function beginTrip(justification?: CycleJustification) {
    if (!route) {
      return;
    }
    if (
      activeExecution?.status === 'IN_PROGRESS' &&
      activeExecution.routeId === route.id &&
      activeExecution.direction === direction
    ) {
      setJustifyOpen(false);
      setIncompleteOpen(false);
      onClose();
      router.push(`/routes/execute/${route.id}` as Href);
      return;
    }
    if (activeExecution?.status === 'IN_PROGRESS') {
      Alert.alert(
        'Execução em andamento',
        'Há uma chamada salva. Continuar a atual ou substituir por esta rota?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar atual',
            onPress: () => {
              onClose();
              router.push(`/routes/execute/${activeExecution.routeId}` as Href);
            },
          },
          {
            text: 'Substituir',
            style: 'destructive',
            onPress: () => startFresh(justification),
          },
        ],
      );
      return;
    }
    startFresh(justification);
  }

  function startFresh(
    justification?: CycleJustification,
    tripDirection: RouteDirection = direction,
  ) {
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
        direction: tripDirection,
        startPoint: route.startPoint,
        boardingPoints: boardingPointNames(route.boardingPoints),
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
    setDirection('IDA');
    dispatch(
      justifyIncompleteCycle({
        routeId: route.id,
        justification,
      }),
    );
    startFresh(undefined, 'IDA');
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
      setIncompleteLabel(
        `${route.title} · ${formatLocalDate(incompleteIda.startedAt)}`,
      );
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
    <Modal
      visible={visible && route !== null}
      animationType="slide"
      transparent
      onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={handleClose}>
        <Pressable
          onPress={() => undefined}
          className="rounded-t-3xl bg-surface px-5 pb-8 pt-5">
          {incompleteOpen ? (
            <>
              <Text className="text-xl font-bold text-ink">
                Ciclo anterior incompleto
              </Text>
              <Text className="mt-1 text-sm text-ink-muted">{incompleteLabel}</Text>
              <Text className="mt-2 text-sm text-ink-muted">
                Há uma Ida sem Volta posterior. Informe o motivo para iniciar
                uma nova Ida.
              </Text>
              <Pressable
                onPress={() =>
                  startNewIdaAfterJustify({ kind: 'return_done_offline' })
                }
                className="mt-4 min-h-12 items-center justify-center rounded-button bg-primary py-3">
                <Text className="text-sm font-bold text-white">
                  Volta realizada sem o app
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  startNewIdaAfterJustify({ kind: 'period_cancelled' })
                }
                className="mt-2 min-h-12 items-center justify-center rounded-button border border-divider py-3">
                <Text className="text-sm font-bold text-ink">
                  Período cancelado/Feriado
                </Text>
              </Pressable>
              <Text className="mt-4 text-xs font-semibold text-ink-muted">
                Outro
              </Text>
              <TextInput
                value={cycleNote}
                onChangeText={setCycleNote}
                placeholder="Descreva o motivo"
                className="mt-2 rounded-xl border border-divider px-3 py-3 text-base text-ink"
              />
              <Pressable
                disabled={cycleNote.trim().length === 0}
                onPress={() =>
                  startNewIdaAfterJustify({
                    kind: 'free_text',
                    note: cycleNote.trim(),
                  })
                }
                className={`mt-2 min-h-12 items-center justify-center rounded-button py-3 ${
                  cycleNote.trim().length === 0 ? 'bg-slate-300' : 'bg-primary'
                }`}>
                <Text className="text-sm font-bold text-white">Confirmar</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  openIncompleteOnShow ? handleClose() : setIncompleteOpen(false)
                }
                className="mt-3 items-center py-2">
                <Text className="text-sm font-semibold text-ink-muted">
                  Cancelar
                </Text>
              </Pressable>
            </>
          ) : justifyOpen ? (
            <>
              <Text className="text-xl font-bold text-ink">Nenhuma IDA hoje</Text>
              <Text className="mt-2 text-sm text-ink-muted">
                Não há IDA encerrada desta rota no dia. Informe o motivo para
                iniciar a VOLTA.
              </Text>
              <Pressable
                onPress={() => beginTrip({ kind: 'forgot_morning' })}
                className="mt-4 min-h-12 items-center justify-center rounded-button bg-primary py-3">
                <Text className="text-sm font-bold text-white">
                  Esqueci de iniciar de manhã
                </Text>
              </Pressable>
              <Pressable
                onPress={() => beginTrip({ kind: 'afternoon_only' })}
                className="mt-2 min-h-12 items-center justify-center rounded-button border border-divider py-3">
                <Text className="text-sm font-bold text-ink">
                  Período exclusivo à tarde
                </Text>
              </Pressable>
              <Text className="mt-4 text-xs font-semibold text-ink-muted">
                Justificativa em texto livre
              </Text>
              <TextInput
                value={freeText}
                onChangeText={setFreeText}
                placeholder="Descreva o motivo"
                className="mt-2 rounded-xl border border-divider px-3 py-3 text-base text-ink"
              />
              <Pressable
                disabled={freeText.trim().length === 0}
                onPress={() =>
                  beginTrip({ kind: 'free_text', note: freeText.trim() })
                }
                className={`mt-2 min-h-12 items-center justify-center rounded-button py-3 ${
                  freeText.trim().length === 0 ? 'bg-slate-300' : 'bg-primary'
                }`}>
                <Text className="text-sm font-bold text-white">
                  Confirmar texto
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setJustifyOpen(false)}
                className="mt-3 items-center py-2">
                <Text className="text-sm font-semibold text-ink-muted">
                  Cancelar
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-xl font-bold text-ink">{route?.title}</Text>
              <Text className="mt-1 text-sm text-ink-muted">
                Escolha o sentido e inicie o trajeto.
              </Text>
              <Text className="mt-2 text-sm font-semibold text-primary-dark">
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
                className="mt-5 min-h-14 items-center justify-center rounded-button bg-primary py-4">
                <Text className="text-base font-bold text-white">
                  Iniciar Trajeto
                </Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

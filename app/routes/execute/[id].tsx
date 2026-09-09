import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  buildRouteTimelineStops,
  RouteTimeline,
} from '@/components/RouteTimeline';
import {
  advanceToNextPoint,
  finishRouteExecution,
  markStudentStatus,
  selectActiveExecution,
  selectCanFinishRoute,
  selectCurrentPointName,
  selectExecutionStats,
  selectIsPointComplete,
  selectStudentsForCurrentPoint,
  skipCurrentPoint,
  startRouteExecution,
} from '@/store/attendanceSlice';
import { isDropoffStop, isLastExecutionPoint } from '@/store/executionSession';
import { selectRouteById } from '@/store/routeSlice';
import { selectAllStudents } from '@/store/studentSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { RouteDirection } from '@/types';

export default function ExecuteRouteScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const route = useAppSelector((state) =>
    id ? selectRouteById(state, id) : undefined,
  );
  const school = useAppSelector((state) =>
    route ? state.schools.entities[route.schoolId] : undefined,
  );
  const allStudents = useAppSelector(selectAllStudents);
  const execution = useAppSelector(selectActiveExecution);
  const pointStudents = useAppSelector(selectStudentsForCurrentPoint);
  const pointComplete = useAppSelector(selectIsPointComplete);
  const canFinish = useAppSelector(selectCanFinishRoute);
  const pointName = useAppSelector(selectCurrentPointName);
  const stats = useAppSelector(selectExecutionStats);

  const schoolName = school?.name ?? 'Escola não encontrada';
  const sessionForRoute =
    execution && route && execution.routeId === route.id ? execution : null;
  const inProgress = sessionForRoute?.status === 'IN_PROGRESS';
  const direction: RouteDirection | null = inProgress
    ? sessionForRoute.direction
    : null;
  const dropoff = inProgress ? isDropoffStop(sessionForRoute) : false;
  const lastPoint = inProgress ? isLastExecutionPoint(sessionForRoute) : false;

  const routeStudents = useMemo(
    () => (route ? allStudents.filter((student) => student.routeId === route.id) : []),
    [allStudents, route],
  );

  const studentNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const student of routeStudents) {
      map[student.id] = student.name;
    }
    return map;
  }, [routeStudents]);

  const stops = useMemo(() => {
    if (!route || direction === null) {
      return [];
    }
    return buildRouteTimelineStops(
      route.startPoint,
      route.boardingPoints,
      schoolName,
      direction,
    );
  }, [direction, route, schoolName]);

  function handleStart(nextDirection: RouteDirection) {
    if (!route || inProgress) {
      return;
    }
    dispatch(
      startRouteExecution({
        routeId: route.id,
        schoolId: route.schoolId,
        direction: nextDirection,
        boardingPoints: route.boardingPoints,
        students: routeStudents.map((student) => ({
          studentId: student.id,
          boardingPoint: student.boardingPoint,
        })),
      }),
    );
  }

  if (!route) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Stack.Screen options={{ title: 'Executar rota' }} />
        <Text className="text-center text-base text-slate-500">
          Rota não encontrada.
        </Text>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace('/routes' as Href)
          }
          className="mt-6 items-center rounded-2xl bg-brand px-6 py-4">
          <Text className="text-base font-bold text-white">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerClassName="p-5 pb-10">
      <Stack.Screen options={{ title: route.title }} />
      <Text className="text-lg font-bold text-slate-900">{route.title}</Text>
      <Text className="mt-1 text-sm text-slate-500">
        {inProgress
          ? 'Sentido travado nesta viagem. Desembarque todos os presentes para encerrar.'
          : 'Escolha o sentido desta viagem. A linha cadastrada não muda.'}
      </Text>

      <View className="mt-5 gap-3">
        <Pressable
          disabled={inProgress}
          onPress={() => handleStart('IDA')}
          className={`rounded-2xl border px-4 py-5 ${
            direction === 'IDA'
              ? 'border-brand bg-brand-light'
              : 'border-slate-200 bg-white'
          } ${inProgress && direction !== 'IDA' ? 'opacity-40' : ''}`}>
          <Text className="text-lg font-bold text-slate-900">
            ☀️ Sentido: IDA
          </Text>
          <Text className="mt-1 text-sm text-slate-600">Casa → Escola</Text>
        </Pressable>
        <Pressable
          disabled={inProgress}
          onPress={() => handleStart('VOLTA')}
          className={`rounded-2xl border px-4 py-5 ${
            direction === 'VOLTA'
              ? 'border-brand bg-brand-light'
              : 'border-slate-200 bg-white'
          } ${inProgress && direction !== 'VOLTA' ? 'opacity-40' : ''}`}>
          <Text className="text-lg font-bold text-slate-900">
            🌙 Sentido: VOLTA
          </Text>
          <Text className="mt-1 text-sm text-slate-600">Escola → Casa</Text>
        </Pressable>
      </View>

      {direction === null ? (
        <Text className="mt-8 text-center text-base text-slate-500">
          Selecione o sentido para iniciar a sessão e ver o percurso.
        </Text>
      ) : (
        <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Percurso {direction === 'IDA' ? 'ida' : 'volta'}
          </Text>
          <RouteTimeline stops={stops} />
        </View>
      )}

      {sessionForRoute?.status === 'COMPLETED' &&
      sessionForRoute.routeId === route.id ? (
        <View className="mt-6 rounded-2xl border border-brand bg-brand-light p-4">
          <Text className="text-base font-bold text-brand-dark">
            Viagem concluída. Ninguém ficou na van.
          </Text>
        </View>
      ) : null}

      {inProgress && sessionForRoute ? (
        <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Ponto {sessionForRoute.currentPointIndex + 1} de{' '}
            {sessionForRoute.pointsList.length}
          </Text>
          <Text className="mt-1 text-xl font-bold text-slate-900">{pointName}</Text>
          <Text className="mt-1 text-sm text-slate-500">
            {dropoff ? 'Desembarque' : 'Embarque'} · Na van: {stats.present} ·
            Faltas: {stats.absent} · Desembarcou: {stats.droppedOff}
          </Text>

          {pointStudents.length === 0 ? (
            <Text className="mt-4 text-base text-slate-500">
              Nenhum aluno pendente neste ponto.
            </Text>
          ) : (
            pointStudents.map((item) => (
              <View
                key={item.studentId}
                className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <Text className="text-base font-semibold text-slate-900">
                  {studentNames[item.studentId] ?? 'Aluno'}
                </Text>
                <Text className="mt-0.5 text-sm text-slate-500">
                  {item.boardingPoint}
                </Text>
                <View className="mt-3 flex-row gap-2">
                  {dropoff ? (
                    <Pressable
                      onPress={() =>
                        dispatch(
                          markStudentStatus({
                            studentId: item.studentId,
                            status: 'DROPPED_OFF',
                          }),
                        )
                      }
                      className="flex-1 items-center rounded-xl bg-brand py-3">
                      <Text className="text-sm font-bold text-white">
                        Desembarcou
                      </Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        onPress={() =>
                          dispatch(
                            markStudentStatus({
                              studentId: item.studentId,
                              status: 'PRESENT',
                            }),
                          )
                        }
                        className="flex-1 items-center rounded-xl bg-brand py-3">
                        <Text className="text-sm font-bold text-white">
                          Embarcou
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          dispatch(
                            markStudentStatus({
                              studentId: item.studentId,
                              status: 'ABSENT',
                            }),
                          )
                        }
                        className="flex-1 items-center rounded-xl border border-slate-300 bg-white py-3">
                        <Text className="text-sm font-bold text-slate-700">
                          Faltou
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            ))
          )}

          <Pressable
            disabled={!pointComplete || lastPoint}
            onPress={() => dispatch(advanceToNextPoint())}
            className={`mt-5 items-center rounded-2xl py-4 ${
              pointComplete && !lastPoint ? 'bg-brand' : 'bg-slate-300'
            }`}>
            <Text className="text-base font-bold text-white">Concluir ponto</Text>
          </Pressable>

          {!lastPoint ? (
            <Pressable
              onPress={() => dispatch(skipCurrentPoint())}
              className="mt-3 items-center rounded-2xl border border-slate-300 bg-white py-4">
              <Text className="text-base font-semibold text-slate-700">
                Pular ponto
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                disabled={!canFinish}
                onPress={() => dispatch(finishRouteExecution())}
                className={`mt-3 items-center rounded-2xl py-4 ${
                  canFinish ? 'bg-brand' : 'bg-slate-300'
                }`}>
                <Text className="text-base font-bold text-white">
                  Encerrar rota
                </Text>
              </Pressable>
              {!canFinish ? (
                <Text className="mt-3 text-center text-sm font-semibold text-red-600">
                  Ainda há aluno na van. Desembarque todos para encerrar.
                </Text>
              ) : null}
            </>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

import { Feather } from '@expo/vector-icons';
import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppAlert, type AppAlertState } from '@/components/AppAlert';
import { BusSeatMap } from '@/components/BusSeatMap';
import { ExecutionBottomBar } from '@/components/ExecutionBottomBar';
import { ExecutionHeroCard } from '@/components/ExecutionHeroCard';
import { GuardianContactSheet, startGuardianContact } from '@/components/GuardianContactSheet';
import { SnakePathTimeline, type SnakeStop } from '@/components/SnakePathTimeline';
import { ExecutionStatusBadge, MissedIdaBadge } from '@/components/StatusTag';
import { StudentAvatar } from '@/components/StudentAvatar';
import { StudentPhotoPreview } from '@/components/StudentPhotoPreview';
import { useExecutionLocation } from '@/hooks/useExecutionLocation';
import { playArrivalChime } from '@/lib/arrivalSound';
import { currentStopCoords } from '@/lib/executionStop';
import { openNavigation, type NavigationApp } from '@/lib/mapNavigation';
import { formatRouteTimeWindow } from '@/lib/routeSchedule';
import {
  advanceToNextPoint,
  finishRouteExecution,
  goToPreviousPoint,
  markStudentStatus,
  selectActiveExecution,
  selectCanFinishRoute,
  selectCurrentPointName,
  selectExecutionStats,
  selectIdaAbsentStudentIds,
  selectIsPointComplete,
  selectStudentsForCurrentPoint,
  skipCurrentPoint,
} from '@/store/attendanceSlice';
import { isDropoffStop, isLastExecutionPoint } from '@/store/executionSession';
import { selectRouteById } from '@/store/routeSlice';
import { selectAllStudents } from '@/store/studentSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { selectVehicleById } from '@/store/vehicleSlice';
import type { Student } from '@/types';
import type { ExecutionStatus } from '@/types/execution';

function pickVehicleId(students: Student[]): string | undefined {
  const counts: Record<string, number> = {};
  for (const student of students) {
    if (!student.vehicleId) {
      continue;
    }
    counts[student.vehicleId] = (counts[student.vehicleId] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function hasBoardingMarks(
  attendances: Record<string, { boardingPoint: string; status: ExecutionStatus }>,
  token: string,
  schoolId: string,
  direction: 'IDA' | 'VOLTA',
): boolean {
  const all = Object.values(attendances);
  if (direction === 'VOLTA' && token === schoolId) {
    return all.some((item) => item.status !== 'PENDING');
  }
  return all.some(
    (item) => item.boardingPoint === token && item.status !== 'PENDING',
  );
}

export default function ExecuteRouteScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<'execucao' | 'resumo'>('execucao');
  const [alert, setAlert] = useState<AppAlertState>(null);
  const [photoPreview, setPhotoPreview] = useState<{
    name: string;
    uri: string;
  } | null>(null);
  const [contactPhones, setContactPhones] = useState<string[] | null>(null);
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
  const missedIda = useAppSelector(selectIdaAbsentStudentIds);

  const schoolName = school?.name ?? 'Escola não encontrada';
  const session =
    execution && route && execution.routeId === route.id ? execution : null;
  const inProgress = session?.status === 'IN_PROGRESS';
  const dropoff = inProgress && session ? isDropoffStop(session) : false;
  const lastPoint = inProgress && session ? isLastExecutionPoint(session) : false;
  const canSkip =
    inProgress &&
    session &&
    !dropoff &&
    !lastPoint &&
    !hasBoardingMarks(
      session.attendances,
      session.pointsList?.[session.currentPointIndex] ?? '',
      session.schoolId,
      session.direction,
    );

  const routeStudents = useMemo(
    () => (route ? allStudents.filter((student) => student.routeId === route.id) : []),
    [allStudents, route],
  );
  const studentsById = useMemo(() => {
    const map: Record<string, Student> = {};
    for (const student of routeStudents) {
      map[student.id] = student;
    }
    return map;
  }, [routeStudents]);
  const vehicleId = useMemo(() => pickVehicleId(routeStudents), [routeStudents]);
  const vehicle = useAppSelector((state) =>
    vehicleId ? selectVehicleById(state, vehicleId) : undefined,
  );
  const executionStatusByStudentId = useMemo(() => {
    const map: Record<string, ExecutionStatus> = {};
    if (!session) {
      return map;
    }
    for (const item of Object.values(session.attendances)) {
      map[item.studentId] = item.status;
    }
    return map;
  }, [session]);

  const currentToken = session?.pointsList?.[session.currentPointIndex] ?? '';
  const targetCoords = currentStopCoords(
    route,
    school,
    session?.schoolId,
    route?.startPoint,
    currentToken,
  );
  const location = useExecutionLocation({
    enabled: Boolean(inProgress && session),
    target: targetCoords,
    stopKey: session ? `${session.routeId}:${session.currentPointIndex}` : '',
  });

  useEffect(() => {
    if (location.arrivedPulse === 0) {
      return;
    }
    void playArrivalChime();
  }, [location.arrivedPulse]);

  const snakeStops: SnakeStop[] = useMemo(() => {
    if (!route || !session) {
      return [];
    }
    return (session.pointsList ?? []).map((token, index) => {
      const isSchool = token === session.schoolId;
      const isStart = token === route.startPoint;
      const done = index < session.currentPointIndex;
      const current = index === session.currentPointIndex;
      const kind = isSchool ? 'school' : isStart ? 'start' : 'boarding';
      return {
        key: `${token}-${index}`,
        label: isSchool ? schoolName : token,
        status: done ? 'done' : current ? 'current' : 'pending',
        kind,
        icon: kind === 'school' ? 'home' : kind === 'start' ? 'flag' : 'map-pin',
      };
    });
  }, [route, schoolName, session]);

  async function handleNavigate(app: NavigationApp) {
    if (!route || !session) {
      return;
    }
    const coords = currentStopCoords(
      route,
      school,
      session.schoolId,
      route.startPoint,
      session.pointsList?.[session.currentPointIndex] ?? '',
    );
    const result = await openNavigation(coords?.latitude, coords?.longitude, app);
    if (result.ok) {
      return;
    }
    setAlert({
      kind: result.reason === 'missing_coords' ? 'warning' : 'error',
      title:
        result.reason === 'missing_coords'
          ? 'Sem localização'
          : 'Não foi possível abrir',
      message:
        result.reason === 'missing_coords'
          ? 'Este ponto não possui coordenadas geográficas cadastradas. Marque o local no cadastro da rota ou da escola.'
          : 'Não foi possível abrir o aplicativo de mapas.',
    });
  }

  function handleCompletePoint() {
    if (!session) {
      return;
    }
    if (lastPoint) {
      if (!canFinish) {
        setAlert({
          kind: 'error',
          title: 'Não é possível encerrar',
          message:
            'Ainda há aluno na van. Faça o desembarque de todos os presentes antes de encerrar a rota.',
        });
        return;
      }
      dispatch(finishRouteExecution());
      router.replace('/' as Href);
      return;
    }
    if (!pointComplete) {
      setAlert({
        kind: 'error',
        title: 'Não é possível concluir',
        message:
          pointStudents.length > 0
            ? `${pointStudents.length} ${
                pointStudents.length === 1
                  ? 'aluno ainda precisa ser avaliado'
                  : 'alunos ainda precisam ser avaliados'
              }.`
            : 'Ainda há aluno neste ponto sem marcação. Marque todos antes de avançar.',
      });
      return;
    }
    dispatch(advanceToNextPoint());
  }

  if (!route) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Stack.Screen options={{ title: 'Executar rota' }} />
        <Text className="text-center text-base text-slate-500">
          Rota não encontrada.
        </Text>
      </View>
    );
  }

  if (!inProgress || !session) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Stack.Screen options={{ title: route.title }} />
        <Text className="text-center text-base text-slate-500">
          Inicie o trajeto pela tela Início, escolhendo o sentido.
        </Text>
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/' as Href)
          }
          className="mt-6 items-center rounded-2xl bg-brand px-6 py-4">
          <Text className="text-base font-bold text-white">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100">
      <Stack.Screen options={{ title: route.title }} />
      <View className="border-b border-slate-300 bg-white px-4 py-2">
        <Text className="text-sm font-extrabold text-brand-dark">
          {session.direction === 'IDA' ? 'Ida' : 'Volta'} ·{' '}
          {formatRouteTimeWindow(route, session.direction)}
        </Text>
      </View>
      <View className="flex-row border-b border-slate-300 bg-white">
        <Pressable
          onPress={() => setTab('execucao')}
          className={`flex-1 items-center py-4 ${
            tab === 'execucao' ? 'border-b-2 border-brand' : ''
          }`}>
          <Text
            className={`text-base font-extrabold ${
              tab === 'execucao' ? 'text-brand-dark' : 'text-slate-600'
            }`}>
            Execução
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('resumo')}
          className={`flex-1 items-center py-4 ${
            tab === 'resumo' ? 'border-b-2 border-brand' : ''
          }`}>
          <Text
            className={`text-base font-extrabold ${
              tab === 'resumo' ? 'text-brand-dark' : 'text-slate-600'
            }`}>
            Resumo
          </Text>
        </Pressable>
      </View>

      {tab === 'execucao' ? (
        <View className="flex-1">
          <View className="border-b border-slate-300 bg-white px-4 py-3">
            <Text className="mb-2 text-sm font-extrabold text-slate-900">
              {stats.present} Presentes | {stats.absent} Ausentes |{' '}
              {session.skippedPoints.length} Pulados
            </Text>
            <ExecutionHeroCard
              pointName={pointName}
              actionLabel={dropoff ? 'Desembarque' : 'Embarque'}
              studentCount={pointStudents.length}
              pointComplete={pointComplete}
              hasTargetCoords={Boolean(targetCoords)}
              locationStatus={location.status}
              distanceMeters={location.distanceMeters}
              inside={location.inside}
              onNavigateGoogle={() => void handleNavigate('google')}
              onNavigateWaze={() => void handleNavigate('waze')}
              onRetryLocation={location.retry}
            />
            <SnakePathTimeline compact stops={snakeStops} />
          </View>

          <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-3">
            {pointStudents.length === 0 ? (
              <Text className="mt-4 text-center text-base font-semibold text-slate-700">
                Nenhum aluno aguardando ação neste ponto.
              </Text>
            ) : null}
            {pointStudents.map((item) => {
              const student = studentsById[item.studentId];
              const displayName = student?.name ?? 'Aluno';
              return (
                <View
                  key={item.studentId}
                  className="mb-3 rounded-2xl border-2 border-slate-300 bg-white p-3">
                  <View className="flex-row items-start">
                    <StudentAvatar
                      size="lg"
                      photoUri={student?.photoUri}
                      onLongPress={
                        student?.photoUri
                          ? () =>
                              setPhotoPreview({
                                name: student.name,
                                uri: student.photoUri ?? '',
                              })
                          : undefined
                      }
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-lg font-extrabold text-slate-900">
                        {displayName}
                      </Text>
                      <MissedIdaBadge show={Boolean(missedIda[item.studentId])} />
                      <Text className="text-sm font-semibold text-slate-700">
                        {item.boardingPoint}
                      </Text>
                      <ExecutionStatusBadge status={item.status} />
                    </View>
                  </View>
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
                        accessibilityRole="button"
                        accessibilityLabel={`Marcar desembarque de ${displayName}`}
                        className="min-h-14 flex-1 flex-row items-center justify-center rounded-xl bg-emerald-700 py-3 active:bg-emerald-800">
                        <Feather name="log-out" size={18} color="#FFFFFF" />
                        <Text className="ml-2 text-sm font-extrabold text-white">
                          Desembarque
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
                          accessibilityRole="button"
                          accessibilityLabel={`Marcar ${displayName} como presente`}
                          className="min-h-14 flex-1 flex-row items-center justify-center rounded-xl bg-emerald-700 py-3 active:bg-emerald-800">
                          <Feather name="check" size={18} color="#FFFFFF" />
                          <Text className="ml-2 text-sm font-extrabold text-white">
                            Presente
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
                          accessibilityRole="button"
                          accessibilityLabel={`Marcar ${displayName} como ausente`}
                          className="min-h-14 flex-1 flex-row items-center justify-center rounded-xl bg-orange-600 py-3 active:bg-orange-700">
                          <Feather name="x" size={18} color="#FFFFFF" />
                          <Text className="ml-2 text-sm font-extrabold text-white">
                            Ausente
                          </Text>
                        </Pressable>
                      </>
                    )}
                    <Pressable
                      onPress={() =>
                        startGuardianContact(student?.contactPhones, setContactPhones)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Contatar responsável de ${displayName}`}
                      className="h-14 w-14 items-center justify-center rounded-xl bg-brand-light">
                      <Feather name="phone" size={20} color="#0A4D38" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <ExecutionBottomBar
            canGoPrevious={session.currentPointIndex > 0}
            canSkip={Boolean(canSkip)}
            lastPoint={lastPoint}
            canFinish={canFinish}
            pointComplete={pointComplete}
            pendingCount={pointStudents.length}
            onPrevious={() => dispatch(goToPreviousPoint())}
            onComplete={handleCompletePoint}
            onSkip={() => dispatch(skipCurrentPoint())}
          />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="p-4 pb-10">
          {vehicle ? (
            <BusSeatMap
              seatsMap={vehicle.seatsMap}
              studentsById={studentsById}
              executionStatusByStudentId={executionStatusByStudentId}
            />
          ) : (
            <Text className="text-sm font-semibold text-slate-700">
              Nenhum veículo vinculado aos alunos desta rota.
            </Text>
          )}
          <Text className="mt-6 mb-2 text-sm font-extrabold text-slate-900">
            Todos os alunos
          </Text>
          {Object.values(session.attendances).map((item) => {
            const student = studentsById[item.studentId];
            return (
              <View
                key={item.studentId}
                className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
                <View className="flex-row items-center">
                  <StudentAvatar
                    photoUri={student?.photoUri}
                    onLongPress={
                      student?.photoUri
                        ? () =>
                            setPhotoPreview({
                              name: student.name,
                              uri: student.photoUri ?? '',
                            })
                          : undefined
                    }
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-slate-900">
                      {student?.name ?? 'Aluno'}
                    </Text>
                    <ExecutionStatusBadge status={item.status} />
                    <MissedIdaBadge show={Boolean(missedIda[item.studentId])} />
                  </View>
                  <Pressable
                    onPress={() =>
                      startGuardianContact(student?.contactPhones, setContactPhones)
                    }
                    className="h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
                    <Feather name="phone" size={18} color="#0F6B4D" />
                  </Pressable>
                </View>
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    onPress={() =>
                      dispatch(
                        markStudentStatus({
                          studentId: item.studentId,
                          status: 'PENDING',
                        }),
                      )
                    }
                    className="flex-1 items-center rounded-xl border border-slate-300 py-3">
                    <Text className="text-xs font-bold text-slate-700">
                      Pendente
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      dispatch(
                        markStudentStatus({
                          studentId: item.studentId,
                          status: 'PRESENT',
                        }),
                      )
                    }
                    className="flex-1 items-center rounded-xl bg-emerald-600 py-3">
                    <Text className="text-sm font-bold text-white">Presente</Text>
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
                    className="flex-1 items-center rounded-xl bg-orange-500 py-3">
                    <Text className="text-sm font-bold text-white">Ausente</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
      <AppAlert alert={alert} onDismiss={() => setAlert(null)} />
      <StudentPhotoPreview
        visible={photoPreview !== null}
        name={photoPreview?.name ?? ''}
        photoUri={photoPreview?.uri}
        onClose={() => setPhotoPreview(null)}
      />
      <GuardianContactSheet
        phones={contactPhones ?? []}
        visible={contactPhones !== null}
        onClose={() => setContactPhones(null)}
      />
    </View>
  );
}

import { Feather } from '@expo/vector-icons';
import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { cardShadow, palette } from '@/constants/Colors';
import { formatLongDate } from '@/lib/localDate';
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
import { LeaveConfirmSheet } from '@/components/LeaveConfirmSheet';
import { useLeaveConfirmation } from '@/hooks/useLeaveConfirmation';
import { persistor, useAppDispatch, useAppSelector } from '@/store/store';
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
  const persistOnLeave = useCallback(() => {
    void persistor.flush();
  }, []);
  const { allowNextLeave, sheetVisible, stay, leave } = useLeaveConfirmation({
    shouldConfirm: Boolean(inProgress && session),
    title: 'Sair da execução?',
    message: 'Você pode sair agora e retomar depois pelo Início.',
    confirmLabel: 'Sair',
    presentation: 'sheet',
    onConfirmLeave: persistOnLeave,
  });
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
      allowNextLeave();
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
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Stack.Screen options={{ title: 'Executar rota' }} />
        <Text className="text-center text-base text-ink-muted">
          Rota não encontrada.
        </Text>
      </View>
    );
  }

  if (!inProgress || !session) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Stack.Screen options={{ title: route.title }} />
        <Text className="text-center text-base text-ink-muted">
          Inicie o trajeto pela tela Início, escolhendo o sentido.
        </Text>
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/' as Href)
          }
          className="mt-6 min-h-14 items-center justify-center rounded-button bg-primary px-6 py-4">
          <Text className="text-base font-bold text-white">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: route.title,
          headerTintColor: palette.primary,
          headerStyle: { backgroundColor: palette.surface },
          headerShadowVisible: false,
        }}
      />
      <View className="bg-surface px-4 pb-2">
        <Text className="text-sm font-semibold text-ink-muted">
          {session.direction === 'IDA' ? 'Ida' : 'Volta'} •{' '}
          {formatRouteTimeWindow(route, session.direction)}
        </Text>
      </View>
      <View className="flex-row border-b border-[#EEF2F6] bg-surface">
        <Pressable
          onPress={() => setTab('execucao')}
          className={`flex-1 items-center py-3 ${
            tab === 'execucao' ? 'border-b-2 border-primary' : ''
          }`}>
          <Text
            className={`text-base font-extrabold ${
              tab === 'execucao' ? 'text-primary' : 'text-ink-muted'
            }`}>
            Execução
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('resumo')}
          className={`flex-1 items-center py-3 ${
            tab === 'resumo' ? 'border-b-2 border-primary' : ''
          }`}>
          <Text
            className={`text-base font-extrabold ${
              tab === 'resumo' ? 'text-primary' : 'text-ink-muted'
            }`}>
            Resumo
          </Text>
        </Pressable>
      </View>

      {tab === 'execucao' ? (
        <View className="flex-1">
          <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-3">
            <ExecutionHeroCard
              pointName={pointName}
              actionLabel={dropoff ? 'Desembarque' : 'Embarque'}
              studentCount={pointStudents.length}
              pointComplete={pointComplete}
              hasTargetCoords={Boolean(targetCoords)}
              locationStatus={location.status}
              distanceMeters={location.distanceMeters}
              inside={location.inside}
              stopIndex={session.currentPointIndex}
              stopCount={session.pointsList.length}
              onNextStop={
                canSkip ? () => dispatch(skipCurrentPoint()) : undefined
              }
              onNavigateGoogle={() => void handleNavigate('google')}
              onNavigateWaze={() => void handleNavigate('waze')}
              onRetryLocation={location.retry}
            />
            <View className="mt-4 rounded-card bg-surface px-2 py-3">
              <SnakePathTimeline compact stops={snakeStops} />
            </View>
            <View
              style={cardShadow}
              className="mt-3 flex-row rounded-card border border-[#EEF2F6] bg-surface p-2">
              <View className="flex-1 items-center py-2">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                  <Feather name="user" size={16} color={palette.primary} />
                </View>
                <Text className="mt-1 text-[16px] font-bold text-ink">{stats.present}</Text>
                <Text className="text-[11px] text-ink-muted">Presentes</Text>
              </View>
              <View className="flex-1 items-center py-2">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FEE2E2]">
                  <Feather name="x" size={16} color={palette.danger} />
                </View>
                <Text className="mt-1 text-[16px] font-bold text-ink">{stats.absent}</Text>
                <Text className="text-[11px] text-ink-muted">Ausentes</Text>
              </View>
              <View className="flex-1 items-center py-2">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-pastel-route">
                  <Feather name="minus" size={16} color={palette.iconRoute} />
                </View>
                <Text className="mt-1 text-[16px] font-bold text-ink">
                  {session.skippedPoints.length}
                </Text>
                <Text className="text-[11px] text-ink-muted">Pulados</Text>
              </View>
            </View>

            {pointStudents.length === 0 ? (
              <Text className="mt-4 text-center text-base font-semibold text-ink-secondary">
                Nenhum aluno aguardando ação neste ponto.
              </Text>
            ) : (
              <Text className="mt-5 mb-2 text-[15px] font-bold text-ink">
                Aluno da parada
              </Text>
            )}
            {pointStudents.map((item) => {
              const student = studentsById[item.studentId];
              const displayName = student?.name ?? 'Aluno';
              return (
                <View
                  key={item.studentId}
                  style={cardShadow}
                  className="mb-3 rounded-card border border-[#EEF2F6] bg-surface p-3">
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
                      <Text className="text-lg font-extrabold text-ink">
                        {displayName}
                      </Text>
                      <MissedIdaBadge show={Boolean(missedIda[item.studentId])} />
                      <Text className="text-sm font-semibold text-ink-secondary">
                        {item.boardingPoint}
                      </Text>
                      <ExecutionStatusBadge status={item.status} />
                    </View>
                    <Pressable
                      onPress={() =>
                        startGuardianContact(student?.contactPhones, setContactPhones)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Contatar responsável de ${displayName}`}
                      className="h-11 w-11 items-center justify-center rounded-full bg-primary-light">
                      <Feather name="phone" size={18} color={palette.primaryDark} />
                    </Pressable>
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
                        className="min-h-14 flex-1 flex-row items-center justify-center rounded-button bg-primary py-3">
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
                          className="min-h-14 flex-1 flex-row items-center justify-center rounded-button bg-primary py-3">
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
                          className="min-h-14 flex-1 flex-row items-center justify-center rounded-button bg-[#EA580C] py-3">
                          <Feather name="x" size={18} color="#FFFFFF" />
                          <Text className="ml-2 text-sm font-extrabold text-white">
                            Ausente
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                  {canSkip ? (
                    <Pressable
                      onPress={() => dispatch(skipCurrentPoint())}
                      accessibilityRole="button"
                      accessibilityLabel="Pular ponto, não embarcou"
                      className="mt-2 min-h-12 flex-row items-center justify-center rounded-button border border-divider">
                      <Feather name="minus" size={16} color={palette.textMuted} />
                      <Text className="ml-2 text-sm font-semibold text-ink-secondary">
                        Pular (não embarcou)
                      </Text>
                    </Pressable>
                  ) : null}
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
          <View
            style={cardShadow}
            className="rounded-card border border-[#EEF2F6] bg-surface p-4">
            <View className="flex-row items-start">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-light">
                <Feather name="calendar" size={18} color={palette.primary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[16px] font-bold text-ink">
                  Rota {route.title} ({session.direction})
                </Text>
                <Text className="mt-0.5 text-[13px] text-ink-muted">
                  {formatRouteTimeWindow(route, session.direction)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[13px] font-bold text-primary">Em andamento</Text>
                <Text className="mt-1 text-[12px] text-ink-muted">
                  {formatLongDate(session.startedAt)}
                </Text>
              </View>
            </View>
          </View>
          <View className="mt-3 flex-row gap-2">
            <View className="flex-1 items-center rounded-card bg-primary-light py-3">
              <Text className="text-xl font-bold text-ink">{stats.present}</Text>
              <Text className="text-[11px] text-ink-muted">Presentes</Text>
            </View>
            <View className="flex-1 items-center rounded-card bg-[#FEE2E2] py-3">
              <Text className="text-xl font-bold text-ink">{stats.absent}</Text>
              <Text className="text-[11px] text-ink-muted">Ausentes</Text>
            </View>
            <View className="flex-1 items-center rounded-card bg-pastel-route py-3">
              <Text className="text-xl font-bold text-ink">
                {session.skippedPoints.length}
              </Text>
              <Text className="text-[11px] text-ink-muted">Pulados</Text>
            </View>
          </View>
          <Text className="mt-6 mb-2 text-[16px] font-bold text-ink">Mapa de assentos</Text>
          {vehicle ? (
            <View
              style={cardShadow}
              className="rounded-card border border-[#EEF2F6] bg-surface p-3">
              <BusSeatMap
                seatsMap={vehicle.seatsMap}
                studentsById={studentsById}
                executionStatusByStudentId={executionStatusByStudentId}
              />
            </View>
          ) : (
            <Text className="text-sm font-semibold text-ink-secondary">
              Nenhum veículo vinculado aos alunos desta rota.
            </Text>
          )}
          <Text className="mt-6 mb-2 text-[16px] font-bold text-ink">
            Lista de alunos
          </Text>
          {Object.values(session.attendances).map((item) => {
            const student = studentsById[item.studentId];
            return (
              <View
                key={item.studentId}
                className="mb-3 rounded-card border border-[#EEF2F6] bg-surface p-3">
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
                    <Text className="text-base font-semibold text-ink">
                      {student?.name ?? 'Aluno'}
                    </Text>
                    <ExecutionStatusBadge status={item.status} />
                    <MissedIdaBadge show={Boolean(missedIda[item.studentId])} />
                  </View>
                  <Pressable
                    onPress={() =>
                      startGuardianContact(student?.contactPhones, setContactPhones)
                    }
                    className="h-12 w-12 items-center justify-center rounded-button bg-primary-light">
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
                    className="min-h-12 flex-1 items-center rounded-button border border-divider py-3">
                    <Text className="text-xs font-bold text-ink-secondary">
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
                    className="min-h-12 flex-1 items-center rounded-button bg-primary py-3">
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
                    className="min-h-12 flex-1 items-center rounded-button bg-[#EA580C] py-3">
                    <Text className="text-sm font-bold text-white">Ausente</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
      <LeaveConfirmSheet
        visible={sheetVisible}
        title="Sair da execução?"
        message="Você pode sair agora e retomar depois pelo Início."
        confirmLabel="Sair"
        onStay={stay}
        onLeave={leave}
      />
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

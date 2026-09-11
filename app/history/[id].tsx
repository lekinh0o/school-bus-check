import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BusSeatMap } from '@/components/BusSeatMap';
import {
  GuardianContactSheet,
  startGuardianContact,
} from '@/components/GuardianContactSheet';
import { SnakePathTimeline, type SnakeStop } from '@/components/SnakePathTimeline';
import { ExecutionStatusBadge } from '@/components/StatusTag';
import { StudentAvatar } from '@/components/StudentAvatar';
import { StudentPhotoPreview } from '@/components/StudentPhotoPreview';
import { boardingPointNames } from '@/lib/boardingPoints';
import { formatClock } from '@/lib/formatTrip';
import { buildRouteTimelineStops } from '@/components/RouteTimeline';
import { selectExecutionHistory } from '@/store/attendanceSlice';
import { selectRouteById } from '@/store/routeSlice';
import { selectAllStudents } from '@/store/studentSlice';
import { useAppSelector } from '@/store/store';
import { selectVehicleById } from '@/store/vehicleSlice';
import type { ExecutionStatus, RouteHistory } from '@/types/execution';
import type { Student } from '@/types';

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

function pointLabel(trip: RouteHistory, pointId: string, schoolName: string) {
  if (pointId === trip.schoolId) {
    return schoolName;
  }
  return pointId;
}

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<'timeline' | 'resumo'>('timeline');
  const [photoPreview, setPhotoPreview] = useState<{
    name: string;
    uri: string;
  } | null>(null);
  const [contactPhones, setContactPhones] = useState<string[] | null>(null);
  const trip = useAppSelector(selectExecutionHistory).find((item) => item.id === id);
  const route = useAppSelector((state) =>
    trip ? selectRouteById(state, trip.routeId) : undefined,
  );
  const school = useAppSelector((state) =>
    trip ? state.schools.entities[trip.schoolId] : undefined,
  );
  const allStudents = useAppSelector(selectAllStudents);
  const schoolName = school?.name ?? 'Escola';
  const title = route?.title ?? 'Rota removida';

  const routeStudents = useMemo(
    () =>
      trip
        ? allStudents.filter((student) => student.routeId === trip.routeId)
        : [],
    [allStudents, trip],
  );
  const studentsById = useMemo(() => {
    const map: Record<string, Student> = {};
    for (const student of allStudents) {
      map[student.id] = student;
    }
    return map;
  }, [allStudents]);
  const vehicleId = useMemo(() => pickVehicleId(routeStudents), [routeStudents]);
  const vehicle = useAppSelector((state) =>
    vehicleId ? selectVehicleById(state, vehicleId) : undefined,
  );
  const executionStatusByStudentId = useMemo(() => {
    const map: Record<string, ExecutionStatus> = {};
    if (!trip) {
      return map;
    }
    for (const item of Object.values(trip.attendances)) {
      map[item.studentId] = item.status;
    }
    return map;
  }, [trip]);

  const snakeStops: SnakeStop[] = useMemo(() => {
    if (!trip || !route) {
      return [];
    }
    return buildRouteTimelineStops(
      route.startPoint,
      boardingPointNames(route.boardingPoints),
      schoolName,
      trip.direction,
    ).map((stop, index) => ({
      key: `${stop.label}-${index}`,
      label: stop.label,
      status: 'done' as const,
      kind: stop.kind,
      icon:
        stop.kind === 'school'
          ? 'home'
          : stop.kind === 'start'
            ? 'flag'
            : 'map-pin',
    }));
  }, [route, schoolName, trip]);

  if (!trip) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Stack.Screen options={{ title: 'Viagem' }} />
        <Text className="text-center text-base text-slate-500">
          Viagem não encontrada.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ title }} />
      {trip.cycleJustification ? (
        <View className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <Text className="text-xs font-bold uppercase text-amber-800">
            Justificativa de ciclo
          </Text>
          <Text className="mt-1 text-sm text-amber-950">
            {trip.cycleJustification.kind === 'forgot_morning'
              ? 'Esqueci de iniciar de manhã'
              : trip.cycleJustification.kind === 'afternoon_only'
                ? 'Período exclusivo à tarde'
                : trip.cycleJustification.kind === 'return_done_offline'
                  ? 'Volta realizada sem o app'
                  : trip.cycleJustification.kind === 'period_cancelled'
                    ? 'Período cancelado/Feriado'
                    : trip.cycleJustification.note ?? 'Texto livre'}
          </Text>
        </View>
      ) : null}
      <View className="flex-row border-b border-slate-200 bg-white">
        <Pressable
          onPress={() => setTab('timeline')}
          className={`flex-1 items-center py-4 ${
            tab === 'timeline' ? 'border-b-2 border-brand' : ''
          }`}>
          <Text
            className={`text-base font-bold ${
              tab === 'timeline' ? 'text-brand-dark' : 'text-slate-500'
            }`}>
            Timeline
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('resumo')}
          className={`flex-1 items-center py-4 ${
            tab === 'resumo' ? 'border-b-2 border-brand' : ''
          }`}>
          <Text
            className={`text-base font-bold ${
              tab === 'resumo' ? 'text-brand-dark' : 'text-slate-500'
            }`}>
            Resumo
          </Text>
        </Pressable>
      </View>

      {tab === 'timeline' ? (
        <ScrollView className="flex-1" contentContainerClassName="p-4 pb-10">
          <Text className="mb-2 text-sm font-bold text-slate-900">Percurso</Text>
          <SnakePathTimeline stops={snakeStops} />
          <Text className="mt-6 mb-2 text-sm font-bold text-slate-900">
            Auditoria
          </Text>
          {trip.pointLogs.map((log, index) => {
            const name = pointLabel(trip, log.pointId, schoolName);
            const clock = formatClock(log.timestamp);
            const skipped = log.status === 'SKIPPED';
            return (
              <View key={`${log.pointId}-${log.timestamp}`} className="mb-4 flex-row">
                <View className="mr-3 items-center">
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-full ${
                      skipped ? 'bg-slate-200' : 'bg-brand-light'
                    }`}>
                    <Feather
                      name={skipped ? 'skip-forward' : 'check'}
                      size={14}
                      color={skipped ? '#64748B' : '#0F6B4D'}
                    />
                  </View>
                  {index < trip.pointLogs.length - 1 ? (
                    <View className="mt-1 w-0.5 flex-1 bg-slate-200" />
                  ) : null}
                </View>
                <View className="flex-1 pb-2">
                  {skipped ? (
                    <Text className="text-base text-slate-400 line-through">
                      {name}
                    </Text>
                  ) : (
                    <Text className="text-base font-semibold text-slate-900">
                      {name} {clock ? `· ${clock}` : ''}
                    </Text>
                  )}
                  {skipped ? (
                    <Text className="mt-0.5 text-sm text-slate-400">
                      [ Pulado ] {clock ? `às ${clock}` : ''}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="p-4 pb-10">
          {vehicle ? (
            <BusSeatMap
              seatsMap={vehicle.seatsMap}
              studentsById={studentsById}
              executionStatusByStudentId={executionStatusByStudentId}
              readOnly
            />
          ) : (
            <Text className="text-sm text-slate-500">
              Nenhum veículo vinculado aos alunos desta rota.
            </Text>
          )}
          <Text className="mt-6 mb-2 text-sm font-bold text-slate-900">
            Todos os alunos
          </Text>
          {Object.values(trip.attendances).map((item) => {
            const student = studentsById[item.studentId];
            const clock = formatClock(item.recordedAt ?? '');
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
                    {clock ? (
                      <Text className="mt-0.5 text-xs text-slate-400">
                        Marcado às {clock}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() =>
                      startGuardianContact(student?.contactPhones, setContactPhones)
                    }
                    className="h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
                    <Feather name="phone" size={18} color="#0F6B4D" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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

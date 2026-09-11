import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppAlert, type AppAlertState } from '@/components/AppAlert';
import { HistoryTripCard } from '@/components/HistoryTripCard';
import { StartRouteSheet } from '@/components/StartRouteSheet';
import { cardShadow, palette } from '@/constants/Colors';
import { formatLongDate } from '@/lib/localDate';
import { allowedDirections, resolveOperationType } from '@/lib/operationType';
import { formatRouteTimeWindow } from '@/lib/routeSchedule';
import { selectExecutionHistory } from '@/store/attendanceSlice';
import { incompleteIdaTrip } from '@/store/executionSession';
import { selectAllRoutes } from '@/store/routeSlice';
import { useAppSelector } from '@/store/store';
import type { Route, RouteDirection } from '@/types';

const RECENT_TRIPS = 5;

function clockPeriodLabel(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Manhã';
  }
  if (hour < 18) {
    return 'Tarde';
  }
  return 'Noite';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const routes = useAppSelector(selectAllRoutes);
  const schoolEntities = useAppSelector((state) => state.schools.entities);
  const history = useAppSelector(selectExecutionHistory);
  const [sheetRoute, setSheetRoute] = useState<Route | null>(null);
  const [sheetDirection, setSheetDirection] = useState<RouteDirection | undefined>();
  const [openIncomplete, setOpenIncomplete] = useState(false);
  const [alert, setAlert] = useState<AppAlertState>(null);
  const recentHistory = history.slice(0, RECENT_TRIPS);

  const pendingRoute = useMemo(
    () => routes.find((route) => incompleteIdaTrip(history, route.id)),
    [history, routes],
  );

  function openSheet(
    route: Route,
    direction?: RouteDirection,
    justify = false,
  ) {
    setSheetDirection(direction);
    setOpenIncomplete(justify);
    setSheetRoute(route);
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        contentContainerStyle={{ paddingTop: insets.top + 8 }}>
          <View>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-[30px] font-bold text-ink">Início</Text>
                <Text className="mt-1 text-[14px] text-ink-muted">
                  {formatLongDate()} • Turno: {clockPeriodLabel()}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() =>
                    setAlert({
                      kind: 'info',
                      title: 'Notificações',
                      message: 'Não há notificações no momento.',
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Notificações"
                  className="h-11 w-11 items-center justify-center rounded-full border border-[#EEF2F6] bg-surface">
                  <Feather name="bell" size={18} color={palette.textPrimary} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (pendingRoute) {
                      openSheet(pendingRoute, 'IDA', true);
                      return;
                    }
                    setAlert({
                      kind: 'info',
                      title: 'Alertas',
                      message: 'Não há pendências no momento.',
                    });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Alertas de pendência"
                  className="h-11 w-11 items-center justify-center rounded-full border border-[#FECACA] bg-surface">
                  <Feather name="alert-circle" size={18} color={palette.danger} />
                </Pressable>
              </View>
            </View>

            {pendingRoute ? (
              <Pressable
                onPress={() => openSheet(pendingRoute, 'IDA', true)}
                accessibilityRole="button"
                accessibilityLabel="Justificar pendência"
                className="mt-5 rounded-card bg-[#FEE2E2] px-4 py-3">
                <View className="flex-row items-center">
                  <Feather name="alert-triangle" size={18} color={palette.danger} />
                  <Text className="ml-2 flex-1 text-[14px] font-bold text-[#991B1B]">
                    ATENÇÃO: Ciclo anterior pendente ({pendingRoute.title})
                  </Text>
                  <Feather name="chevron-right" size={18} color={palette.danger} />
                </View>
                <View className="mt-3 items-center rounded-full bg-[#FECACA] py-2">
                  <Text className="text-[13px] font-semibold text-[#991B1B]">
                    Toque aqui para Justificar Pendência
                  </Text>
                </View>
              </Pressable>
            ) : null}

            <Text className="mt-7 text-[13px] font-extrabold uppercase tracking-wide text-ink">
              Rotas disponíveis
            </Text>
            {routes.length === 0 ? (
              <Text className="mt-3 text-center text-base text-ink-muted">
                Nenhuma rota cadastrada. Cadastre uma em Cadastros.
              </Text>
            ) : (
              routes.map((route) => {
                const school = schoolEntities[route.schoolId];
                const schoolName = school?.name ?? 'Escola não encontrada';
                const directions = allowedDirections(resolveOperationType(route));
                const ready = !incompleteIdaTrip(history, route.id);
                return (
                  <View
                    key={route.id}
                    style={cardShadow}
                    className="mt-3 rounded-card border border-[#EEF2F6] bg-surface p-4">
                    <View className="flex-row items-start">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-pastel-route">
                        <Feather name="truck" size={20} color={palette.iconRoute} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-[18px] font-bold text-ink">
                          {route.title}
                        </Text>
                        <Text className="mt-0.5 text-[13px] text-ink-muted">
                          {schoolName}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View
                          className={`h-2 w-2 rounded-full ${
                            ready ? 'bg-success' : 'bg-warning'
                          }`}
                        />
                        <Text className="ml-1 text-[12px] font-semibold text-ink-secondary">
                          {ready ? 'Pronto' : 'Pendente'}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-4 flex-row gap-2">
                      {directions.includes('IDA') ? (
                        <Pressable
                          onPress={() => openSheet(route, 'IDA')}
                          accessibilityRole="button"
                          accessibilityLabel={`Iniciar Ida da rota ${route.title}`}
                          className="min-h-12 flex-1 flex-row items-center justify-center rounded-full bg-primary px-2">
                          <Feather name="sun" size={16} color="#FFFFFF" />
                          <Text className="ml-2 text-[12px] font-extrabold text-white">
                            INICIAR IDA
                          </Text>
                        </Pressable>
                      ) : null}
                      {directions.includes('VOLTA') ? (
                        <Pressable
                          onPress={() => openSheet(route, 'VOLTA')}
                          accessibilityRole="button"
                          accessibilityLabel={`Iniciar Volta da rota ${route.title}`}
                          className="min-h-12 flex-1 flex-row items-center justify-center rounded-full bg-primary-dark px-2">
                          <Feather name="moon" size={16} color="#FFFFFF" />
                          <Text className="ml-2 text-[12px] font-extrabold text-white">
                            INICIAR VOLTA
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                    <View className="mt-2 flex-row">
                      {directions.includes('IDA') ? (
                        <Text className="flex-1 text-center text-[12px] text-ink-muted">
                          {formatRouteTimeWindow(route, 'IDA')}
                        </Text>
                      ) : null}
                      {directions.includes('VOLTA') ? (
                        <Text className="flex-1 text-center text-[12px] text-ink-muted">
                          {formatRouteTimeWindow(route, 'VOLTA')}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}

            <View className="mt-8 flex-row items-center justify-between">
              <Text className="text-[13px] font-extrabold uppercase tracking-wide text-ink">
                Histórico recente
              </Text>
              <Pressable
                onPress={() => router.push('/history' as Href)}
                accessibilityRole="button"
                accessibilityLabel="Ver histórico">
                <Text className="text-[14px] font-semibold text-primary">Ver ›</Text>
              </Pressable>
            </View>
            {history.length === 0 ? (
              <Text className="mt-2 text-sm text-ink-muted">
                Nenhuma viagem encerrada ainda.
              </Text>
            ) : (
              <View
                style={cardShadow}
                className="mt-3 rounded-card border border-[#EEF2F6] bg-surface px-4">
                {recentHistory.map((item, index) => (
                  <View
                    key={item.id}
                    className={
                      index < recentHistory.length - 1
                        ? 'border-b border-[#EEF2F6]'
                        : ''
                    }>
                    <HistoryTripCard
                      compact
                      item={item}
                      title={
                        routes.find((route) => route.id === item.routeId)?.title ??
                        'Rota removida'
                      }
                      onPress={() => router.push(`/history/${item.id}` as Href)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
      </ScrollView>
      <StartRouteSheet
        route={sheetRoute}
        visible={sheetRoute !== null}
        initialDirection={sheetDirection}
        openIncompleteOnShow={openIncomplete}
        onClose={() => {
          setSheetRoute(null);
          setSheetDirection(undefined);
          setOpenIncomplete(false);
        }}
      />
      <AppAlert alert={alert} onDismiss={() => setAlert(null)} />
    </View>
  );
}

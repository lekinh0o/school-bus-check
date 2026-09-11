import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CycleAlertBanner } from '@/components/CycleAlertBanner';
import { DatePickerField } from '@/components/DatePickerField';
import { HistoryTripCard } from '@/components/HistoryTripCard';
import { cardShadow } from '@/constants/Colors';
import { cycleJustificationLabel } from '@/lib/cycleJustification';
import {
  formatDateKey,
  localDateKey,
  monthStartKey,
  shiftDateKey,
} from '@/lib/localDate';
import { selectExecutionHistory } from '@/store/attendanceSlice';
import { selectAllRoutes } from '@/store/routeSlice';
import { useAppSelector } from '@/store/store';

type RangePreset = 'all' | 'today' | 'week' | 'month' | 'custom';

export function HistoryFeed({ withSafeTop = false }: { withSafeTop?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const history = useAppSelector(selectExecutionHistory);
  const routes = useAppSelector(selectAllRoutes);
  const todayKey = localDateKey();
  const [fromKey, setFromKey] = useState('');
  const [toKey, setToKey] = useState('');

  const yearBounds = useMemo(() => {
    const currentYear = Number.parseInt(todayKey.slice(0, 4), 10);
    const years = history
      .map((item) => localDateKey(item.finishedAt || item.startedAt).slice(0, 4))
      .map((year) => Number.parseInt(year, 10))
      .filter((year) => Number.isFinite(year));
    const oldest = years.length > 0 ? Math.min(...years) : currentYear;
    return {
      minYear: Math.min(oldest, currentYear - 2),
      maxYear: currentYear,
    };
  }, [history, todayKey]);

  const weekStart = shiftDateKey(todayKey, -6);
  const monthStart = monthStartKey(todayKey);

  const preset: RangePreset = !fromKey && !toKey
    ? 'all'
    : fromKey === todayKey && toKey === todayKey
      ? 'today'
      : fromKey === weekStart && toKey === todayKey
        ? 'week'
        : fromKey === monthStart && toKey === todayKey
          ? 'month'
          : 'custom';

  const filtered = useMemo(() => {
    return history.filter((item) => {
      const key = localDateKey(item.finishedAt || item.startedAt);
      if (!key) {
        return false;
      }
      if (fromKey && key < fromKey) {
        return false;
      }
      if (toKey && key > toKey) {
        return false;
      }
      return true;
    });
  }, [fromKey, history, toKey]);

  function applyRange(nextFrom: string, nextTo: string) {
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setFromKey(nextTo);
      setToKey(nextFrom);
      return;
    }
    setFromKey(nextFrom);
    setToKey(nextTo);
  }

  function chipClass(active: boolean) {
    return `mr-2 mb-2 rounded-full border px-3 py-2 ${
      active ? 'border-primary bg-primary-light' : 'border-[#EEF2F6] bg-surface'
    }`;
  }

  const rangeLabel =
    fromKey && toKey
      ? fromKey === toKey
        ? formatDateKey(fromKey)
        : `${formatDateKey(fromKey)} — ${formatDateKey(toKey)}`
      : fromKey
        ? `A partir de ${formatDateKey(fromKey)}`
        : toKey
          ? `Até ${formatDateKey(toKey)}`
          : 'Todas as datas';

  return (
    <View
      className="flex-1 bg-background"
      style={withSafeTop ? { paddingTop: insets.top + 8 } : undefined}>
      {withSafeTop ? (
        <Text className="px-4 text-[30px] font-bold text-ink">Histórico</Text>
      ) : null}
      <View className="px-4 pt-3">
        <Text className="mb-2 text-[13px] font-extrabold uppercase text-ink">
          Filtrar por período
        </Text>
        <View className="flex-row flex-wrap">
          <Pressable
            onPress={() => applyRange('', '')}
            className={chipClass(preset === 'all')}>
            <Text className="text-[13px] font-semibold text-ink">Todas</Text>
          </Pressable>
          <Pressable
            onPress={() => applyRange(todayKey, todayKey)}
            className={chipClass(preset === 'today')}>
            <Text className="text-[13px] font-semibold text-ink">Hoje</Text>
          </Pressable>
          <Pressable
            onPress={() => applyRange(weekStart, todayKey)}
            className={chipClass(preset === 'week')}>
            <Text className="text-[13px] font-semibold text-ink">7 dias</Text>
          </Pressable>
          <Pressable
            onPress={() => applyRange(monthStart, todayKey)}
            className={chipClass(preset === 'month')}>
            <Text className="text-[13px] font-semibold text-ink">Este mês</Text>
          </Pressable>
        </View>
        <View className="mt-1 flex-row gap-2">
          <DatePickerField
            label="Data inicial"
            value={fromKey}
            minYear={yearBounds.minYear}
            maxYear={yearBounds.maxYear}
            onChange={(next) => applyRange(next, toKey || next)}
          />
          <DatePickerField
            label="Data final"
            value={toKey}
            minYear={yearBounds.minYear}
            maxYear={yearBounds.maxYear}
            onChange={(next) => applyRange(fromKey || next, next)}
          />
        </View>
        <Text className="mt-2 text-[13px] text-ink-muted">
          {filtered.length} {filtered.length === 1 ? 'viagem' : 'viagens'} · {rangeLabel}
        </Text>
      </View>
      <FlatList
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-base text-ink-muted">
            Nenhuma viagem neste período.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={cardShadow}
            className="mt-3 overflow-hidden rounded-card border border-[#EEF2F6] bg-surface">
            {item.cycleJustification ? (
              <View className="px-3 pt-3">
                <CycleAlertBanner
                  title="Justificativa de ciclo"
                  message={cycleJustificationLabel(item.cycleJustification)}
                />
              </View>
            ) : null}
            <View className="px-4">
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
          </View>
        )}
      />
    </View>
  );
}

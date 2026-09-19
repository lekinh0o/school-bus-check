import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useStore } from 'react-redux';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { palette } from '@/constants/Colors';
import { applyImportPlan } from '@/lib/excel/apply';
import { pickExcelBuffer, shareExcelSnapshot } from '@/lib/excel/files';
import { buildImportPlan } from '@/lib/excel/plan';
import { SHEET_TITLES, type ExcelEntityKind } from '@/lib/excel/contract';
import type { ImportPlan, PlannedRow } from '@/lib/excel/types';
import { selectAllRoutes } from '@/store/routeSlice';
import { selectAllSchools } from '@/store/schoolSlice';
import { selectAllStudents } from '@/store/studentSlice';
import { type RootState, useAppDispatch, useAppSelector } from '@/store/store';
import { selectAllVehicles } from '@/store/vehicleSlice';

const KIND_OPTIONS: { kind: ExcelEntityKind; label: string }[] = [
  { kind: 'vehicles', label: 'Veículos' },
  { kind: 'schools', label: 'Escolas' },
  { kind: 'routes', label: 'Rotas' },
  { kind: 'students', label: 'Alunos' },
];

const STATUS_LABEL: Record<PlannedRow['status'], string> = {
  new: 'Novo',
  update: 'Atualização',
  duplicate: 'Duplicidade',
  conflict: 'Conflito',
  missing_ref: 'Referência',
  error: 'Erro',
};

function snapshotFromStore(state: {
  vehicles: ReturnType<typeof selectAllVehicles>;
  schools: ReturnType<typeof selectAllSchools>;
  routes: ReturnType<typeof selectAllRoutes>;
  students: ReturnType<typeof selectAllStudents>;
}) {
  return state;
}

export function CadastroExcelPanel() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const vehicles = useAppSelector(selectAllVehicles);
  const schools = useAppSelector(selectAllSchools);
  const routes = useAppSelector(selectAllRoutes);
  const students = useAppSelector(selectAllStudents);
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportKinds, setExportKinds] = useState<ExcelEntityKind[]>([
    'vehicles',
    'schools',
    'routes',
    'students',
  ]);

  async function handleImport() {
    try {
      setBusy(true);
      const buffer = await pickExcelBuffer();
      if (!buffer) {
        return;
      }
      const next = buildImportPlan(
        snapshotFromStore({ vehicles, schools, routes, students }),
        buffer,
      );
      setPlan(next);
    } catch (error) {
      Alert.alert(
        'Importação',
        error instanceof Error ? error.message : 'Não foi possível ler o arquivo.',
      );
    } finally {
      setBusy(false);
    }
  }

  function handleConfirm() {
    if (!plan) {
      return;
    }
    applyImportPlan(dispatch, () => store.getState(), plan);
    setPlan(null);
  }

  async function handleExport() {
    if (exportKinds.length === 0) {
      Alert.alert('Exportação', 'Escolha pelo menos um cadastro.');
      return;
    }
    try {
      setBusy(true);
      const name =
        exportKinds.length === 4
          ? 'SchoolBusCheck.xlsx'
          : `${exportKinds.map((kind) => SHEET_TITLES[kind]).join('-')}.xlsx`;
      await shareExcelSnapshot(
        snapshotFromStore({ vehicles, schools, routes, students }),
        exportKinds,
        name,
      );
      setExportOpen(false);
    } catch (error) {
      Alert.alert(
        'Exportação',
        error instanceof Error ? error.message : 'Não foi possível exportar.',
      );
    } finally {
      setBusy(false);
    }
  }

  const previewBlocks = plan
    ? (['vehicles', 'schools', 'routes', 'students'] as const)
        .filter((kind) => plan.sheetsFound.includes(kind) || plan.totals[kind].rows > 0)
        .map((kind) => ({ kind, rows: plan[kind], totals: plan.totals[kind] }))
    : [];

  return (
    <View className="mt-2">
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => void handleImport()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Importar Excel"
          className="flex-1 items-center rounded-card bg-primary py-3">
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-semibold text-white">Importar Excel</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => setExportOpen(true)}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Exportar Excel"
          className="flex-1 items-center rounded-card border border-primary py-3">
          <Text className="font-semibold text-primary">Exportar Excel</Text>
        </Pressable>
      </View>

      <Modal visible={plan != null} animationType="slide" onRequestClose={() => setPlan(null)}>
        <View className="flex-1 bg-background px-4 pt-14">
          <Text className="text-[24px] font-bold text-ink">Prévia da importação</Text>
          <Text className="mt-2 text-[14px] text-ink-muted">
            Nada é gravado até você confirmar. Linhas inválidas ficam de fora.
          </Text>
          {plan?.ignoredSheets.length ? (
            <Text className="mt-2 text-[13px] text-ink-muted">
              Abas ignoradas: {plan.ignoredSheets.join(', ')}
            </Text>
          ) : null}
          {plan?.headerErrors.map((item) => (
            <Text key={item.sheet} className="mt-2 text-[13px] text-error">
              {item.sheet}: {item.message}
            </Text>
          ))}
          <ScrollView className="mt-4 flex-1">
            {previewBlocks.map((block) => (
              <View key={block.kind} className="mb-4 rounded-card border border-[#EEF2F6] bg-surface p-3">
                <Text className="text-[16px] font-bold text-ink">
                  {SHEET_TITLES[block.kind]}
                </Text>
                <Text className="mt-1 text-[13px] text-ink-muted">
                  {block.totals.rows} linhas · {block.totals.valid} válidas ·{' '}
                  {block.totals.invalid} com erro · {block.totals.news} novos ·{' '}
                  {block.totals.updates} atualizações
                </Text>
                {block.rows.slice(0, 40).map((row) => (
                  <Text
                    key={`${row.sheet}-${row.rowNumber}`}
                    className="mt-1 text-[12px] text-ink">
                    Linha {row.rowNumber}: {STATUS_LABEL[row.status]}
                    {row.field ? ` · ${row.field}` : ''}
                    {row.message ? ` · ${row.message}` : ''}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
          <View className="flex-row gap-3 pb-8">
            <Pressable
              onPress={() => setPlan(null)}
              className="flex-1 items-center rounded-card border border-[#EEF2F6] py-3">
              <Text className="font-semibold text-ink">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              className="flex-1 items-center rounded-card bg-primary py-3">
              <Text className="font-semibold text-white">Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={exportOpen} animationType="fade" transparent onRequestClose={() => setExportOpen(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-surface px-4 pb-10 pt-5">
            <Text className="text-[20px] font-bold text-ink">Exportar cadastros</Text>
            {KIND_OPTIONS.map((item) => {
              const on = exportKinds.includes(item.kind);
              return (
                <Pressable
                  key={item.kind}
                  onPress={() =>
                    setExportKinds((current) =>
                      on
                        ? current.filter((kind) => kind !== item.kind)
                        : [...current, item.kind],
                    )
                  }
                  className="mt-3 flex-row items-center justify-between py-2">
                  <Text className="text-[16px] text-ink">{item.label}</Text>
                  <Feather
                    name={on ? 'check-square' : 'square'}
                    size={20}
                    color={on ? palette.primary : palette.textMuted}
                  />
                </Pressable>
              );
            })}
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => setExportOpen(false)}
                className="flex-1 items-center rounded-card border border-[#EEF2F6] py-3">
                <Text className="font-semibold text-ink">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleExport()}
                className="flex-1 items-center rounded-card bg-primary py-3">
                <Text className="font-semibold text-white">Exportar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

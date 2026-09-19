import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'react-redux';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import { ImportReviewCenter } from '@/components/excel/ImportReviewCenter';
import { palette } from '@/constants/Colors';
import { ImportReviewController } from '@/lib/excel/controller';
import { NativeDraftStore } from '@/lib/excel/draftNative';
import { pickExcelFile, shareExcelSnapshot } from '@/lib/excel/files';
import { SHEET_TITLES, type ExcelEntityKind } from '@/lib/excel/contract';
import type { ApplySummary } from '@/lib/excel/apply';
import type { ImportSnapshot } from '@/lib/excel/types';
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

function snapshotFromStore(state: {
  vehicles: ReturnType<typeof selectAllVehicles>;
  schools: ReturnType<typeof selectAllSchools>;
  routes: ReturnType<typeof selectAllRoutes>;
  students: ReturnType<typeof selectAllStudents>;
}): ImportSnapshot {
  return state;
}

export function CadastroExcelPanel() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const vehicles = useAppSelector(selectAllVehicles);
  const schools = useAppSelector(selectAllSchools);
  const routes = useAppSelector(selectAllRoutes);
  const students = useAppSelector(selectAllStudents);
  const snapshot = snapshotFromStore({ vehicles, schools, routes, students });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportKinds, setExportKinds] = useState<ExcelEntityKind[]>([
    'vehicles',
    'schools',
    'routes',
    'students',
  ]);
  const controller = useMemo(
    () => new ImportReviewController(new NativeDraftStore()),
    [],
  );
  const [, setRevision] = useState(0);

  useEffect(() => {
    const unsubscribe = controller.subscribe(() => setRevision((current) => current + 1));
    void controller.detectDraft();
    return unsubscribe;
  }, [controller]);

  async function openPickedFile() {
    try {
      setBusy(true);
      const picked = await pickExcelFile();
      if (!picked) {
        return;
      }
      await controller.startFromFile(snapshot, picked.bytes, picked.fileName, picked.fileSize);
      setOpen(true);
    } catch (error) {
      Alert.alert(
        'Importação',
        error instanceof Error ? error.message : 'Não foi possível ler o arquivo.',
      );
    } finally {
      setBusy(false);
    }
  }

  function handleImport() {
    const offer = controller.getState().draftOffer;
    if (offer === 'unrecoverable') {
      Alert.alert(
        'Rascunho inválido',
        controller.getState().unrecoverableReason ??
          'O rascunho anterior não pode ser retomado.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Limpar e importar',
            onPress: () => {
              void controller.discard().then(() => void openPickedFile());
            },
          },
        ],
      );
      return;
    }
    if (offer === 'resume') {
      Alert.alert(
        'Rascunho em andamento',
        'Existe uma importação para retomar. Escolha retomar ou descartar antes de abrir outro arquivo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              void controller.discard().then(() => void openPickedFile());
            },
          },
          {
            text: 'Retomar',
            onPress: () => {
              void controller.resume(snapshot).then(() => setOpen(true));
            },
          },
        ],
      );
      return;
    }
    void openPickedFile();
  }

  function handleImported(summary: ApplySummary) {
    Alert.alert(
      'Importação concluída',
      `${summary.created} criados, ${summary.updated} atualizados, ${summary.skipped} de fora.`,
    );
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
      await shareExcelSnapshot(snapshot, exportKinds, name);
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

  return (
    <View className="mt-2">
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => void handleImport()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Importar Excel"
          className="min-h-14 flex-1 items-center justify-center rounded-card bg-primary py-3">
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
          className="min-h-14 flex-1 items-center justify-center rounded-card border border-primary py-3">
          <Text className="font-semibold text-primary">Exportar Excel</Text>
        </Pressable>
      </View>
      {controller.getState().draftOffer === 'resume' && !open ? (
        <Pressable
          onPress={() => {
            void controller.resume(snapshot).then(() => setOpen(true));
          }}
          accessibilityRole="button"
          accessibilityLabel="Retomar importação"
          className="mt-3 min-h-12 items-center justify-center rounded-card bg-blue-100 px-3 py-3">
          <Text className="font-semibold text-blue-800">Retomar importação em andamento</Text>
        </Pressable>
      ) : null}

      <ImportReviewCenter
        visible={open}
        controller={controller}
        snapshot={snapshot}
        dispatch={dispatch}
        getState={() => store.getState()}
        onClose={() => {
          setOpen(false);
          void controller.detectDraft();
        }}
        onImported={handleImported}
      />

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
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={item.label}
                  className="mt-3 min-h-11 flex-row items-center justify-between py-2">
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
                accessibilityRole="button"
                accessibilityLabel="Cancelar exportação"
                className="min-h-14 flex-1 items-center justify-center rounded-card border border-[#EEF2F6] py-3">
                <Text className="font-semibold text-ink">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleExport()}
                accessibilityRole="button"
                accessibilityLabel="Exportar"
                className="min-h-14 flex-1 items-center justify-center rounded-card bg-primary py-3">
                <Text className="font-semibold text-white">Exportar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

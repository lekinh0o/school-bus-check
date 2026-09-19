import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Modal, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/constants/Colors';
import type { ImportReviewController } from '@/lib/excel/controller';
import { findRow } from '@/lib/excel/reviewModel';
import type { ImportSnapshot } from '@/lib/excel/types';
import type { ApplySummary } from '@/lib/excel/apply';
import type { ExcelStoreState } from '@/lib/excel/apply';
import type { Dispatch } from '@reduxjs/toolkit';

import { AnalysisStep } from './AnalysisStep';
import { ConfirmationStep } from './ConfirmationStep';
import { CorrectionStep } from './CorrectionStep';
import { ReviewStep } from './ReviewStep';
import { CloseIconButton, ReviewStepper, SaveStatusLabel } from './reviewChrome';

export function ImportReviewCenter({
  visible,
  controller,
  snapshot,
  dispatch,
  getState,
  onClose,
  onImported,
}: {
  visible: boolean;
  controller: ImportReviewController;
  snapshot: ImportSnapshot;
  dispatch: Dispatch;
  getState: () => ExcelStoreState;
  onClose: () => void;
  onImported: (summary: ApplySummary) => void;
}) {
  const insets = useSafeAreaInsets();
  const [, setRevision] = useState(0);
  const view = controller.getState();
  const session = view.session;

  useEffect(() => {
    return controller.subscribe(() => setRevision((current) => current + 1));
  }, [controller]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      void controller.handleAppState(next);
    });
    return () => sub.remove();
  }, [controller]);

  if (!session) {
    return null;
  }

  const selected = view.selectedRowKey
    ? findRow(session.plan, view.selectedRowKey)
    : undefined;

  async function runImport(mode: 'importAll' | 'importEligible') {
    const result = await controller.confirm(
      snapshot,
      mode,
      dispatch,
      getState,
      mode === 'importEligible',
    );
    if (result.ok) {
      onImported(result.summary);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-3 py-2">
          <View className="flex-1">
            <Text className="text-[20px] font-bold text-ink">Revisão da importação</Text>
            <SaveStatusLabel status={view.saveStatus} error={view.saveError} />
          </View>
          <CloseIconButton onPress={onClose} label="Sair e continuar depois" />
        </View>
        <View className="px-4 pb-2">
          <ReviewStepper step={view.step} />
        </View>
        {view.busy ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={palette.primary} />
            <Text className="mt-3 text-ink-muted">Revalidando arquivo…</Text>
          </View>
        ) : view.step === 'analysis' ? (
          <AnalysisStep
            plan={session.plan}
            fileName={session.fileName}
            fileSize={session.fileSize}
            paddingBottom={insets.bottom}
            onContinue={() => controller.goReview()}
            onLeave={onClose}
          />
        ) : view.step === 'review' ? (
          <ReviewStep
            session={session}
            filter={view.filter}
            query={view.query}
            rows={controller.visibleRows()}
            paddingBottom={insets.bottom}
            onFilter={(filter) => controller.setFilter(filter)}
            onQuery={(query) => controller.setQuery(query)}
            onCorrect={(row) => controller.openCorrection(row.rowKey)}
            onIgnore={(row) => void controller.setDecision(snapshot, row.kind, row.rowNumber, 'ignore')}
            onRestore={(row) => void controller.setDecision(snapshot, row.kind, row.rowNumber, 'include')}
            onRevalidate={() => controller.revalidate(snapshot)}
            onConfirmEligible={() => controller.goConfirmation()}
            onConfirmAll={() => controller.goConfirmation()}
            onBack={() => controller.goAnalysis()}
          />
        ) : (view.step === 'correction' || view.step === 'correction-feedback') && selected ? (
          <CorrectionStep
            row={selected}
            snapshot={snapshot}
            plan={session.plan}
            paddingBottom={insets.bottom}
            onSave={(corrections) =>
              void controller.saveCorrections(
                snapshot,
                selected.kind,
                selected.rowNumber,
                corrections,
              )
            }
            onBack={() => controller.backToReview()}
            onNext={() => controller.openNextProblem()}
            onIgnore={() =>
              void controller.setDecision(snapshot, selected.kind, selected.rowNumber, 'ignore')
            }
          />
        ) : (
          <ConfirmationStep
            session={session}
            paddingBottom={insets.bottom}
            result={view.result?.ok ? view.result.summary : undefined}
            onBack={() => controller.backToReview()}
            onImportAll={() => void runImport('importAll')}
            onImportEligible={() => void runImport('importEligible')}
            onDone={() => {
              controller.resetAfterResult();
              onClose();
            }}
          />
        )}
      </View>
    </Modal>
  );
}

import { Modal, Pressable, Text, View } from 'react-native';

type LeaveConfirmSheetProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onStay: () => void;
  onLeave: () => void;
};

export function LeaveConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  onStay,
  onLeave,
}: LeaveConfirmSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onStay}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onStay}>
        <Pressable
          onPress={() => undefined}
          className="rounded-t-3xl bg-surface px-5 pb-8 pt-5">
          <Text className="text-xl font-bold text-ink">{title}</Text>
          <Text className="mt-2 text-sm text-ink-muted">{message}</Text>
          <Pressable
            onPress={onLeave}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            className="mt-5 min-h-14 items-center justify-center rounded-button bg-primary py-4">
            <Text className="text-base font-bold text-white">{confirmLabel}</Text>
          </Pressable>
          <Pressable
            onPress={onStay}
            accessibilityRole="button"
            accessibilityLabel="Ficar"
            className="mt-2 min-h-14 items-center justify-center rounded-button border border-divider py-4">
            <Text className="text-base font-bold text-ink">Ficar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

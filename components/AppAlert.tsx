import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

export type AppAlertKind = 'info' | 'warning' | 'error';

export type AppAlertState = {
  kind: AppAlertKind;
  title: string;
  message: string;
} | null;

const KIND_STYLE: Record<
  AppAlertKind,
  { bg: string; iconBg: string; icon: keyof typeof Feather.glyphMap; iconColor: string; title: string }
> = {
  info: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    icon: 'info',
    iconColor: '#1D4ED8',
    title: 'text-blue-900',
  },
  warning: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    icon: 'alert-triangle',
    iconColor: '#B45309',
    title: 'text-amber-950',
  },
  error: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    icon: 'alert-circle',
    iconColor: '#DC2626',
    title: 'text-red-900',
  },
};

type AppAlertProps = {
  alert: AppAlertState;
  onDismiss: () => void;
};

export function AppAlert({ alert, onDismiss }: AppAlertProps) {
  if (!alert) {
    return null;
  }
  const style = KIND_STYLE[alert.kind];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-6"
        onPress={onDismiss}>
        <Pressable
          onPress={() => undefined}
          className={`w-full max-w-md rounded-2xl border border-slate-200 p-5 ${style.bg}`}>
          <View className="flex-row items-start">
            <View
              className={`h-12 w-12 items-center justify-center rounded-full ${style.iconBg}`}>
              <Feather name={style.icon} size={24} color={style.iconColor} />
            </View>
            <View className="ml-3 flex-1">
              <Text className={`text-lg font-bold ${style.title}`}>{alert.title}</Text>
              <Text className="mt-2 text-sm text-slate-700">{alert.message}</Text>
            </View>
          </View>
          <Pressable
            onPress={onDismiss}
            className="mt-5 items-center rounded-xl bg-white py-3">
            <Text className="text-sm font-bold text-slate-800">Entendi</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

import { useNavigation } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

type UseLeaveConfirmationOptions = {
  shouldConfirm: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirmLeave?: () => void;
  presentation?: 'alert' | 'sheet';
};

export function useLeaveConfirmation({
  shouldConfirm,
  title,
  message,
  confirmLabel = 'Sair',
  onConfirmLeave,
  presentation = 'alert',
}: UseLeaveConfirmationOptions) {
  const navigation = useNavigation();
  const skipRef = useRef(false);
  const [blockedAction, setBlockedAction] = useState<unknown>(null);

  function allowNextLeave() {
    skipRef.current = true;
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (skipRef.current || !shouldConfirm) {
        return;
      }
      event.preventDefault();
      if (presentation === 'sheet') {
        setBlockedAction(event.data.action);
        return;
      }
      Alert.alert(title, message, [
        { text: 'Ficar', style: 'cancel' },
        {
          text: confirmLabel,
          onPress: () => {
            skipRef.current = true;
            onConfirmLeave?.();
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    });
    return unsubscribe;
  }, [
    confirmLabel,
    message,
    navigation,
    onConfirmLeave,
    presentation,
    shouldConfirm,
    title,
  ]);

  function stay() {
    setBlockedAction(null);
  }

  function leave() {
    if (!blockedAction) {
      return;
    }
    skipRef.current = true;
    onConfirmLeave?.();
    navigation.dispatch(blockedAction as never);
    setBlockedAction(null);
  }

  return {
    allowNextLeave,
    sheetVisible: presentation === 'sheet' && blockedAction !== null,
    stay,
    leave,
  };
}

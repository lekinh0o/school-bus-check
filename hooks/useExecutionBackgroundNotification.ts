import Constants from 'expo-constants';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { store } from '@/store/store';

const CHANNEL_ID = 'execution-progress';
const isExpoGo = Constants.appOwnership === 'expo';

type NotificationsModule = typeof import('expo-notifications');

function loadNotifications(): NotificationsModule | null {
  if (isExpoGo) {
    return null;
  }
  try {
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
}

export function useExecutionBackgroundNotification() {
  useEffect(() => {
    const Notifications = loadNotifications();
    if (!Notifications) {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    let notificationId: string | null = null;

    async function ensurePermission(): Promise<boolean> {
      if (!Notifications) {
        return false;
      }
      const current = await Notifications.getPermissionsAsync();
      if (current.granted) {
        return true;
      }
      const asked = await Notifications.requestPermissionsAsync();
      return asked.granted;
    }

    async function show() {
      if (!Notifications) {
        return;
      }
      const execution = store.getState().attendance.activeExecution;
      if (execution?.status !== 'IN_PROGRESS') {
        return;
      }
      const allowed = await ensurePermission();
      if (!allowed) {
        return;
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Execução de rota',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rota em execução',
          body: 'A chamada continua em andamento. Volte ao app para retomar.',
          ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
        },
        trigger: null,
      });
    }

    async function hide() {
      if (!Notifications) {
        return;
      }
      if (notificationId) {
        await Notifications.dismissNotificationAsync(notificationId);
        notificationId = null;
      }
      await Notifications.dismissAllNotificationsAsync();
    }

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        void show();
        return;
      }
      if (next === 'active') {
        void hide();
      }
    });

    return () => {
      sub.remove();
      void hide();
    };
  }, []);
}

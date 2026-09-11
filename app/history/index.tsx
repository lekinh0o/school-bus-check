import { Stack } from 'expo-router';
import { View } from 'react-native';

import { HistoryFeed } from '@/components/HistoryFeed';

export default function HistoryListScreen() {
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Histórico' }} />
      <HistoryFeed />
    </View>
  );
}

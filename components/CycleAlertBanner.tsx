import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { palette } from '@/constants/Colors';

export function CycleAlertBanner({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View className="rounded-card bg-[#FEE2E2] px-4 py-3">
      <View className="flex-row items-start">
        <Feather name="alert-triangle" size={18} color={palette.danger} />
        <View className="ml-2 flex-1">
          <Text className="text-[13px] font-extrabold text-[#991B1B]">{title}</Text>
          <Text className="mt-1 text-[13px] text-[#991B1B]">{message}</Text>
        </View>
      </View>
    </View>
  );
}

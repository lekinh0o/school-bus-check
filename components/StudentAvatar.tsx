import { Feather } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';

type StudentAvatarProps = {
  photoUri?: string;
  onLongPress?: () => void;
};

export function StudentAvatar({ photoUri, onLongPress }: StudentAvatarProps) {
  return (
    <Pressable
      disabled={!photoUri || !onLongPress}
      onLongPress={photoUri ? onLongPress : undefined}
      delayLongPress={350}
      className="h-16 w-16">
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          className="h-16 w-16 rounded-full bg-slate-200"
        />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-slate-200">
          <Feather name="user" size={22} color="#94A3B8" />
        </View>
      )}
    </Pressable>
  );
}

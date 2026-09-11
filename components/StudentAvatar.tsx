import { Feather } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';

type AvatarSize = 'md' | 'lg';

type StudentAvatarProps = {
  photoUri?: string;
  onLongPress?: () => void;
  size?: AvatarSize;
};

const SIZE_CLASS: Record<AvatarSize, string> = {
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

const ICON_SIZE: Record<AvatarSize, number> = {
  md: 22,
  lg: 36,
};

export function StudentAvatar({
  photoUri,
  onLongPress,
  size = 'md',
}: StudentAvatarProps) {
  const box = SIZE_CLASS[size];
  return (
    <Pressable
      disabled={!photoUri || !onLongPress}
      onLongPress={photoUri ? onLongPress : undefined}
      delayLongPress={350}
      accessibilityRole="image"
      className={box}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} className={`${box} rounded-full bg-slate-700`} />
      ) : (
        <View className={`${box} items-center justify-center rounded-full bg-slate-700`}>
          <Feather name="user" size={ICON_SIZE[size]} color="#E2E8F0" />
        </View>
      )}
    </Pressable>
  );
}

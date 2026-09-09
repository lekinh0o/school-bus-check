import { Feather } from '@expo/vector-icons';
import { Image, Modal, Pressable, Text, View } from 'react-native';

type StudentPhotoPreviewProps = {
  visible: boolean;
  name: string;
  photoUri?: string;
  onClose: () => void;
};

export function StudentPhotoPreview({
  visible,
  name,
  photoUri,
  onClose,
}: StudentPhotoPreviewProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/80 px-6"
        onPress={onClose}>
        <Pressable onPress={() => undefined} className="w-full items-center">
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              className="h-72 w-72 rounded-3xl bg-slate-200"
              resizeMode="cover"
            />
          ) : (
            <View className="h-72 w-72 items-center justify-center rounded-3xl bg-slate-200">
              <Feather name="user" size={64} color="#94A3B8" />
            </View>
          )}
          <Text className="mt-4 text-center text-xl font-bold text-white">{name}</Text>
          <Pressable onPress={onClose} className="mt-6 rounded-xl bg-white px-6 py-3">
            <Text className="text-sm font-bold text-slate-800">Fechar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

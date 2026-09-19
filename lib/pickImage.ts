import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const pickerOptions = (aspect: [number, number]): ImagePicker.ImagePickerOptions => ({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect,
  quality: 0.7,
});

async function pickFromLibrary(aspect: [number, number]): Promise<string | undefined> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return undefined;
  }

  const result = await ImagePicker.launchImageLibraryAsync(pickerOptions(aspect));
  if (result.canceled) {
    return undefined;
  }

  return result.assets[0]?.uri;
}

async function pickFromCamera(aspect: [number, number]): Promise<string | undefined> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return undefined;
  }

  const result = await ImagePicker.launchCameraAsync(pickerOptions(aspect));
  if (result.canceled) {
    return undefined;
  }

  return result.assets[0]?.uri;
}

export async function pickLocalImage(
  aspect: [number, number] = [4, 3],
): Promise<string | undefined> {
  return new Promise((resolve) => {
    Alert.alert(
      'Adicionar foto',
      'Deseja usar a câmera ou escolher uma foto existente?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(undefined),
        },
        {
          text: 'Escolher foto',
          onPress: () => {
            void pickFromLibrary(aspect).then(resolve);
          },
        },
        {
          text: 'Usar câmera',
          onPress: () => {
            void pickFromCamera(aspect).then(resolve);
          },
        },
      ],
    );
  });
}

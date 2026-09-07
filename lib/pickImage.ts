import * as ImagePicker from 'expo-image-picker';

export async function pickLocalImage(
  aspect: [number, number] = [4, 3],
): Promise<string | undefined> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return undefined;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.7,
  });

  if (result.canceled) {
    return undefined;
  }

  return result.assets[0]?.uri;
}

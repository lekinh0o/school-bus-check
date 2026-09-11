import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { Vibration } from 'react-native';

const arrivalSound = require('../assets/sounds/arrival.wav');

let player: AudioPlayer | null = null;

export async function playArrivalChime(): Promise<void> {
  try {
    Vibration.vibrate(80);
  } catch {
    // vibration is optional
  }
  try {
    if (!player) {
      player = createAudioPlayer(arrivalSound);
    }
    await player.seekTo(0);
    player.play();
  } catch {
    // visual geofence feedback remains
  }
}

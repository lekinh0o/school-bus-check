import { Linking } from 'react-native';

import { digitsOnly } from '@/lib/inputMasks';

export function openGuardianContact(phone: string) {
  const digits = digitsOnly(phone, 13);
  if (digits.length < 10) {
    return;
  }
  const wa = digits.length >= 12 ? digits : `55${digits}`;
  void Linking.openURL(`https://wa.me/${wa}`);
}

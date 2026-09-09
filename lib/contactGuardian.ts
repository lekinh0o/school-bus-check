import { Linking } from 'react-native';

import { digitsOnly } from '@/lib/inputMasks';

export function usablePhones(phones: string[] | undefined): string[] {
  return (phones ?? []).filter((phone) => digitsOnly(phone, 13).length >= 10);
}

export function openWhatsApp(phone: string) {
  const digits = digitsOnly(phone, 13);
  if (digits.length < 10) {
    return;
  }
  const wa = digits.length >= 12 ? digits : `55${digits}`;
  void Linking.openURL(`https://wa.me/${wa}`);
}

export function openPhoneCall(phone: string) {
  const digits = digitsOnly(phone, 13);
  if (digits.length < 10) {
    return;
  }
  void Linking.openURL(`tel:${digits}`);
}

export function openGuardianContact(phone: string) {
  openWhatsApp(phone);
}

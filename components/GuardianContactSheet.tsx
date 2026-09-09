import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { formatPhoneBr } from '@/lib/inputMasks';
import { openPhoneCall, openWhatsApp, usablePhones } from '@/lib/contactGuardian';

type GuardianContactSheetProps = {
  phones: string[];
  visible: boolean;
  onClose: () => void;
};

export function GuardianContactSheet({
  phones,
  visible,
  onClose,
}: GuardianContactSheetProps) {
  const valid = usablePhones(phones);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setPicked(null);
    }
  }, [visible]);

  function handleClose() {
    setPicked(null);
    onClose();
  }

  const selected = picked ?? (valid.length === 1 ? valid[0] : null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={handleClose}>
        <Pressable
          onPress={() => undefined}
          className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
          <Text className="text-lg font-bold text-slate-900">Contato do responsável</Text>
          {!selected ? (
            <>
              <Text className="mt-1 text-sm text-slate-500">
                Escolha o número.
              </Text>
              {valid.map((phone, index) => (
                <Pressable
                  key={`${phone}-${index}`}
                  onPress={() => setPicked(phone)}
                  className="mt-3 rounded-2xl border border-slate-200 px-4 py-4">
                  <Text className="text-base font-semibold text-slate-900">
                    Telefone {index + 1}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500">
                    {formatPhoneBr(phone)}
                  </Text>
                </Pressable>
              ))}
            </>
          ) : (
            <>
              <Text className="mt-1 text-sm text-slate-500">
                {formatPhoneBr(selected)}
              </Text>
              <Pressable
                onPress={() => {
                  openWhatsApp(selected);
                  handleClose();
                }}
                className="mt-4 items-center rounded-2xl bg-brand py-4">
                <Text className="text-base font-bold text-white">WhatsApp</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  openPhoneCall(selected);
                  handleClose();
                }}
                className="mt-2 items-center rounded-2xl border border-slate-300 py-4">
                <Text className="text-base font-bold text-slate-800">Ligar</Text>
              </Pressable>
            </>
          )}
          <Pressable onPress={handleClose} className="mt-3 items-center py-2">
            <Text className="text-sm font-semibold text-slate-500">Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function startGuardianContact(
  phones: string[] | undefined,
  openSheet: (phones: string[]) => void,
) {
  const valid = usablePhones(phones);
  if (valid.length === 0) {
    return;
  }
  if (valid.length === 1) {
    openWhatsApp(valid[0]);
    return;
  }
  openSheet(valid);
}

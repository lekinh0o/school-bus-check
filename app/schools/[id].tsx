import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { addSchool, selectSchoolById, updateSchool } from '@/store/schoolSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';

export default function SchoolFormScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isCreate = id === 'new';

  const existing = useAppSelector((state) =>
    !isCreate && id ? selectSchoolById(state, id) : undefined,
  );

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [principal, setPrincipal] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!existing) {
      return;
    }
    setName(existing.name);
    setAddress(existing.address);
    setPrincipal(existing.principal);
    setPhone(existing.phone);
  }, [existing]);

  const canSubmit =
    name.trim().length > 0 &&
    address.trim().length > 0 &&
    principal.trim().length > 0 &&
    phone.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    const fields = {
      name: name.trim(),
      address: address.trim(),
      principal: principal.trim(),
      phone: phone.trim(),
    };

    if (isCreate) {
      dispatch(
        addSchool({
          id: Date.now().toString(),
          ...fields,
          studentIds: [],
          routeIds: [],
        }),
      );
    } else if (id) {
      dispatch(
        updateSchool({
          id,
          changes: fields,
        }),
      );
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/schools' as Href);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{ title: isCreate ? 'Nova escola' : 'Editar escola' }}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-10"
        keyboardShouldPersistTaps="handled">
        <Text className="mb-2 text-sm font-semibold text-slate-700">Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Escola Municipal..."
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Endereço
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Rua, número, bairro"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Diretor(a)
        </Text>
        <TextInput
          value={principal}
          onChangeText={setPrincipal}
          placeholder="Nome do diretor ou diretora"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-slate-700">
          Telefone
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="(00) 00000-0000"
          placeholderTextColor="#94A3B8"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />

        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`mt-8 items-center rounded-2xl py-5 ${
            canSubmit ? 'bg-brand' : 'bg-slate-300'
          }`}>
          <Text className="text-lg font-bold text-white">Salvar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

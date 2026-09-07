import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
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
import { formatPhoneBr, isValidPhoneBr } from '@/lib/inputMasks';
import { pickLocalImage } from '@/lib/pickImage';

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
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  useEffect(() => {
    if (!existing) {
      return;
    }
    setName(existing.name);
    setAddress(existing.address);
    setPrincipal(existing.principal);
    setPhone(formatPhoneBr(existing.phone));
    setPhotoUri(existing.photoUri);
  }, [existing]);

  const canSubmit =
    name.trim().length > 0 &&
    address.trim().length > 0 &&
    principal.trim().length > 0 &&
    isValidPhoneBr(phone);

  async function handlePickPhoto() {
    const uri = await pickLocalImage([4, 3]);
    if (uri) {
      setPhotoUri(uri);
    }
  }

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    const fields = {
      name: name.trim(),
      address: address.trim(),
      principal: principal.trim(),
      phone: formatPhoneBr(phone),
      photoUri,
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
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            className="mb-4 h-40 w-full rounded-2xl bg-slate-200"
            resizeMode="cover"
          />
        ) : null}
        <Pressable
          onPress={handlePickPhoto}
          className="mb-4 items-center rounded-2xl border border-brand bg-brand-light py-4">
          <Text className="text-base font-semibold text-brand-dark">
            Adicionar Foto da Escola
          </Text>
        </Pressable>

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
          onChangeText={(value) => setPhone(formatPhoneBr(value))}
          keyboardType="phone-pad"
          placeholder="(31) 99999-9999"
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

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import * as api from '@/api';
import { PersonAvatar } from '@/components/blocks';
import { Button, Field, Screen, TopBar } from '@/components/ui';
import { useStore } from '@/store/app';

export default function Profile() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.user?.name ?? '');
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [city, setCity] = useState(state.user?.city ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const user = await api.updateMe({ name: name.trim(), email: email.trim() || null, city: city.trim() });
    dispatch({ type: 'user', user });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={<Button label="Save" size="lg" full loading={saving} disabled={!name.trim()} onPress={save} />}>
        <TopBar title="Your profile" />
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <PersonAvatar name={name || 'You'} size={84} />
        </View>
        <View style={{ gap: 16 }}>
          <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
          <Field label="Mobile number" value={state.user?.phone ?? ''} editable={false} hint="Your number is your login and can't be changed here." />
          <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Field label="City" value={city} onChangeText={setCity} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

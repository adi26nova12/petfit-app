import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import * as api from '@/api';
import { Button, Eyebrow, Field, Row, Screen, T, TopBar } from '@/components/ui';
import { colors } from '@/theme';

const peek = require('@/assets/brand/luna-pip-peek.webp');

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const valid = /^[6-9]\d{9}$/.test(phone);

  const submit = async () => {
    if (!valid) {
      setError('Enter a 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      const { requestId } = await api.sendOtp(`+91${phone}`);
      router.push({ pathname: '/otp', params: { phone, requestId } });
    } catch {
      setError('Could not send the code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        footer={<Button label="Get OTP" size="lg" full loading={loading} disabled={phone.length < 10} onPress={submit} />}>
        <TopBar />
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Image source={peek} style={{ width: 260, height: 166 }} contentFit="contain" accessibilityLabel="Luna and Pip" />
        </View>
        <Eyebrow style={{ marginTop: 18 }}>Welcome to PetFit</Eyebrow>
        <T v="h1">Log in or sign up</T>
        <T v="body" style={{ marginTop: 6 }}>We'll send a one-time code to your mobile number.</T>

        <Field
          style={{ marginTop: 24 }}
          label="Mobile number"
          prefix="+91"
          keyboardType="number-pad"
          maxLength={10}
          autoFocus
          placeholder="98100 12345"
          value={phone}
          error={error}
          textContentType="telephoneNumber"
          autoComplete="tel"
          onChangeText={(t) => {
            setPhone(t.replace(/\D/g, ''));
            setError(undefined);
          }}
          onSubmitEditing={submit}
        />

        <Row gap={8} style={{ marginTop: 20 }} align="flex-start">
          <ShieldCheck size={16} color={colors.teal} />
          <T v="caption" style={{ flex: 1 }}>
            By continuing you agree to PetFit's <T v="caption" color={colors.brand600}>Terms of Use</T> and{' '}
            <T v="caption" color={colors.brand600}>Privacy Policy</T>. We never share your number with providers without a booking.
          </T>
        </Row>
      </Screen>
    </KeyboardAvoidingView>
  );
}

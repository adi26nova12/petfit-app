import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';

import * as api from '@/api';
import { USE_MOCKS } from '@/api/client';
import { Button, Eyebrow, Notice, Row, Screen, T, TopBar } from '@/components/ui';
import { useStore } from '@/store/app';
import { colors, fonts, radius } from '@/theme';

const LENGTH = 6;

export default function Otp() {
  const { phone = '', requestId = '' } = useLocalSearchParams<{ phone?: string; requestId?: string }>();
  const { signIn } = useStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(30);
  const input = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = async (value = code) => {
    if (value.length !== LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(requestId, value);
      // Signing in flips the route guard in the root layout, which lands the user on Home.
      await signIn(res.token, res.user);
    } catch {
      setError("That code didn't match. Check the SMS and try again.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={<Button label="Verify & continue" size="lg" full loading={loading} disabled={code.length !== LENGTH} onPress={() => verify()} />}>
        <TopBar />
        <Eyebrow style={{ marginTop: 12 }}>Verify your number</Eyebrow>
        <T v="h1">Enter the 6-digit code</T>
        <T v="body" style={{ marginTop: 6 }}>Sent by SMS to +91 {phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</T>

        <Pressable onPress={() => input.current?.focus()} style={{ marginTop: 28 }} accessibilityLabel="One-time code">
          <Row gap={8} style={{ justifyContent: 'space-between' }}>
            {Array.from({ length: LENGTH }, (_, i) => {
              const active = i === code.length;
              return (
                <View key={i} style={[styles.box, active && styles.boxActive, !!error && { borderColor: colors.danger }]}>
                  <T v="h2">{code[i] ?? ''}</T>
                </View>
              );
            })}
          </Row>
          <TextInput
            ref={input}
            value={code}
            autoFocus
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={LENGTH}
            onChangeText={(t) => {
              const v = t.replace(/\D/g, '');
              setCode(v);
              setError(null);
              if (v.length === LENGTH) verify(v);
            }}
            style={styles.hidden}
          />
        </Pressable>
        {error ? <T v="small" color={colors.danger} style={{ marginTop: 10 }}>{error}</T> : null}

        <Row style={{ marginTop: 22 }}>
          {seconds > 0 ? (
            <T v="small">Resend code in <T v="smallStrong">0:{String(seconds).padStart(2, '0')}</T></T>
          ) : (
            <T
              v="smallStrong"
              color={colors.brand600}
              onPress={() => {
                api.sendOtp(`+91${phone}`);
                setSeconds(30);
              }}>
              Resend code
            </T>
          )}
        </Row>

        {USE_MOCKS ? <Notice tone="purple" style={{ marginTop: 28 }} title="Demo mode" body="Any 6 digits will sign you in to the sample account." /> : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    aspectRatio: 0.85,
    maxWidth: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.brand600, borderWidth: 2 },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1, fontFamily: fonts.body },
});

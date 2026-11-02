import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Everything behind sign-in. The root layout protects this whole group. */
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream }, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="pet-form" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="booking-success" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="order-success" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}

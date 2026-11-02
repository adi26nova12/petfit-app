import { Redirect } from 'expo-router';

import { useStore } from '@/store/app';

/** Entry point: signed-in users land on Home, everyone else on onboarding (or login once seen). */
export default function Index() {
  const { state } = useStore();
  if (state.token) return <Redirect href="/home" />;
  return <Redirect href={state.onboarded ? '/login' : '/onboarding'} />;
}

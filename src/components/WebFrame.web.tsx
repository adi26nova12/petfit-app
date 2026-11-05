/**
 * Web preview on a laptop: show the app inside a phone, the way people will hold it.
 * The phone is an iframe of this same page, so every screen lays out at true phone width
 * (screens size themselves from the window). Phones and narrow windows get the app directly.
 */
import { useState, type ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

const logo = require('@/assets/brand/petfit-logo.png');
const MIN_DESKTOP = 760;

function shouldFrame() {
  if (typeof window === 'undefined') return false;
  return window.self === window.top && window.innerWidth >= MIN_DESKTOP;
}

export function WebFrame({ children }: { children: ReactNode }) {
  const [framed] = useState(shouldFrame);
  const [src] = useState(() => (typeof window === 'undefined' ? '' : window.location.href));
  if (!framed) return children;

  const height = Math.min(844, window.innerHeight - 48);
  return (
    <View style={styles.page}>
      <View style={styles.side}>
        <Image source={logo} style={{ width: 117, height: 40 }} resizeMode="contain" accessibilityLabel="PetFit" />
        <Text style={styles.title}>The PetFit app</Text>
        <Text style={styles.body}>
          A live preview of the Android and iOS app. Tap around inside the phone: sign in with any 10-digit mobile number and any 6-digit code.
        </Text>
        <Text style={styles.hint}>Opening this link on a phone shows the app full screen.</Text>
      </View>
      <View style={[styles.phone, { height }]}>
        <iframe src={src} title="PetFit app preview" style={{ width: '100%', height: '100%', border: 0, borderRadius: 34, background: colors.cream }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 56,
    padding: 24,
    backgroundColor: colors.cream,
  },
  side: { maxWidth: 340, gap: 14 },
  title: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, letterSpacing: -0.8, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 26, color: colors.inkSoft },
  hint: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.brand600 },
  phone: {
    width: 390,
    padding: 10,
    borderRadius: 44,
    backgroundColor: colors.ink,
    shadowColor: colors.brand900,
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 30 },
  },
});

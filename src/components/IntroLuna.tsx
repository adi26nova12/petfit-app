/**
 * Opening sequence, as on the website (IntroLoader): Luna dashes across with her doodles,
 * then the app fades in. Plays once per launch, muted; tap Skip to jump ahead.
 * The clip is drawn on white, so the overlay is white too.
 */
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { Easing, runOnJS, useReducedMotion, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

import { colors, fonts } from '@/theme';

const clip = require('@/assets/brand/intro-luna.mp4');
/** If the clip can't play (or stalls), never hold the user longer than this. */
const MAX_MS = 7000;

let playedThisLaunch = false;

export function IntroLuna() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(!playedThisLaunch && !reduced);
  const fade = useSharedValue(1);
  const player = useVideoPlayer(show ? clip : null, (p) => {
    p.muted = true;
    p.loop = false;
    p.play();
  });

  const finish = () => {
    playedThisLaunch = true;
    fade.set(
      withTiming(0, { duration: 450, easing: Easing.out(Easing.quad) }, (done) => {
        if (done) runOnJS(setShow)(false);
      }),
    );
  };

  useEventListener(player, 'playToEnd', finish);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(finish, MAX_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const style = useAnimatedStyle(() => ({ opacity: fade.value }));

  if (!show) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, style]}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />
      <Pressable accessibilityRole="button" accessibilityLabel="Skip intro" onPress={finish} style={styles.skip} hitSlop={10}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 100, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', aspectRatio: 16 / 9 },
  skip: {
    position: 'absolute',
    right: 20,
    bottom: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.inkSoft },
});

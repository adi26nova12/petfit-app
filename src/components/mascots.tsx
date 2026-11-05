/**
 * Luna & Pip, alive — the app's take on the website's mascots (HeroMascots / PeekMascots).
 *
 * MascotStage: the sitting pair as two cut-outs that breathe, glance at each other when idle,
 * lean towards your finger, and hop with a puff of hearts when tapped (Pip is the eager one;
 * Luna takes her time). PeekMascots: the peeking pair swaying from the paws with a speech bubble
 * that pops in, as on the website's inner pages. Both stay still when Reduce Motion is on.
 */
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, fonts, shadow } from '@/theme';
import { Doodle } from './doodles';

const tap = () => {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

const luna = require('@/assets/brand/luna-full.webp');
const pip = require('@/assets/brand/pip-full.webp');
const peek = require('@/assets/brand/luna-pip-peek.webp');

/** Both cut-outs share the 900×700 canvas of the original artwork, so they stack in register. */
const SIT_RATIO = 700 / 900;
const PEEK_RATIO = 577 / 900;

type PetKey = 'luna' | 'pip';
/** Where each pet's paws sit across the artwork: the pivot for breathing, leaning and hops. */
const FEET: Record<PetKey, number> = { luna: 0.24, pip: 0.66 };
/** Tapping left of this fraction pokes Luna, right of it pokes Pip. */
const SPLIT = 0.45;

const DEFAULT_LINES = ['Woof. Need a groomer?', 'Meow. Booking fee? ₹0.', 'My whole file is in here.', 'Tap us. We dare you.'];
const POKE_LINES: Record<PetKey, string[]> = {
  pip: ['Woof!', 'Again! Again!', 'Walkies?'],
  luna: ['Meow.', 'Paws off, please.', 'Fine. One more.'],
};

const sine = Easing.inOut(Easing.sin);

function usePetMotion(pet: PetKey, reduced: boolean, height: number) {
  const breathe = useSharedValue(0);
  const glance = useSharedValue(0);
  const follow = useSharedValue(0);
  const hop = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    breathe.set(withRepeat(withTiming(1, { duration: pet === 'pip' ? 1700 : 2300, easing: sine }), -1, true));
    // Idle chat: every few seconds they lean in towards each other, then settle.
    const toOther = pet === 'pip' ? -2.4 : 2.2;
    glance.set(
      withRepeat(
        withSequence(
          withDelay(pet === 'pip' ? 1400 : 2600, withTiming(toOther, { duration: 650, easing: sine })),
          withDelay(1300, withTiming(0, { duration: 900, easing: sine })),
          withDelay(pet === 'pip' ? 2000 : 1500, withTiming(-toOther * 0.45, { duration: 1100, easing: sine })),
          withTiming(0, { duration: 1100, easing: sine }),
        ),
        -1,
      ),
    );
  }, [pet, reduced, breathe, glance]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: -hop.value },
      { rotate: `${glance.value + follow.value}deg` },
      { scaleY: 1 + breathe.value * 0.012 },
      { scaleX: 1 - breathe.value * 0.004 },
    ],
  }));

  const jump = (power = 1) => {
    const up = height * 0.09 * power * (pet === 'pip' ? 1 : 0.75);
    hop.set(
      withSequence(
        withTiming(up, { duration: pet === 'pip' ? 160 : 210, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 7, stiffness: 190 }),
      ),
    );
  };
  /** Lean towards a finger at x (stage px); `null` settles back upright. */
  const lean = (x: number | null, width: number) => {
    if (x == null) {
      follow.set(withSpring(0, { damping: 12, stiffness: 90 }));
      return;
    }
    const d = (x - FEET[pet] * width) / width;
    follow.set(withSpring(Math.max(-5, Math.min(5, d * 9)), { damping: 14, stiffness: 120 }));
  };

  return { style, jump, lean };
}

type Puff = { id: number; x: number; y: number };

function Heart({ x, y, delay, drift }: { x: number; y: number; delay: number; drift: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })));
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value,
    transform: [{ translateX: drift * t.value }, { translateY: -70 * t.value }, { scale: 0.6 + t.value * 0.6 }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: x - 12, top: y - 12 }, style]}>
      <Doodle name="heart" size={24} />
    </Animated.View>
  );
}

function Bubble({ text, pop, side = 'left', style }: { text: string; pop: SharedValue<number>; side?: 'left' | 'right'; style?: StyleProp<ViewStyle> }) {
  const anim = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value * 1.4), transform: [{ scale: 0.6 + pop.value * 0.4 }, { translateY: (1 - pop.value) * 8 }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.bubble, side === 'left' ? styles.bubbleLeft : styles.bubbleRight, style, anim]}>
      <Animated.Text style={styles.bubbleText}>{text}</Animated.Text>
      <View style={[styles.tail, side === 'left' ? { left: 26 } : { right: 26 }]} />
    </Animated.View>
  );
}

export function MascotStage({
  width,
  lines = DEFAULT_LINES,
  celebrate,
  style,
}: {
  width: number;
  /** Speech-bubble lines, cycled every few seconds. Pass [] for no bubble. */
  lines?: string[];
  /** Both hop for joy as soon as they appear (booking / order confirmed). */
  celebrate?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const height = width * SIT_RATIO;
  const reduced = useReducedMotion();
  const L = usePetMotion('luna', reduced, height);
  const P = usePetMotion('pip', reduced, height);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const [line, setLine] = useState(lines[0] ?? '');
  const [speaker, setSpeaker] = useState<PetKey>('pip');
  const pop = useSharedValue(0);
  const start = useRef({ x: 0, y: 0 });
  const seq = useRef(0);

  const say = (text: string, who: PetKey) => {
    setLine(text);
    setSpeaker(who);
    pop.set(0);
    pop.set(withSpring(1, { damping: 9, stiffness: 220 }));
  };

  useEffect(() => {
    if (!lines.length) return;
    pop.set(withDelay(500, withSpring(1, { damping: 9, stiffness: 220 })));
    if (lines.length < 2) return;
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % lines.length;
      setLine(lines[i]);
      // Lines alternate between them: Pip opens, Luna answers.
      setSpeaker(i % 2 ? 'luna' : 'pip');
      pop.set(0);
      pop.set(withSpring(1, { damping: 9, stiffness: 220 }));
    }, 3800);
    return () => clearInterval(timer);
  }, [lines, pop]);

  useEffect(() => {
    if (!celebrate || reduced) return;
    const a = setTimeout(() => P.jump(1.2), 350);
    const b = setTimeout(() => L.jump(1.1), 520);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate, reduced]);

  const lean = (x: number) => {
    if (reduced) return;
    L.lean(x, width);
    P.lean(x, width);
  };
  const settle = () => {
    L.lean(null, width);
    P.lean(null, width);
  };

  const poke = (x: number, y: number) => {
    const pet: PetKey = x < width * SPLIT ? 'luna' : 'pip';
    tap();
    (pet === 'pip' ? P : L).jump();
    const id = ++seq.current;
    setPuffs((p) => [...p.slice(-8), { id, x, y }]);
    setTimeout(() => setPuffs((p) => p.filter((q) => q.id !== id)), 1400);
    const options = POKE_LINES[pet];
    if (lines.length) say(options[id % options.length], pet);
  };

  const point = (e: GestureResponderEvent) => ({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY });

  return (
    // Pressable owns the tap (and yields cleanly to a parent scroll or swipe); touch-move lets them follow a dragged finger.
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Luna the cat and Pip the golden retriever. Tap to say hi."
      onPressIn={(e) => {
        start.current = point(e);
        lean(start.current.x);
      }}
      onTouchMove={(e) => lean(point(e).x)}
      onPress={(e) => {
        const p = point(e);
        // Web reports the release point; fall back to where the press began if it's missing.
        poke(Number.isFinite(p.x) ? p.x : start.current.x, Number.isFinite(p.y) ? p.y : start.current.y);
      }}
      onPressOut={settle}
      style={[{ width, height }, style]}>
      {/* Pip sits behind Luna, as in the artwork. */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transformOrigin: [`${FEET.pip * 100}%`, '96%', 0] }, P.style]}>
        <Image source={pip} style={StyleSheet.absoluteFill} contentFit="contain" />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transformOrigin: [`${FEET.luna * 100}%`, '96%', 0] }, L.style]}>
        <Image source={luna} style={StyleSheet.absoluteFill} contentFit="contain" />
      </Animated.View>
      {puffs.map((p) =>
        [0, 1, 2, 3].map((k) => <Heart key={`${p.id}-${k}`} x={p.x + (k - 1.5) * 10} y={p.y} delay={k * 70} drift={(k - 1.5) * 16} />),
      )}
      {lines.length ? (
        <Bubble
          text={line}
          pop={pop}
          side={speaker === 'pip' ? 'right' : 'left'}
          style={speaker === 'pip' ? { top: -6, right: width * 0.02 } : { top: -6, left: width * 0.02 }}
        />
      ) : null}
    </Pressable>
  );
}

/** Luna & Pip peeking over an edge, swaying from the paws, with an optional speech bubble. */
export function PeekMascots({ width, say, side = 'left', style }: { width: number; say?: string; side?: 'left' | 'right'; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const sway = useSharedValue(0);
  const pop = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    sway.set(withRepeat(withTiming(1, { duration: 2500, easing: sine }), -1, true));
    pop.set(withDelay(600, withSpring(1, { damping: 8, stiffness: 200 })));
  }, [reduced, sway, pop]);

  const swayStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-1.6 * sway.value}deg` }] }));

  return (
    <View style={[{ width, height: width * PEEK_RATIO }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: ['50%', '100%', 0] }, swayStyle]}>
        <Image source={peek} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityLabel="Luna the cat and Pip the golden retriever" />
      </Animated.View>
      {say ? <Bubble text={say} pop={pop} side={side} style={side === 'left' ? { top: -18, left: -width * 0.08 } : { top: -18, right: -width * 0.06 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    maxWidth: 190,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  bubbleLeft: { transformOrigin: ['20%', '100%', 0] },
  bubbleRight: { transformOrigin: ['80%', '100%', 0] },
  bubbleText: { fontFamily: fonts.bodyBold, fontSize: 13.5, lineHeight: 18, color: colors.ink },
  tail: {
    position: 'absolute',
    bottom: -7,
    width: 14,
    height: 14,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    transform: [{ rotate: '45deg' }],
  },
});

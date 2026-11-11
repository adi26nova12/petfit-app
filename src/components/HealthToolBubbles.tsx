/**
 * The free health tools as small floating bubbles: each bobs gently on its own rhythm
 * so the corner of the pet card feels alive. Still when the user prefers reduced motion.
 */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { colors, fonts, shadow, tones, type Tone } from '@/theme';
import { ScoreRing } from './charts';
import { Flame, Scale, Syringe, type DoodleIcon } from './doodles';
import { T, tap } from './ui';

const BUBBLE = 48;

type Tool = { key: string; label: string; tone: Tone; icon?: DoodleIcon; tool?: string };

const tools: Tool[] = [
  { key: 'health', label: 'Health', tone: 'purple' },
  { key: 'calories', label: 'Calories', tone: 'amber', icon: Flame, tool: 'calories' },
  { key: 'weight', label: 'Ideal weight', tone: 'teal', icon: Scale, tool: 'weight' },
  { key: 'vaccines', label: 'Vaccines', tone: 'blush', icon: Syringe, tool: 'vaccines' },
];

export function HealthToolBubbles({ healthScore }: { healthScore?: number }) {
  const router = useRouter();
  const shown = healthScore == null ? tools.filter((t) => t.key !== 'health') : tools;
  return (
    <View style={styles.wrap}>
      <T style={styles.eyebrow}>Free health tools</T>
      <View style={styles.grid}>
        {shown.map((t, i) => (
          <Bubble
            key={t.key}
            index={i}
            label={t.label}
            tone={t.tone}
            onPress={() => {
              tap();
              if (t.tool) router.push({ pathname: '/tools/[tool]', params: { tool: t.tool } });
              else router.push('/pets');
            }}>
            {t.icon ? <t.icon size={28} /> : <ScoreRing score={healthScore ?? 0} size={38} stroke={4} />}
          </Bubble>
        ))}
      </View>
    </View>
  );
}

function Bubble({ index, label, tone, onPress, children }: { index: number; label: string; tone: Tone; onPress: () => void; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    // Different periods and start offsets so the four never move in lockstep.
    const period = 1500 + index * 260;
    t.set(withDelay(index * 220, withRepeat(withTiming(1, { duration: period, easing: Easing.inOut(Easing.sin) }), -1, true)));
  }, [reduced, index, t]);

  const float = useAnimatedStyle(() => ({
    transform: [{ translateY: -5 * t.value }, { rotate: `${(index % 2 ? -5 : 5) * (t.value - 0.5)}deg` }],
  }));
  const shadowStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 0.25 * t.value }], opacity: 0.18 - 0.08 * t.value }));

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4} style={({ pressed }) => [styles.cell, pressed && { opacity: 0.75 }]}>
      <Animated.View style={[styles.bubble, { backgroundColor: tones[tone].bg }, float]}>{children}</Animated.View>
      <Animated.View style={[styles.groundShadow, shadowStyle]} />
      <T numberOfLines={1} style={styles.label}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 128, alignItems: 'center' },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.brand600, marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', rowGap: 6 },
  cell: { width: 64, alignItems: 'center' },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...shadow.card,
  },
  groundShadow: { width: 30, height: 4, borderRadius: 2, backgroundColor: colors.brand900, marginTop: 3 },
  label: { fontFamily: fonts.bodyBold, fontSize: 10.5, lineHeight: 13, color: colors.ink, marginTop: 2 },
});

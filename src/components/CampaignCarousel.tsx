/** Home marketing carousel: snapping slides with a peek of the next one, dots, and gentle auto-advance. */
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { Campaign } from '@/data/campaigns';
import { colors, fonts, radius, space } from '@/theme';
import { Doodle } from './doodles';
import { PeekMascots } from './mascots';
import { T, tap } from './ui';

const GAP = 12;
const HEIGHT = 156;
const AUTO_MS = 5000;

export function CampaignCarousel({ items }: { items: Campaign[] }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const ref = useRef<ScrollViewInstance>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  const slideW = Math.max(0, width - space.gutter * 2);
  const step = slideW + GAP;

  // Auto-advance; the timer restarts whenever the slide changes, and pauses while the user drags.
  useEffect(() => {
    if (reduced || dragging || !step || items.length < 2) return;
    const t = setTimeout(() => ref.current?.scrollTo({ x: ((index + 1) % items.length) * step, animated: true }), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, dragging, reduced, step, items.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!step) return;
    const i = Math.min(items.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.x / step)));
    if (i !== index) setIndex(i);
  };

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step || undefined}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => setDragging(true)}
        onScrollEndDrag={() => setDragging(false)}
        contentContainerStyle={{ paddingHorizontal: space.gutter, gap: GAP }}>
        {slideW > 0
          ? items.map((c, i) => (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`${c.title}. ${c.body}. Slide ${i + 1} of ${items.length}`}
              onPress={() => {
                tap();
                router.push(c.href);
              }}
              style={({ pressed }) => [styles.slide, { width: slideW, backgroundColor: c.bg }, pressed && { opacity: 0.94 }]}>
              <View style={styles.copy}>
                <T v="eyebrow" color={c.accent}>{c.eyebrow}</T>
                <T v="h2" color={c.ink} style={{ marginTop: 3 }} numberOfLines={2}>{c.title}</T>
                <T v="small" color={c.ink} style={{ marginTop: 4, opacity: 0.85 }} numberOfLines={2}>{c.body}</T>
                <View style={[styles.cta, { backgroundColor: c.ink }]}>
                  <T style={[styles.ctaText, { color: c.bg }]}>{c.cta}</T>
                  <ArrowRight size={13} color={c.bg} strokeWidth={2.6} />
                </View>
              </View>
              {c.art === 'mascots' ? (
                <PeekMascots width={118} style={styles.mascots} />
              ) : (
                <View style={styles.art}>
                  <View style={[styles.artGlow, { backgroundColor: c.ink }]} />
                  <Doodle name={c.art} size={74} />
                </View>
              )}
            </Pressable>
          ))
          : <View style={{ height: HEIGHT }} />}
      </ScrollView>

      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((c, i) => (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`Show slide ${i + 1}`}
              hitSlop={8}
              onPress={() => ref.current?.scrollTo({ x: i * step, animated: true })}>
              <View style={[styles.dot, i === index && styles.dotOn]} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: HEIGHT,
    borderRadius: radius.xl,
    paddingLeft: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  copy: { flex: 1, paddingRight: 4, justifyContent: 'center' },
  cta: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 12.5 },
  mascots: { alignSelf: 'flex-end', marginBottom: -18, marginRight: -6 },
  art: { width: 104, alignItems: 'center', justifyContent: 'center' },
  artGlow: { position: 'absolute', width: 96, height: 96, borderRadius: 48, opacity: 0.12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand200 },
  dotOn: { width: 18, backgroundColor: colors.brand600 },
});

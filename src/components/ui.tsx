/**
 * PetFit UI primitives. Visual language follows petfit.in:
 * Bricolage display type, Figtree body, chunky "3D" pill buttons with an
 * offset under-shadow, white cards with hairline ink borders on a cream canvas.
 */
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Minus, Plus, Star } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse } from 'react-native-svg';

import { colors, fonts, radius, shadow, space, tones, type Tone } from '@/theme';
import { PeekMascots } from './mascots';

export const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};

/* ---------- Text ---------- */

type Variant = 'hero' | 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodyStrong' | 'small' | 'smallStrong' | 'caption' | 'eyebrow' | 'serif';
const textVariants: Record<Variant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 36, letterSpacing: -0.8, color: colors.ink },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: -0.6, color: colors.ink },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.4, color: colors.ink },
  h3: { fontFamily: fonts.displayBold, fontSize: 18, lineHeight: 22, letterSpacing: -0.2, color: colors.ink },
  title: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 21, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  bodyStrong: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 22, color: colors.ink },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
  smallStrong: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 18, color: colors.ink },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 11.5, lineHeight: 15, color: colors.muted },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11.5, lineHeight: 15, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.brand600 },
  serif: { fontFamily: fonts.serifItalic, fontSize: 34, lineHeight: 36, color: colors.brand600 },
};

export function T({ v = 'body', color, center, style, ...rest }: TextProps & { v?: Variant; color?: string; center?: boolean }) {
  return <Text {...rest} style={[textVariants[v], color != null && { color }, center && { textAlign: 'center' }, style]} />;
}

/** The paw mark used for eyebrows and bullets, same shape as the web's --pawmask. */
export function Paw({ size = 16, color = colors.amber }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Ellipse cx="12" cy="16" rx="5.5" ry="4.5" fill={color} />
      <Ellipse cx="5" cy="10" rx="2.2" ry="2.8" fill={color} />
      <Ellipse cx="19" cy="10" rx="2.2" ry="2.8" fill={color} />
      <Ellipse cx="9" cy="5.5" rx="2.2" ry="2.8" fill={color} />
      <Ellipse cx="15" cy="5.5" rx="2.2" ry="2.8" fill={color} />
    </Svg>
  );
}

export function Eyebrow({ children, color = colors.brand600, style }: { children: ReactNode; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }, style]}>
      <Paw size={14} />
      <T v="eyebrow" color={color}>{children}</T>
    </View>
  );
}

/* ---------- Layout ---------- */

export function Screen({
  children,
  scroll = true,
  bg = colors.cream,
  padded = true,
  edges = ['top'],
  footer,
  contentStyle,
  ...scrollProps
}: {
  children: ReactNode;
  scroll?: boolean;
  bg?: string;
  padded?: boolean;
  edges?: ('top' | 'bottom')[];
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
} & Omit<ScrollViewProps, 'contentContainerStyle'>) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingHorizontal: padded ? space.gutter : 0,
  };
  const bottom = edges.includes('bottom') && !footer ? insets.bottom : 0;
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {scroll ? (
        <ScrollView
          {...scrollProps}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[pad, { paddingBottom: 32 + bottom }, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>{footer}</View>
      ) : null}
    </View>
  );
}

/** In-screen top bar with a back button. Native headers are off app-wide so every screen shares this look. */
export function TopBar({ title, subtitle, right, onBack, light }: { title?: string; subtitle?: string; right?: ReactNode; onBack?: () => void; light?: boolean }) {
  const router = useRouter();
  const fg = light ? colors.white : colors.ink;
  return (
    <View style={styles.topbar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={10}
        onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/home'))}
        style={[styles.backBtn, light && { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'transparent' }]}>
        <ChevronLeft size={22} color={fg} />
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        {title ? <T v="h3" color={fg} numberOfLines={1}>{title}</T> : null}
        {subtitle ? <T v="caption" color={light ? colors.brand200 : colors.muted} numberOfLines={1}>{subtitle}</T> : null}
      </View>
      {right}
    </View>
  );
}

export function Row({ children, gap = space.sm, style, align = 'center' }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle>; align?: ViewStyle['alignItems'] }) {
  return <View style={[{ flexDirection: 'row', alignItems: align, gap }, style]}>{children}</View>;
}

export function Gap({ h = space.lg }: { h?: number }) {
  return <View style={{ height: h }} />;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong }, style]} />;
}

export function SectionHeader({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Row style={[{ justifyContent: 'space-between', marginTop: space.xxl, marginBottom: space.md }, style]}>
      <T v="h2" style={{ flexShrink: 1 }}>{title}</T>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Row gap={2}>
            <T v="smallStrong" color={colors.brand600}>{action}</T>
            <ChevronRight size={16} color={colors.brand600} />
          </Row>
        </Pressable>
      ) : null}
    </Row>
  );
}

/* ---------- Buttons ---------- */

type BtnVariant = 'primary' | 'amber' | 'outline' | 'ghost' | 'danger' | 'white';
const btn: Record<BtnVariant, { bg: string; fg: string; under?: string; border?: string }> = {
  primary: { bg: colors.brand600, fg: colors.white, under: colors.brand900 },
  amber: { bg: colors.amber, fg: colors.ink, under: colors.amberDeep },
  white: { bg: colors.white, fg: colors.brand700, under: colors.brand300 },
  danger: { bg: colors.danger, fg: colors.white, under: '#7a1710' },
  outline: { bg: 'transparent', fg: colors.ink, border: colors.ink },
  ghost: { bg: 'transparent', fg: colors.brand700 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  full,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = btn[variant];
  const pad = size === 'lg' ? { paddingVertical: 16, paddingHorizontal: 26 } : size === 'sm' ? { paddingVertical: 8, paddingHorizontal: 14 } : { paddingVertical: 12, paddingHorizontal: 20 };
  const under = v.under && !disabled ? 4 : 0;
  const inactive = disabled || loading;
  return (
    <View style={[{ alignSelf: full ? 'stretch' : 'flex-start', borderRadius: radius.pill, backgroundColor: v.under && !disabled ? v.under : 'transparent', paddingBottom: under }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!inactive }}
        disabled={inactive}
        onPress={() => {
          tap();
          onPress?.();
        }}
        style={({ pressed }) => [
          styles.btn,
          pad,
          { backgroundColor: disabled ? colors.brand100 : v.bg },
          v.border && { borderWidth: 2, borderColor: v.border },
          pressed && { transform: [{ translateY: under ? 3 : 0 }], opacity: under ? 1 : 0.7 },
        ]}>
        {loading ? (
          <ActivityIndicator color={v.fg} />
        ) : (
          <>
            {icon}
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: size === 'lg' ? 16.5 : size === 'sm' ? 13.5 : 15, color: disabled ? colors.brand400 : v.fg }}>{label}</Text>
            {iconRight}
          </>
        )}
      </Pressable>
    </View>
  );
}

export function IconButton({ children, onPress, label, badge, style, tone = 'white' }: { children: ReactNode; onPress?: () => void; label: string; badge?: number; style?: StyleProp<ViewStyle>; tone?: 'white' | 'glass' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress?.();
      }}
      hitSlop={6}
      style={({ pressed }) => [styles.iconBtn, tone === 'glass' && { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.2)' }, pressed && { opacity: 0.7 }, style]}>
      {children}
      {badge ? (
        <View style={styles.badgeDot}>
          <Text style={{ color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 10 }}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ---------- Surfaces ---------- */

export function Card({ children, style, onPress, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: PressableProps['onPress']; padded?: boolean }) {
  const base = [styles.card, padded && { padding: space.lg }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [...base, pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 }]}>
      {children}
    </Pressable>
  );
}

export function Pill({ label, tone = 'purple', icon, style }: { label: string; tone?: Tone | 'ink' | 'success' | 'danger'; icon?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t =
    tone === 'ink' ? { bg: colors.ink, fg: colors.white }
      : tone === 'success' ? { bg: colors.tealSoft, fg: colors.teal }
        : tone === 'danger' ? { bg: colors.dangerSoft, fg: colors.danger }
          : tones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }, style]}>
      {icon}
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11.5, color: t.fg }}>{label}</Text>
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[styles.chip, selected && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
      {icon}
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13.5, color: selected ? colors.white : colors.ink }}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.gutter }} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: 8 }}>
      {children}
    </ScrollView>
  );
}

export function IconTile({ tone = 'purple', size = 44, children, style }: { tone?: Tone; size?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: tones[tone].bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      {children}
    </View>
  );
}

export function Segmented<K extends string>({ options, value, onChange }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              tap();
              onChange(o.key);
            }}
            style={[styles.segmentItem, on && styles.segmentOn]}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13.5, color: on ? colors.brand700 : colors.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Inputs ---------- */

export function Field({ label, hint, error, prefix, style, ...input }: TextInputProps & { label?: string; hint?: string; error?: string; prefix?: string }) {
  return (
    <View style={[{ gap: 6 }, style as StyleProp<ViewStyle>]}>
      {label ? <T v="smallStrong">{label}</T> : null}
      <View style={[styles.field, error ? { borderColor: colors.danger } : null]}>
        {prefix ? <T v="bodyStrong" style={{ marginRight: 8 }}>{prefix}</T> : null}
        <TextInput placeholderTextColor={colors.muted} {...input} style={[styles.input, input.multiline && { minHeight: 96, textAlignVertical: 'top', paddingTop: 12 }]} />
      </View>
      {error ? <T v="caption" color={colors.danger}>{error}</T> : hint ? <T v="caption">{hint}</T> : null}
    </View>
  );
}

export function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <Row gap={0} style={styles.stepper}>
      <Pressable accessibilityLabel="Decrease" onPress={() => { tap(); onChange(Math.max(min, value - 1)); }} style={styles.stepBtn}>
        <Minus size={16} color={colors.brand700} />
      </Pressable>
      <T v="title" style={{ minWidth: 26, textAlign: 'center' }}>{value}</T>
      <Pressable accessibilityLabel="Increase" onPress={() => { tap(); onChange(value + 1); }} style={styles.stepBtn}>
        <Plus size={16} color={colors.brand700} />
      </Pressable>
    </Row>
  );
}

/* ---------- Feedback ---------- */

export function Rating({ value, reviews, light }: { value: number | null; reviews?: number; light?: boolean }) {
  if (value == null) return <T v="caption">New</T>;
  return (
    <Row gap={3}>
      <Star size={13} color={colors.amber} fill={colors.amber} />
      <T v="smallStrong" color={light ? colors.white : colors.ink}>{value.toFixed(1)}</T>
      {reviews != null ? <T v="caption" color={light ? colors.brand200 : colors.muted}>({reviews})</T> : null}
    </Row>
  );
}

export function Skeleton({ h = 80, style }: { h?: number; style?: StyleProp<ViewStyle> }) {
  const [o] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [o]);
  return <Animated.View style={[{ height: h, borderRadius: radius.lg, backgroundColor: colors.brand100, opacity: o }, style]} />;
}

export function Loading({ rows = 3, h = 96 }: { rows?: number; h?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={h} />)}
    </View>
  );
}


/** Luna & Pip peeking over an empty state, as on the web's inner pages. */
export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12 }}>
      <PeekMascots width={200} />
      <T v="h3" center style={{ marginTop: 12 }}>{title}</T>
      {body ? <T v="body" center style={{ marginTop: 6 }}>{body}</T> : null}
      {action ? <View style={{ marginTop: 18 }}>{action}</View> : null}
    </View>
  );
}

export function Notice({ tone = 'amber', icon, title, body, style, onPress }: { tone?: Tone; icon?: ReactNode; title: string; body?: string; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const t = tones[tone];
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={[{ backgroundColor: t.bg, borderRadius: radius.lg, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }, style]}>
      {icon}
      <View style={{ flex: 1 }}>
        <T v="smallStrong" color={t.fg}>{title}</T>
        {body ? <T v="caption" color={t.fg} style={{ opacity: 0.85, marginTop: 2 }}>{body}</T> : null}
      </View>
      {onPress ? <ChevronRight size={18} color={t.fg} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: space.gutter,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineStrong,
  },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, marginBottom: 6 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btn: { borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  segment: { flexDirection: 'row', backgroundColor: colors.brand50, borderRadius: radius.pill, padding: 4, borderWidth: 1, borderColor: colors.brand100 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.pill },
  segmentOn: { backgroundColor: colors.white, ...shadow.card },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.ink, paddingVertical: Platform.OS === 'ios' ? 14 : 11 },
  stepper: { backgroundColor: colors.brand50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.brand100 },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
});

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, BadgeCheck, FileText, FlaskConical, Scissors, Stethoscope, Syringe } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View, type ListViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Paw, Row, T } from '@/components/ui';
import { useStore } from '@/store/app';
import { colors, fonts, radius } from '@/theme';

const duo = require('@/assets/brand/luna-pip-sitting.webp');
const logo = require('@/assets/brand/petfit-logo-white.png');

type Slide = { key: string; lead: string; accent: string; tail: string; body: string };
const slides: Slide[] = [
  { key: 'one', lead: "Your pet's", accent: 'vet, groomer, dinner.', tail: 'One app.', body: 'Vets, labs, grooming, boarding, food, toys and travel. Clear prices, booked in a tap.' },
  { key: 'two', lead: 'One profile that', accent: 'remembers', tail: 'everything.', body: 'Vaccinations, vet visits, lab reports and prescriptions — added to the vault automatically.' },
  { key: 'three', lead: 'Booking fee?', accent: '₹0.', tail: 'Always.', body: 'Every vet, groomer and lab is verified before listing. You pay the price on the card.' },
];

function Visual({ slide, width }: { slide: Slide; width: number }) {
  if (slide.key === 'one') {
    return <Image source={duo} style={{ width: width * 0.86, height: width * 0.67 }} contentFit="contain" accessibilityLabel="Luna the cat and Pip the dog" />;
  }
  if (slide.key === 'two') {
    const docs = [
      { icon: Syringe, title: 'Vaccination card', sub: 'Updated 12 Apr', bg: colors.amberSoft, fg: colors.amberInk },
      { icon: FlaskConical, title: 'Blood report (CBC)', sub: 'Lab · uploaded by lab', bg: colors.tealSoft, fg: colors.teal },
      { icon: FileText, title: 'Prescription', sub: 'From your vet', bg: colors.brand100, fg: colors.brand600 },
    ];
    return (
      <View style={{ width: width * 0.8, gap: 12, paddingVertical: 24 }}>
        {docs.map((d, i) => (
          <View key={d.title} style={[styles.doc, { transform: [{ rotate: `${(i - 1) * -2.5}deg` }, { translateX: (i - 1) * 14 }] }]}>
            <View style={[styles.docIcon, { backgroundColor: d.bg }]}><d.icon size={20} color={d.fg} /></View>
            <View style={{ flex: 1 }}>
              <T v="title">{d.title}</T>
              <T v="caption">{d.sub}</T>
            </View>
          </View>
        ))}
      </View>
    );
  }
  const chips = [
    { icon: Stethoscope, label: 'Vet consult', price: '₹399' },
    { icon: Scissors, label: 'Bath + haircut', price: '₹1,299' },
    { icon: FlaskConical, label: 'Full body test', price: '₹2,499' },
  ];
  return (
    <View style={{ width: width * 0.8, gap: 10, paddingVertical: 24 }}>
      {chips.map((c) => (
        <View key={c.label} style={styles.doc}>
          <View style={[styles.docIcon, { backgroundColor: colors.brand100 }]}><c.icon size={20} color={colors.brand600} /></View>
          <View style={{ flex: 1 }}>
            <T v="title">{c.label}</T>
            <Row gap={4}><BadgeCheck size={13} color={colors.teal} /><T v="caption" color={colors.teal}>Verified</T></Row>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <T v="title">{c.price}</T>
            <T v="caption" color={colors.teal}>+ ₹0 fee</T>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dispatch } = useStore();
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList<Slide>>(null);
  const onViewable = useCallback(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }, []);

  const last = index === slides.length - 1;
  const next = () => {
    if (last) {
      dispatch({ type: 'onboarded' });
      router.push('/login');
    } else {
      list.current?.scrollToIndex({ index: index + 1 });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.brand900, paddingTop: insets.top }}>
      <StatusBar style="light" />
      <View style={styles.glow} />
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Image source={logo} style={{ width: 96, height: 33 }} contentFit="contain" accessibilityLabel="PetFit" />
        {!last ? (
          <T v="smallStrong" color={colors.brand200} onPress={() => list.current?.scrollToIndex({ index: slides.length - 1 })}>Skip</T>
        ) : null}
      </Row>

      <FlatList
        ref={list}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: 24, justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', minHeight: width * 0.7, justifyContent: 'center' }}>
              <Visual slide={item} width={width} />
            </View>
            <T v="hero" color={colors.white} style={{ marginTop: 18, fontSize: 36, lineHeight: 40 }}>
              {item.lead} <T style={styles.accent}>{item.accent}</T> {item.tail}
            </T>
            <T v="body" color={colors.brand200} style={{ marginTop: 12, fontSize: 16, lineHeight: 24 }}>{item.body}</T>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 20), gap: 18 }}>
        <Row gap={8}>
          {slides.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotOn]}>
              {i === index ? <Paw size={10} color={colors.ink} /> : null}
            </View>
          ))}
        </Row>
        <Button label={last ? 'Get started' : 'Next'} variant="amber" size="lg" full onPress={next} iconRight={<ArrowRight size={18} color={colors.ink} />} />
        <T v="small" center color={colors.brand200}>
          Already on PetFit?{' '}
          <T v="smallStrong" color={colors.white} onPress={() => { dispatch({ type: 'onboarded' }); router.push('/login'); }}>Log in</T>
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute', top: -120, right: -140, width: 420, height: 420, borderRadius: 210, backgroundColor: colors.brand700, opacity: 0.55 },
  accent: { fontFamily: fonts.serifItalic, color: colors.amber, fontSize: 40 },
  doc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  docIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand700, alignItems: 'center', justifyContent: 'center' },
  dotOn: { width: 28, height: 18, borderRadius: 9, backgroundColor: colors.amber },
});

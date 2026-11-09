import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Bell, Bone, CalendarClock, Camera, Droplet, Flame, Heart, MapPin, PawPrint, Scale, Scissors, Search, ShoppingCart, Stethoscope, Syringe, Video,
  type DoodleIcon,
} from '@/components/doodles';
import * as api from '@/api';
import { PetAvatar, ProductCard, VetCard } from '@/components/blocks';
import { CampaignCarousel } from '@/components/CampaignCarousel';
import { ScoreRing } from '@/components/charts';
import { Icon } from '@/components/Icon';
import { Card, IconButton, IconTile, Pill, Row, SectionHeader, Skeleton, T } from '@/components/ui';
import { campaigns } from '@/data/campaigns';
import { services } from '@/data/services';
import { daysFrom, inr, petSubtitle, shortDate } from '@/lib/format';
import { openService } from '@/lib/nav';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, fonts, radius, tones, type Tone } from '@/theme';

const logo = require('@/assets/brand/petfit-logo.png');
const mascots = require('@/assets/brand/luna-pip-sitting.webp');

const GUTTER = 16;

/** Free health tools, offered from the pet profile card. */
const tools = [
  { slug: 'calories', title: 'Calories', icon: Flame, tone: 'amber' as Tone },
  { slug: 'weight', title: 'Ideal weight', icon: Scale, tone: 'teal' as Tone },
  { slug: 'vaccines', title: 'Vaccines', icon: Syringe, tone: 'purple' as Tone },
];

const quickActions: { label: string; icon: DoodleIcon; bg: string; href: Href }[] = [
  { label: 'Book a Grooming Session', icon: Scissors, bg: '#e5f6ea', href: { pathname: '/service/[slug]', params: { slug: 'grooming' } } },
  { label: 'Find a Vet Near You', icon: Stethoscope, bg: '#e6effd', href: { pathname: '/service/[slug]', params: { slug: 'vets' } } },
  { label: 'Order Pet Food', icon: Bone, bg: '#fff0dc', href: { pathname: '/shop', params: { cat: 'food' } } },
  { label: 'Explore Nearby Services', icon: MapPin, bg: '#fde7ec', href: '/services' },
];

type Upcoming = {
  key: string;
  date: string;
  title: string;
  sub: string;
  icon: DoodleIcon;
  tone: Tone;
  cta: string;
  primary: boolean;
  href: Href;
};

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, dispatch, activePet, cartCount } = useStore();
  const petId = activePet?.id ?? '';

  const vaccines = useApi(() => (petId ? api.getVaccinations(petId) : Promise.resolve([])), [petId]);
  const vets = useApi(() => api.getVets(), []);
  const products = useApi(() => api.getProducts(), []);
  const notes = useApi(() => api.getNotifications(), []);

  const unread = (notes.data ?? []).filter((n) => !n.read).length;
  const firstName = state.user?.name.split(' ')[0] ?? 'there';
  const petName = activePet?.name ?? 'your pet';
  const wished = (products.data ?? []).filter((p) => state.wishlist.includes(p.id));
  const openWishlist = () => router.push({ pathname: '/shop', params: { cat: 'wishlist' } });

  // Vaccines due for the active pet, plus every upcoming booking, soonest first.
  const upcoming: Upcoming[] = [
    ...(vaccines.data ?? [])
      .filter((v) => !v.givenOn)
      .map((v): Upcoming => {
        const overdue = daysFrom(v.dueOn) < 0;
        return {
          key: v.id,
          date: v.dueOn,
          title: `${v.name} ${overdue ? 'overdue' : 'due'}`,
          sub: shortDate(v.dueOn),
          icon: Syringe,
          tone: overdue ? 'blush' : 'purple',
          cta: 'Book Now',
          primary: true,
          href: { pathname: '/service/[slug]', params: { slug: 'vaccination' } },
        };
      }),
    ...state.bookings
      .filter((b) => b.status === 'upcoming')
      .map((b): Upcoming => ({
        key: b.id,
        date: b.date,
        title: b.title,
        sub: `${shortDate(b.date)}, ${b.slot}${state.pets.length > 1 ? ` · ${state.pets.find((p) => p.id === b.petId)?.name ?? ''}` : ''}`,
        icon: b.mode === 'tele' ? Video : CalendarClock,
        tone: b.mode === 'tele' ? 'teal' : 'amber',
        cta: b.mode === 'tele' ? 'Join video call' : 'View booking',
        primary: b.mode === 'tele',
        href: '/bookings',
      })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: GUTTER }}>
          {/* Header */}
          <Row style={{ justifyContent: 'space-between' }} gap={8}>
            <View style={{ width: 92 }}>
              <Image source={logo} style={styles.logo} contentFit="contain" contentPosition="left" accessibilityLabel="PetFit" />
              <T numberOfLines={2} style={styles.tagline}>Happy Pets. Happier Parents.</T>
            </View>
            <Row gap={5} style={{ flexShrink: 1 }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Change city" onPress={() => router.push('/addresses')} style={styles.cityPill}>
                <MapPin size={14} />
                <T v="smallStrong" numberOfLines={1} style={{ flexShrink: 1 }}>{state.user?.city ?? 'Set location'}</T>
                <ChevronDown size={13} color={colors.ink} />
              </Pressable>
              <IconButton label="Wishlist" badge={state.wishlist.length} onPress={openWishlist} style={styles.headerBtn}>
                <Heart size={18} />
              </IconButton>
              <IconButton label="Notifications" badge={unread} onPress={() => router.push('/notifications')} style={styles.headerBtn}>
                <Bell size={18} />
              </IconButton>
              <IconButton label="Cart" badge={cartCount} onPress={() => router.push('/cart')} style={styles.headerBtn}>
                <ShoppingCart size={18} />
              </IconButton>
            </Row>
          </Row>

          {/* Search */}
          <Pressable accessibilityRole="search" onPress={() => router.push('/search')} style={styles.search}>
            <Search size={20} />
            <T v="body" color={colors.muted} numberOfLines={1} style={{ flex: 1 }}>Search vets, grooming, food, products and more…</T>
          </Pressable>

          {/* Pet profile, with health score and the free health tools on it */}
          <View style={styles.petCard}>
            <View style={styles.mascotWrap} pointerEvents="none">
              <Row style={{ justifyContent: 'space-between', paddingHorizontal: 2 }}>
                <T style={styles.note}>Luna says hi!</T>
                <T style={[styles.note, { textAlign: 'right' }]}>Pip is{'\n'}here too!</T>
              </Row>
              <Image source={mascots} style={styles.mascots} contentFit="contain" accessibilityLabel="Luna the cat and Pip the golden retriever" />
            </View>

            <Row gap={12} align="flex-start" style={{ paddingRight: 104 }}>
              {activePet ? (
                <View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${activePet.name}'s profile`} onPress={() => router.push('/pets')} style={styles.petPhoto}>
                    <PetAvatar pet={activePet} size={76} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${activePet.name}'s photo and details`}
                    hitSlop={6}
                    onPress={() => router.push({ pathname: '/pet-form', params: { id: activePet.id } })}
                    style={styles.cameraBadge}>
                    <Camera size={15} />
                  </Pressable>
                </View>
              ) : null}
              <View style={{ flex: 1, minWidth: 0 }}>
                <T v="smallStrong" color={colors.inkSoft}>Hi {firstName}!</T>
                <T v="h2" color={colors.brand600} style={styles.petQuestion}>
                  {activePet ? `How is ${activePet.name} doing today?` : 'Add your first pet'}
                </T>
                <T v="caption" numberOfLines={2} style={{ marginTop: 4 }}>
                  {activePet ? petSubtitle(activePet) : 'Get reminders, records and the right products.'}
                </T>
              </View>
            </Row>

            <Row gap={8} style={{ marginTop: 12, flexWrap: 'wrap' }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(activePet ? '/pets' : '/pet-form')}
                style={({ pressed }) => [styles.profileBtn, pressed && { opacity: 0.8 }]}>
                <T style={styles.profileBtnText}>{activePet ? 'View Pet Profile' : 'Add a pet'}</T>
                <ArrowRight size={14} color={colors.brand600} strokeWidth={2.6} />
              </Pressable>
              {activePet
                ? state.pets.filter((p) => p.id !== activePet.id).map((p) => (
                  <Pressable key={p.id} hitSlop={6} onPress={() => dispatch({ type: 'activePet', id: p.id })}>
                    <Pill tone="sand" label={`Switch to ${p.name}`} />
                  </Pressable>
                ))
                : null}
            </Row>

            <View style={styles.toolPanel}>
              <Row style={{ justifyContent: 'space-between' }}>
                <T v="eyebrow" color={colors.muted}>Health & free tools</T>
                <Pill label="Free" tone="success" />
              </Row>
              <Row gap={6} style={{ marginTop: 8 }} align="stretch">
                {activePet ? (
                  <Pressable accessibilityRole="button" onPress={() => router.push('/pets')} style={({ pressed }) => [styles.tool, { backgroundColor: colors.brand50 }, pressed && { opacity: 0.8 }]}>
                    <ScoreRing score={activePet.healthScore} size={30} stroke={4} />
                    <T v="smallStrong" numberOfLines={1} style={styles.toolLabel}>Health</T>
                  </Pressable>
                ) : null}
                {tools.map((t) => (
                  <Pressable
                    key={t.slug}
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/tools/[tool]', params: { tool: t.slug } })}
                    style={({ pressed }) => [styles.tool, { backgroundColor: tones[t.tone].bg }, pressed && { opacity: 0.8 }]}>
                    <t.icon size={26} />
                    <T v="smallStrong" numberOfLines={2} style={styles.toolLabel}>{t.title}</T>
                  </Pressable>
                ))}
              </Row>
            </View>
          </View>

          {/* Quick actions */}
          <Row gap={8} align="stretch" style={{ marginTop: 14 }}>
            {quickActions.map((a) => (
              <Pressable
                key={a.label}
                accessibilityRole="button"
                onPress={() => router.push(a.href)}
                style={({ pressed }) => [styles.quick, { backgroundColor: a.bg }, pressed && { transform: [{ scale: 0.97 }] }]}>
                <Row style={{ justifyContent: 'space-between' }} align="flex-start">
                  <a.icon size={30} />
                  <View style={styles.quickChevron}>
                    <ChevronRight size={13} color={colors.brand600} strokeWidth={2.6} />
                  </View>
                </Row>
                <T v="smallStrong" style={styles.quickLabel}>{a.label}</T>
              </Pressable>
            ))}
          </Row>

          {/* Upcoming: vaccines due and bookings */}
          <View style={styles.upcoming}>
            <Row style={{ justifyContent: 'space-between', paddingHorizontal: 14 }}>
              <Row gap={6} style={{ flexShrink: 1 }}>
                <PawPrint size={20} />
                <T v="h3" numberOfLines={1} style={{ flexShrink: 1 }}>Upcoming for {petName}</T>
              </Row>
              <ViewAll onPress={() => router.push('/bookings')} />
            </Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8, marginTop: 10 }}>
              {vaccines.loading ? (
                [0, 1].map((i) => <Skeleton key={i} h={104} style={{ width: 168 }} />)
              ) : upcoming.length ? (
                upcoming.map((u) => (
                  <View key={u.key} style={styles.dueCard}>
                    <Row gap={8} align="flex-start">
                      <View style={[styles.dueIcon, { backgroundColor: tones[u.tone].bg }]}>
                        <u.icon size={20} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <T v="smallStrong" numberOfLines={2}>{u.title}</T>
                        <T v="caption" numberOfLines={1}>{u.sub}</T>
                      </View>
                    </Row>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push(u.href)}
                      style={({ pressed }) => [styles.dueBtn, u.primary ? styles.dueBtnPrimary : styles.dueBtnOutline, pressed && { opacity: 0.8 }]}>
                      <T style={[styles.dueBtnText, { color: u.primary ? colors.white : colors.brand600 }]}>{u.cta}</T>
                    </Pressable>
                  </View>
                ))
              ) : (
                <View style={[styles.dueCard, { width: 260, justifyContent: 'center' }]}>
                  <T v="smallStrong">All caught up</T>
                  <T v="caption">Nothing due for {petName} right now.</T>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Every service (icons as before) */}
          <Row style={{ justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
            <T v="h2">Our Services</T>
            <ViewAll onPress={() => router.push('/services')} />
          </Row>
          <View style={styles.serviceGrid}>
            {services.map((s) => (
              <Pressable
                key={s.slug}
                accessibilityRole="button"
                accessibilityLabel={s.listing.kind === 'waitlist' ? `${s.name}, coming soon` : s.name}
                onPress={() => openService(router, s)}
                style={({ pressed }) => [styles.serviceTile, pressed && { opacity: 0.6 }]}>
                <View>
                  <IconTile tone={s.tone} size={44}>
                    <Icon name={s.icon} size={26} />
                  </IconTile>
                  {s.listing.kind === 'waitlist' ? (
                    <View style={styles.soon}>
                      <T style={styles.soonText}>Soon</T>
                    </View>
                  ) : null}
                </View>
                <T numberOfLines={1} style={[styles.serviceLabel, s.shortName.length > 10 && styles.serviceLabelLong]}>{s.shortName}</T>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Campaigns & offers */}
        <View style={{ marginTop: 18 }}>
          <CampaignCarousel items={campaigns} />
        </View>

        {/* Vets */}
        <View style={{ paddingHorizontal: GUTTER }}>
          <SectionHeader title="Top-rated vets near you" action="See all" onAction={() => router.push({ pathname: '/service/[slug]', params: { slug: 'vets' } })} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12 }}>
          {vets.loading
            ? [0, 1].map((i) => <Skeleton key={i} h={180} style={{ width: 300 }} />)
            : (vets.data ?? []).slice(0, 4).map((v) => (
              <View key={v.id} style={{ width: 310 }}>
                <VetCard vet={v} />
              </View>
            ))}
        </ScrollView>

        {/* Wishlist */}
        <View style={{ paddingHorizontal: GUTTER }}>
          <SectionHeader title="Your wishlist" action={wished.length ? 'See all' : undefined} onAction={openWishlist} />
          {!products.loading && wished.length === 0 ? (
            <Card onPress={() => router.push('/shop')}>
              <Row gap={12}>
                <IconTile tone="blush" size={44}><Heart size={26} /></IconTile>
                <View style={{ flex: 1 }}>
                  <T v="title">Save what {petName} will love</T>
                  <T v="small">Tap the heart on any product to keep it here.</T>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </Row>
            </Card>
          ) : null}
        </View>
        {products.loading || wished.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12 }}>
            {products.loading
              ? [0, 1].map((i) => <Skeleton key={i} h={230} style={{ width: 160 }} />)
              : wished.map((p) => <ProductCard key={p.id} product={p} width={164} />)}
          </ScrollView>
        ) : null}

        <View style={{ paddingHorizontal: GUTTER }}>
          <SectionHeader title={`Picked for ${petName}`} action="Shop" onAction={() => router.push('/shop')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12 }}>
          {products.loading
            ? [0, 1, 2].map((i) => <Skeleton key={i} h={230} style={{ width: 160 }} />)
            : (products.data ?? [])
              .filter((p) => !activePet || p.petSpecies === activePet.species || p.petSpecies === 'all')
              .slice(0, 6)
              .map((p) => <ProductCard key={p.id} product={p} width={164} />)}
        </ScrollView>

        <View style={{ paddingHorizontal: GUTTER, marginTop: 28, alignItems: 'center' }}>
          <Row gap={6}>
            <Droplet size={14} color={colors.brand300} />
            <T v="caption">Orders over {inr(999)} ship free</T>
          </Row>
          <T style={styles.sign}>Made for pets in India · Luna & Pip</T>
        </View>
      </ScrollView>
    </View>
  );
}

function ViewAll({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="View all" hitSlop={8} onPress={onPress}>
      <Row gap={4}>
        <T v="smallStrong" color={colors.brand600}>View All</T>
        <ArrowRight size={14} color={colors.brand600} strokeWidth={2.4} />
      </Row>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logo: { width: 92, height: 31 },
  tagline: { fontFamily: fonts.bodyMedium, fontSize: 9.5, lineHeight: 12, color: colors.muted, marginTop: 1 },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18 },
  search: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  petCard: {
    marginTop: 14,
    backgroundColor: '#efe8fb',
    borderRadius: radius.xl,
    padding: 14,
    overflow: 'hidden',
  },
  mascotWrap: { position: 'absolute', top: 8, right: 4, width: 118 },
  note: { fontFamily: fonts.serifItalic, fontSize: 13, lineHeight: 14, color: colors.brand600 },
  mascots: { width: 118, height: 92, marginTop: 2 },
  petPhoto: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand600,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petQuestion: { fontSize: 19, lineHeight: 22, marginTop: 2 },
  profileBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brand100,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  profileBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.brand600 },
  toolPanel: { marginTop: 14, backgroundColor: colors.white, borderRadius: radius.lg, padding: 10 },
  tool: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, borderRadius: radius.md, paddingHorizontal: 4, paddingVertical: 8 },
  toolLabel: { fontSize: 11.5, lineHeight: 14, textAlign: 'center' },
  quick: { flex: 1, minWidth: 0, minHeight: 112, borderRadius: radius.lg, padding: 10, justifyContent: 'space-between' },
  quickChevron: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { marginTop: 8, fontSize: 12.5, lineHeight: 16 },
  upcoming: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
  },
  dueCard: {
    width: 168,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    justifyContent: 'space-between',
    gap: 10,
  },
  dueIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dueBtn: { borderRadius: radius.pill, paddingVertical: 6, alignItems: 'center', borderWidth: 1.5 },
  dueBtnPrimary: { backgroundColor: colors.brand600, borderColor: colors.brand600 },
  dueBtnOutline: { backgroundColor: colors.white, borderColor: colors.brand600 },
  dueBtnText: { fontFamily: fonts.bodyBold, fontSize: 12.5 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceTile: {
    width: '18%',
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  serviceLabel: { marginTop: 6, textAlign: 'center', fontFamily: fonts.bodySemi, fontSize: 11, lineHeight: 13, color: colors.ink },
  serviceLabelLong: { fontSize: 9.5, letterSpacing: -0.2 },
  soon: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  soonText: { fontFamily: fonts.bodyBold, fontSize: 9, lineHeight: 12, color: colors.white },
  sign: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.brand400, marginTop: 6 },
});

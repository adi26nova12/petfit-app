import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bell, CalendarClock, Droplet, Flame, Heart, MapPin, Scale, Search, ShoppingCart, Syringe, Video } from '@/components/doodles';
import * as api from '@/api';
import { PetAvatar, ProductCard, VetCard } from '@/components/blocks';
import { CampaignCarousel } from '@/components/CampaignCarousel';
import { ScoreRing } from '@/components/charts';
import { Icon } from '@/components/Icon';
import { Button, Card, IconButton, IconTile, Notice, Pill, Row, SectionHeader, Skeleton, T } from '@/components/ui';
import { campaigns } from '@/data/campaigns';
import { services } from '@/data/services';
import { greeting, inr, petSubtitle, relativeDue, shortDate, daysFrom } from '@/lib/format';
import { openService } from '@/lib/nav';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, fonts, radius, space, tones, type Tone } from '@/theme';

/** Free health tools, offered from the pet profile card. */
const tools = [
  { slug: 'calories', title: 'Calories', icon: Flame, tone: 'amber' as Tone },
  { slug: 'weight', title: 'Ideal weight', icon: Scale, tone: 'teal' as Tone },
  { slug: 'vaccines', title: 'Vaccines', icon: Syringe, tone: 'purple' as Tone },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, dispatch, activePet, cartCount } = useStore();
  const petId = activePet?.id ?? '';

  const vaccines = useApi(() => (petId ? api.getVaccinations(petId) : Promise.resolve([])), [petId]);
  const vets = useApi(() => api.getVets(), []);
  const products = useApi(() => api.getProducts(), []);
  const notes = useApi(() => api.getNotifications(), []);

  const nextDue = (vaccines.data ?? []).filter((v) => !v.givenOn).sort((a, b) => a.dueOn.localeCompare(b.dueOn))[0];
  const upcoming = state.bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.date.localeCompare(b.date))[0];
  const unread = (notes.data ?? []).filter((n) => !n.read).length;
  const firstName = state.user?.name.split(' ')[0] ?? 'there';
  const wished = (products.data ?? []).filter((p) => state.wishlist.includes(p.id));
  const openWishlist = () => router.push({ pathname: '/shop', params: { cat: 'wishlist' } });

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <View style={styles.heroGlow} />
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Change city" onPress={() => router.push('/addresses')} style={{ flexShrink: 1 }}>
              <Row gap={4}>
                <MapPin size={15} color={colors.amber} />
                <T v="smallStrong" color={colors.white} numberOfLines={1} style={{ flexShrink: 1 }}>{state.user?.city ?? 'Set location'}</T>
                <ChevronDown size={15} color={colors.brand200} />
              </Row>
            </Pressable>
            <Row gap={10}>
              <IconButton label="Wishlist" badge={state.wishlist.length} onPress={openWishlist}>
                <Heart size={19} />
              </IconButton>
              <IconButton label="Notifications" badge={unread} onPress={() => router.push('/notifications')}>
                <Bell size={19} color={colors.white} />
              </IconButton>
              <IconButton label="Cart" badge={cartCount} onPress={() => router.push('/cart')}>
                <ShoppingCart size={19} color={colors.white} />
              </IconButton>
            </Row>
          </Row>

          <T v="small" color={colors.brand200} style={{ marginTop: 18 }}>{greeting()}, {firstName}</T>
          <T v="hero" color={colors.white} style={{ marginTop: 2 }}>
            What does <T style={styles.serif}>{activePet?.name ?? 'your pet'}</T> need?
          </T>

          <Pressable accessibilityRole="search" onPress={() => router.push('/search')} style={styles.search}>
            <Search size={18} color={colors.muted} />
            <T v="body" color={colors.muted}>Search vets, grooming, food…</T>
          </Pressable>
        </View>

        {/* 1. Pet profile, with the free health tools on it */}
        <View style={{ paddingHorizontal: space.gutter }}>
          <Card style={styles.petCard}>
            {activePet ? (
              <>
                <Pressable accessibilityRole="button" accessibilityLabel={`${activePet.name}'s profile`} onPress={() => router.push('/pets')}>
                  <Row gap={14}>
                    <PetAvatar pet={activePet} size={60} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <T v="h3">{activePet.name}</T>
                      <T v="small" numberOfLines={1}>{petSubtitle(activePet)}</T>
                      <Row gap={2} style={{ marginTop: 4 }}>
                        <T v="caption" color={colors.brand600}>View profile</T>
                        <ChevronRight size={13} color={colors.brand600} />
                      </Row>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <ScoreRing score={activePet.healthScore} size={58} />
                      <T v="caption" style={{ marginTop: 2 }}>Health</T>
                    </View>
                  </Row>
                </Pressable>
                {state.pets.length > 1 ? (
                  <Row gap={6} style={{ marginTop: 10, flexWrap: 'wrap' }}>
                    {state.pets.filter((p) => p.id !== activePet.id).map((p) => (
                      <Pressable key={p.id} hitSlop={6} onPress={() => dispatch({ type: 'activePet', id: p.id })}>
                        <Pill tone="sand" label={`Switch to ${p.name}`} />
                      </Pressable>
                    ))}
                  </Row>
                ) : null}
              </>
            ) : (
              <>
                <T v="h3">Add your first pet</T>
                <T v="small" style={{ marginTop: 4 }}>Get reminders, records and the right products.</T>
                <Button label="Add a pet" style={{ marginTop: 12 }} onPress={() => router.push('/pet-form')} />
              </>
            )}

            <View style={styles.toolsDivider} />
            <Row style={{ justifyContent: 'space-between' }}>
              <T v="eyebrow" color={colors.muted}>Free health tools</T>
              <Pill label="Free" tone="success" />
            </Row>
            <Row gap={8} style={{ marginTop: 10 }} align="stretch">
              {tools.map((t) => (
                <Pressable
                  key={t.slug}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/tools/[tool]', params: { tool: t.slug } })}
                  style={({ pressed }) => [styles.tool, { backgroundColor: tones[t.tone].bg }, pressed && { opacity: 0.8 }]}>
                  <t.icon size={24} />
                  <T v="smallStrong" numberOfLines={1} style={{ fontSize: 12.5 }}>{t.title}</T>
                </Pressable>
              ))}
            </Row>
          </Card>

          {/* Reminder */}
          {vaccines.loading ? (
            <Skeleton h={64} style={{ marginTop: 14 }} />
          ) : nextDue ? (
            <Notice
              style={{ marginTop: 14 }}
              tone={daysFrom(nextDue.dueOn) < 0 ? 'blush' : 'amber'}
              icon={<Syringe size={20} color={daysFrom(nextDue.dueOn) < 0 ? colors.blushInk : colors.amberInk} />}
              title={`${nextDue.name} ${relativeDue(nextDue.dueOn)}`}
              body="Book a home visit or clinic slot in two taps"
              onPress={() => router.push({ pathname: '/service/[slug]', params: { slug: 'vaccination' } })}
            />
          ) : null}
        </View>

        {/* 2. Campaigns & offers */}
        <View style={{ marginTop: 20 }}>
          <CampaignCarousel items={campaigns} />
        </View>

        {/* 3. Every service */}
        <View style={{ paddingHorizontal: space.gutter }}>
          <SectionHeader title="All services" action="Browse" onAction={() => router.push('/services')} />
          <View style={styles.serviceGrid}>
            {services.map((s) => (
              <Pressable
                key={s.slug}
                accessibilityRole="button"
                accessibilityLabel={s.listing.kind === 'waitlist' ? `${s.name}, coming soon` : s.name}
                onPress={() => openService(router, s)}
                style={({ pressed }) => [styles.serviceTile, pressed && { opacity: 0.6 }]}>
                <View>
                  <IconTile tone={s.tone} size={48}>
                    <Icon name={s.icon} size={28} />
                  </IconTile>
                  {s.listing.kind === 'waitlist' ? (
                    <View style={styles.soon}>
                      <T style={styles.soonText}>Soon</T>
                    </View>
                  ) : null}
                </View>
                <T v="caption" color={colors.ink} numberOfLines={1} style={styles.serviceLabel}>{s.shortName}</T>
              </Pressable>
            ))}
          </View>

          {/* Upcoming booking */}
          {upcoming ? (
            <>
              <SectionHeader title="Coming up" action="Bookings" onAction={() => router.push('/bookings')} />
              <Card onPress={() => router.push('/bookings')}>
                <Row gap={12}>
                  <IconTile tone="teal">
                    {upcoming.mode === 'tele' ? <Video size={29} color={colors.teal} /> : <CalendarClock size={29} color={colors.teal} />}
                  </IconTile>
                  <View style={{ flex: 1 }}>
                    <T v="title">{upcoming.title} · {upcoming.providerName}</T>
                    <T v="small">{shortDate(upcoming.date)}, {upcoming.slot} · for {state.pets.find((p) => p.id === upcoming.petId)?.name}</T>
                  </View>
                  <ChevronRight size={18} color={colors.muted} />
                </Row>
                {upcoming.mode === 'tele' ? (
                  <Button label="Join video call" variant="primary" size="sm" style={{ marginTop: 12 }} icon={<Video size={15} color={colors.white} />} onPress={() => router.push('/bookings')} />
                ) : null}
              </Card>
            </>
          ) : null}

          {/* Vets */}
          <SectionHeader title="Top-rated vets near you" action="See all" onAction={() => router.push({ pathname: '/service/[slug]', params: { slug: 'vets' } })} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: 12 }}>
          {vets.loading
            ? [0, 1].map((i) => <Skeleton key={i} h={180} style={{ width: 300 }} />)
            : (vets.data ?? []).slice(0, 4).map((v) => (
              <View key={v.id} style={{ width: 310 }}>
                <VetCard vet={v} />
              </View>
            ))}
        </ScrollView>

        {/* Wishlist */}
        <View style={{ paddingHorizontal: space.gutter }}>
          <SectionHeader title="Your wishlist" action={wished.length ? 'See all' : undefined} onAction={openWishlist} />
          {!products.loading && wished.length === 0 ? (
            <Card onPress={() => router.push('/shop')}>
              <Row gap={12}>
                <IconTile tone="blush" size={44}><Heart size={26} /></IconTile>
                <View style={{ flex: 1 }}>
                  <T v="title">Save what {activePet?.name ?? 'your pet'} will love</T>
                  <T v="small">Tap the heart on any product to keep it here.</T>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </Row>
            </Card>
          ) : null}
        </View>
        {products.loading || wished.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: 12 }}>
            {products.loading
              ? [0, 1].map((i) => <Skeleton key={i} h={230} style={{ width: 160 }} />)
              : wished.map((p) => <ProductCard key={p.id} product={p} width={164} />)}
          </ScrollView>
        ) : null}

        <View style={{ paddingHorizontal: space.gutter }}>
          <SectionHeader title={`Picked for ${activePet?.name ?? 'your pet'}`} action="Shop" onAction={() => router.push('/shop')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: 12 }}>
          {products.loading
            ? [0, 1, 2].map((i) => <Skeleton key={i} h={230} style={{ width: 160 }} />)
            : (products.data ?? [])
              .filter((p) => !activePet || p.petSpecies === activePet.species || p.petSpecies === 'all')
              .slice(0, 6)
              .map((p) => <ProductCard key={p.id} product={p} width={164} />)}
        </ScrollView>

        <View style={{ paddingHorizontal: space.gutter, marginTop: 28, alignItems: 'center' }}>
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

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.brand900,
    paddingHorizontal: space.gutter,
    paddingBottom: 64,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroGlow: { position: 'absolute', top: -80, right: -120, width: 320, height: 320, borderRadius: 160, backgroundColor: colors.brand700, opacity: 0.6 },
  serif: { fontFamily: fonts.serifItalic, color: colors.amber, fontSize: 38 },
  search: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  petCard: { marginTop: -44 },
  toolsDivider: { height: 1, backgroundColor: colors.line, marginVertical: 14 },
  tool: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.md,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  serviceTile: { width: '25%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2 },
  serviceLabel: { marginTop: 6, textAlign: 'center', fontFamily: fonts.bodySemi },
  soon: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  soonText: { fontFamily: fonts.bodyBold, fontSize: 9, lineHeight: 12, color: colors.white },
  sign: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.brand400, marginTop: 6 },
});

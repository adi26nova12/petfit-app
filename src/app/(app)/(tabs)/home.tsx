import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bell, CalendarClock, Droplet, Flame, MapPin, Scale, Search, ShoppingCart, Syringe, Video } from '@/components/doodles';
import * as api from '@/api';
import { PetAvatar, ProductCard, VetCard } from '@/components/blocks';
import { ScoreRing } from '@/components/charts';
import { PeekMascots } from '@/components/mascots';
import { OfferArt } from '@/components/OfferArt';
import { Button, Card, IconButton, IconTile, Notice, Pill, Row, SectionHeader, Skeleton, T } from '@/components/ui';
import { homeOffer } from '@/data/services';
import { greeting, inr, petSubtitle, relativeDue, shortDate, daysFrom } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, fonts, radius, space, type Tone } from '@/theme';


const tools = [
  { slug: 'calories', title: 'Daily calories', body: 'Food & water per day', icon: Flame, tone: 'amber' as Tone },
  { slug: 'weight', title: 'Ideal weight', body: 'Check by breed', icon: Scale, tone: 'teal' as Tone },
  { slug: 'vaccines', title: 'Vaccine schedule', body: "What's due, when", icon: Syringe, tone: 'purple' as Tone },
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <View style={styles.heroGlow} />
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Change city" onPress={() => router.push('/addresses')}>
              <Row gap={4}>
                <MapPin size={15} color={colors.amber} />
                <T v="smallStrong" color={colors.white}>{state.user?.city ?? 'Set location'}</T>
                <ChevronDown size={15} color={colors.brand200} />
              </Row>
            </Pressable>
            <Row gap={10}>
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

        <View style={{ paddingHorizontal: space.gutter }}>
          {/* Pet card */}
          {activePet ? (
            <Card style={styles.petCard} onPress={() => router.push('/pets')}>
              <Row gap={14}>
                <PetAvatar pet={activePet} size={60} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T v="h3">{activePet.name}</T>
                  <T v="small" numberOfLines={1}>{petSubtitle(activePet)}</T>
                  {state.pets.length > 1 ? (
                    <Row gap={6} style={{ marginTop: 8 }}>
                      {state.pets.filter((p) => p.id !== activePet.id).map((p) => (
                        <Pressable key={p.id} hitSlop={6} onPress={() => dispatch({ type: 'activePet', id: p.id })}>
                          <Pill tone="sand" label={`Switch to ${p.name}`} />
                        </Pressable>
                      ))}
                    </Row>
                  ) : null}
                </View>
                <View style={{ alignItems: 'center' }}>
                  <ScoreRing score={activePet.healthScore} size={58} />
                  <T v="caption" style={{ marginTop: 2 }}>Health</T>
                </View>
              </Row>
            </Card>
          ) : (
            <Card style={styles.petCard}>
              <T v="h3">Add your first pet</T>
              <T v="small" style={{ marginTop: 4 }}>Get reminders, records and the right products.</T>
              <Button label="Add a pet" style={{ marginTop: 12 }} onPress={() => router.push('/pet-form')} />
            </Card>
          )}

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

          {/* Offer grid */}
          <SectionHeader title="All in one app" action="All services" onAction={() => router.push('/services')} />
          <View style={styles.grid}>
            {homeOffer.map((o) => (
              <Pressable
                key={o.name}
                accessibilityRole="button"
                onPress={() => router.push(o.slug === 'food' || o.slug === 'products' ? { pathname: '/shop', params: { cat: o.slug === 'food' ? 'food' : '' } } : { pathname: '/service/[slug]', params: { slug: o.slug } })}
                style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.97 }] }]}>
                <OfferArt name={o.name} size={60} />
                <T v="title" style={{ marginTop: 8 }}>{o.name}</T>
                <T v="caption" numberOfLines={2}>{o.items}</T>
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

          {/* Zero fee banner */}
          <View style={styles.banner}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <T v="eyebrow" color={colors.amberInk}>Pet parents pay</T>
              <T v="h1" style={{ marginTop: 2 }}>₹0 booking fee</T>
              <T v="small" color={colors.inkSoft} style={{ marginTop: 4 }}>You pay the price on the card. Always.</T>
            </View>
            <PeekMascots width={132} style={{ marginRight: -6, marginBottom: -16 }} />
          </View>

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

        <View style={{ paddingHorizontal: space.gutter }}>
          <SectionHeader title="Free health tools" />
          <Row gap={10} align="stretch">
            {tools.map((t) => (
              <Card key={t.slug} style={{ flex: 1, padding: 12 }} onPress={() => router.push({ pathname: '/tools/[tool]', params: { tool: t.slug } })}>
                <IconTile tone={t.tone} size={36}><t.icon size={26} color={colors.ink} /></IconTile>
                <T v="smallStrong" style={{ marginTop: 8 }}>{t.title}</T>
                <T v="caption">{t.body}</T>
              </Card>
            ))}
          </Row>

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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  banner: {
    marginTop: 24,
    backgroundColor: colors.amber,
    borderRadius: radius.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  sign: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.brand400, marginTop: 6 },
});

import { useRouter, type Href } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Bell, CalendarClock, CircleHelp, FileText, Heart, LifeBuoy, LogOut, MapPin, Package, PawPrint, Scale, Pencil } from '@/components/doodles';
import { PersonAvatar, PetAvatar } from '@/components/blocks';
import { Card, IconButton, Row, Screen, T } from '@/components/ui';
import { useStore } from '@/store/app';
import { colors, radius } from '@/theme';

type Item = { label: string; icon: typeof Bell; href?: Href; onPress?: () => void; meta?: string };

export default function Account() {
  const router = useRouter();
  const { state, signOut } = useStore();
  const upcoming = state.bookings.filter((b) => b.status === 'upcoming').length;
  const activeOrders = state.orders.filter((o) => o.status !== 'delivered').length;

  const sections: { title: string; items: Item[] }[] = [
    {
      title: 'Activity',
      items: [
        { label: 'My bookings', icon: CalendarClock, href: '/bookings', meta: upcoming ? `${upcoming} upcoming` : undefined },
        { label: 'My orders', icon: Package, href: '/orders', meta: activeOrders ? `${activeOrders} active` : undefined },
        { label: 'Wishlist', icon: Heart, href: { pathname: '/shop', params: { cat: 'wishlist' } }, meta: state.wishlist.length ? String(state.wishlist.length) : undefined },
        { label: 'Rescue requests', icon: LifeBuoy, href: '/rescue' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Saved addresses', icon: MapPin, href: '/addresses', meta: String(state.addresses.length) },
        { label: 'Notifications', icon: Bell, href: '/notifications' },
        { label: 'Health tools', icon: Scale, href: { pathname: '/tools/[tool]', params: { tool: 'calories' } } },
      ],
    },
    {
      title: 'Help',
      items: [
        { label: 'Help & support', icon: CircleHelp, href: '/support' },
        { label: 'Terms & privacy', icon: FileText, href: '/support' },
        {
          label: 'Log out',
          icon: LogOut,
          onPress: () =>
            Alert.alert('Log out?', 'You can log back in with your mobile number.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log out', style: 'destructive', onPress: signOut },
            ]),
        },
      ],
    },
  ];

  return (
    <Screen>
      <T v="h1" style={{ marginTop: 16 }}>Account</T>
      <Card style={{ marginTop: 16 }}>
        <Row gap={14}>
          <PersonAvatar name={state.user?.name ?? 'You'} size={60} />
          <View style={{ flex: 1 }}>
            <T v="h3">{state.user?.name}</T>
            <T v="small">{state.user?.phone}</T>
            {state.user?.email ? <T v="small">{state.user.email}</T> : null}
          </View>
          <IconButton label="Edit profile" onPress={() => router.push('/profile')}>
            <Pencil size={17} color={colors.ink} />
          </IconButton>
        </Row>
      </Card>

      <T v="eyebrow" color={colors.muted} style={styles.h}>My pets</T>
      <Row gap={10} style={{ flexWrap: 'wrap' }}>
        {state.pets.map((p) => (
          <Pressable key={p.id} onPress={() => router.push({ pathname: '/pet-form', params: { id: p.id } })} style={styles.pet}>
            <PetAvatar pet={p} size={40} />
            <View>
              <T v="title">{p.name}</T>
              <T v="caption">{p.breed}</T>
            </View>
          </Pressable>
        ))}
        <Pressable onPress={() => router.push('/pet-form')} style={[styles.pet, { borderStyle: 'dashed' }]}>
          <View style={styles.addPet}><PawPrint size={18} color={colors.brand600} /></View>
          <T v="title" color={colors.brand700}>Add pet</T>
        </Pressable>
      </Row>

      {sections.map((s) => (
        <View key={s.title}>
          <T v="eyebrow" color={colors.muted} style={styles.h}>{s.title}</T>
          <View style={styles.group}>
            {s.items.map((it, i) => (
              <Pressable
                key={it.label}
                onPress={() => (it.onPress ? it.onPress() : it.href && router.push(it.href))}
                style={({ pressed }) => [styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }, pressed && { backgroundColor: colors.brand50 }]}>
                <it.icon size={20} color={it.label === 'Log out' ? colors.danger : colors.brand600} />
                <T v="bodyStrong" color={it.label === 'Log out' ? colors.danger : colors.ink} style={{ flex: 1 }}>{it.label}</T>
                {it.meta ? <T v="small">{it.meta}</T> : null}
                {it.label !== 'Log out' ? <ChevronRight size={18} color={colors.muted} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <T v="caption" center style={{ marginTop: 28 }}>PetFit v1.0.0 · Manayate Ventures Private Limited</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { marginTop: 24, marginBottom: 10 },
  pet: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, paddingRight: 16, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.line },
  addPet: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.brand50, alignItems: 'center', justifyContent: 'center' },
  group: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15 },
});

/** Domain building blocks shared across screens: avatars, listing cards, product cards. */
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  BadgeCheck,
  Bed,
  Bone,
  Cookie,
  Heart,
  House,
  MapPin,
  Pill,
  Shirt,
  Sparkles,
  ToyBrick,
  Video,
  Footprints,
} from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Pet, Product, ProductCategory, Provider, Vet } from '@/api/types';
import { discountPct, initials, inr } from '@/lib/format';
import { useStore } from '@/store/app';
import { colors, radius, tones, type Tone } from '@/theme';
import { Card, Pill as Tag, Rating, Row, T, tap } from './ui';

const demoPhotos: Record<string, number> = {
  'demo:pip': require('@/assets/brand/pip-avatar.png'),
  'demo:luna': require('@/assets/brand/luna-avatar.png'),
};

const avatarTones: Tone[] = ['purple', 'teal', 'amber', 'blush'];
const toneFor = (s: string) => avatarTones[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTones.length];

export function PetAvatar({ pet, size = 56, ring }: { pet: Pick<Pet, 'name' | 'photo'>; size?: number; ring?: boolean }) {
  const src = pet.photo ? demoPhotos[pet.photo] ?? { uri: pet.photo } : null;
  const t = tones[toneFor(pet.name)];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        overflow: 'hidden',
        backgroundColor: src ? colors.amberSoft : t.bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 3 : 0,
        borderColor: colors.amber,
      }}>
      {src ? (
        <Image source={src} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityLabel={pet.name} />
      ) : (
        <T v="h2" color={t.fg} style={{ fontSize: size * 0.42, lineHeight: size * 0.5 }}>{pet.name[0]?.toUpperCase()}</T>
      )}
    </View>
  );
}

export function PersonAvatar({ name, size = 56, url }: { name: string; size?: number; url?: string | null }) {
  const t = tones[toneFor(name)];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {url ? (
        <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <T v="h3" color={t.fg} style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}>{initials(name)}</T>
      )}
    </View>
  );
}

export function Verified({ light }: { light?: boolean }) {
  return (
    <Row gap={3}>
      <BadgeCheck size={14} color={light ? colors.amber : colors.teal} />
      <T v="caption" color={light ? colors.white : colors.teal} style={{ fontFamily: 'Figtree_700Bold' }}>Verified</T>
    </Row>
  );
}

export function VetCard({ vet }: { vet: Vet }) {
  const router = useRouter();
  return (
    <Card onPress={() => router.push({ pathname: '/vet/[id]', params: { id: vet.id } })}>
      <Row gap={14} align="flex-start">
        <PersonAvatar name={vet.name} size={58} url={vet.avatarUrl} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T v="title" numberOfLines={1} style={{ flex: 1 }}>{vet.name}</T>
            <Rating value={vet.rating} />
          </Row>
          <T v="small" numberOfLines={1}>{vet.specialization} · {vet.experienceYears} yrs</T>
          <Row gap={4} style={{ marginTop: 4 }}>
            <MapPin size={12} color={colors.muted} />
            <T v="caption" numberOfLines={1} style={{ flex: 1 }}>{vet.clinicName}, {vet.area}</T>
          </Row>
          <Row gap={8} style={{ marginTop: 10, flexWrap: 'wrap' }}>
            {vet.recommended ? <Tag label="Recommended" tone="amber" /> : null}
            {vet.verified ? <Verified /> : null}
          </Row>
        </View>
      </Row>
      <View style={styles.priceRow}>
        <View style={styles.priceCell}>
          <House size={15} color={colors.brand600} />
          <T v="caption">Clinic</T>
          <T v="smallStrong">{inr(vet.consultationFee)}</T>
        </View>
        <View style={[styles.priceCell, { borderLeftWidth: 1, borderLeftColor: colors.line }]}>
          <Video size={15} color={colors.teal} />
          <T v="caption">Video</T>
          <T v="smallStrong">{vet.teleconsultationFee != null ? inr(vet.teleconsultationFee) : 'Not offered'}</T>
        </View>
      </View>
    </Card>
  );
}

export function ProviderCard({ provider, tone = 'purple' }: { provider: Provider; tone?: Tone }) {
  const router = useRouter();
  const from = Math.min(...provider.packages.map((p) => p.price));
  return (
    <Card onPress={() => router.push({ pathname: '/provider/[id]', params: { id: provider.id } })}>
      <Row gap={14} align="flex-start">
        <PersonAvatar name={provider.name} size={58} url={provider.avatarUrl} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T v="title" numberOfLines={1} style={{ flex: 1 }}>{provider.name}</T>
            <Rating value={provider.rating} />
          </Row>
          <T v="small" numberOfLines={2}>{provider.description}</T>
          <Row gap={4} style={{ marginTop: 4 }}>
            <MapPin size={12} color={colors.muted} />
            <T v="caption">{provider.area}, {provider.city}</T>
          </Row>
        </View>
      </Row>
      <Row style={{ marginTop: 12, justifyContent: 'space-between' }}>
        <Row gap={6} style={{ flexWrap: 'wrap', flex: 1 }}>
          {provider.modes.includes('home') ? <Tag label="At home" tone="teal" /> : null}
          {provider.modes.includes('centre') ? <Tag label="At centre" tone={tone} /> : null}
          {provider.verified ? <Verified /> : null}
        </Row>
        <T v="caption">from <T v="title">{inr(from)}</T></T>
      </Row>
    </Card>
  );
}

const categoryArt: Record<ProductCategory, { icon: typeof Bone; tone: Tone }> = {
  food: { icon: Bone, tone: 'amber' },
  treats: { icon: Cookie, tone: 'blush' },
  toys: { icon: ToyBrick, tone: 'teal' },
  apparel: { icon: Shirt, tone: 'purple' },
  beds: { icon: Bed, tone: 'sand' },
  walk: { icon: Footprints, tone: 'teal' },
  grooming: { icon: Sparkles, tone: 'blush' },
  health: { icon: Pill, tone: 'purple' },
};

/** Placeholder product art until the API returns `imageUrl`. */
export function ProductArt({ product, height = 130, rounded = radius.md }: { product: Product; height?: number; rounded?: number }) {
  const art = categoryArt[product.category];
  const t = tones[art.tone];
  const Icon = art.icon;
  return (
    <View style={{ height, borderRadius: rounded, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <>
          <View style={{ position: 'absolute', width: height * 0.9, height: height * 0.9, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.45)' }} />
          <Icon size={height * 0.34} color={t.fg} strokeWidth={1.6} />
        </>
      )}
    </View>
  );
}

export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const off = discountPct(product.price, product.mrp);
  const wished = state.wishlist.includes(product.id);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={({ pressed }) => [styles.product, width ? { width } : { flex: 1 }, pressed && { opacity: 0.9 }]}>
      <View>
        <ProductArt product={product} />
        <Pressable
          accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          hitSlop={8}
          onPress={() => {
            tap();
            dispatch({ type: 'wish', productId: product.id });
          }}
          style={styles.heart}>
          <Heart size={16} color={wished ? colors.danger : colors.ink} fill={wished ? colors.danger : 'transparent'} />
        </Pressable>
        {off ? <Tag label={`${off}% off`} tone="ink" style={{ position: 'absolute', left: 8, top: 8 }} /> : null}
      </View>
      <View style={{ padding: 10, gap: 2 }}>
        <T v="caption" numberOfLines={1}>{product.brand}</T>
        <T v="smallStrong" numberOfLines={2} style={{ minHeight: 36 }}>{product.name}</T>
        <Row gap={6} style={{ marginTop: 4 }}>
          <T v="title">{inr(product.price)}</T>
          {product.mrp && product.mrp > product.price ? (
            <T v="caption" style={{ textDecorationLine: 'line-through' }}>{inr(product.mrp)}</T>
          ) : null}
        </Row>
        {!product.inStock ? <T v="caption" color={colors.danger}>Out of stock</T> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  priceRow: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  priceCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12 },
  product: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 6, overflow: 'hidden' },
  heart: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function OrderSummary({ subtotal, savings = 0, delivery, total }: { subtotal: number; savings?: number; delivery: number; total: number }) {
  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}><T v="body">Items</T><T v="bodyStrong">{inr(subtotal)}</T></Row>
      {savings > 0 ? <Row style={{ justifyContent: 'space-between', marginTop: 6 }}><T v="body">You save</T><T v="bodyStrong" color={colors.teal}>−{inr(savings)}</T></Row> : null}
      <Row style={{ justifyContent: 'space-between', marginTop: 6 }}><T v="body">Delivery</T><T v="bodyStrong" color={delivery ? colors.ink : colors.teal}>{delivery ? inr(delivery) : 'Free'}</T></Row>
      <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 12 }} />
      <Row style={{ justifyContent: 'space-between' }}><T v="title">Total</T><T v="h3">{inr(total)}</T></Row>
    </Card>
  );
}

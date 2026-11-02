import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, RotateCcw, ShoppingCart, Truck } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import * as api from '@/api';
import { ProductArt } from '@/components/blocks';
import { Button, Chip, EmptyState, IconButton, Loading, Pill, Rating, Row, Screen, Stepper, T, TopBar } from '@/components/ui';
import { discountPct, inr } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, radius } from '@/theme';

export default function ProductDetail() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, dispatch, cartCount } = useStore();
  const { data: p, loading } = useApi(() => api.getProduct(id), [id]);
  const [variant, setVariant] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) return <Screen><TopBar /><Loading rows={2} h={220} /></Screen>;
  if (!p) return <Screen><TopBar /><EmptyState title="Product not found" /></Screen>;

  const v = variant ?? p.variants[0] ?? null;
  const off = discountPct(p.price, p.mrp);
  const wished = state.wishlist.includes(p.id);

  const add = () => {
    dispatch({ type: 'cartAdd', item: { productId: p.id, variant: v, qty } });
    setAdded(true);
  };

  return (
    <Screen
      footer={
        added ? (
          <Row gap={10}>
            <Button label="Keep shopping" variant="outline" onPress={() => { setAdded(false); router.back(); }} style={{ flex: 1 }} full />
            <Button label="Go to cart" onPress={() => router.push('/cart')} style={{ flex: 1 }} full />
          </Row>
        ) : (
          <Row gap={14}>
            <Stepper value={qty} onChange={setQty} min={1} />
            <Button label={p.inStock ? `Add · ${inr(p.price * qty)}` : 'Out of stock'} size="lg" disabled={!p.inStock} onPress={add} style={{ flex: 1 }} full icon={<ShoppingCart size={18} color={colors.white} />} />
          </Row>
        )
      }>
      <TopBar
        right={
          <Row gap={8}>
            <IconButton label={wished ? 'Remove from wishlist' : 'Add to wishlist'} onPress={() => dispatch({ type: 'wish', productId: p.id })}>
              <Heart size={19} color={wished ? colors.danger : colors.ink} fill={wished ? colors.danger : 'transparent'} />
            </IconButton>
            <IconButton label="Cart" badge={cartCount} onPress={() => router.push('/cart')}>
              <ShoppingCart size={19} color={colors.ink} />
            </IconButton>
          </Row>
        }
      />
      <ProductArt product={p} height={280} rounded={radius.xl} />
      <T v="small" style={{ marginTop: 16 }}>{p.brand} · {p.subcategory}</T>
      <T v="h2" style={{ marginTop: 2 }}>{p.name}</T>
      <Row style={{ marginTop: 8 }} gap={10}>
        <Rating value={p.rating} reviews={p.reviews} />
        <Pill label={p.petSpecies === 'all' ? 'Dogs & cats' : p.petSpecies === 'dog' ? 'For dogs' : 'For cats'} tone="sand" />
      </Row>
      <Row gap={10} style={{ marginTop: 14 }} align="flex-end">
        <T v="h1">{inr(p.price)}</T>
        {off ? <T v="body" style={{ textDecorationLine: 'line-through', marginBottom: 3 }}>{inr(p.mrp)}</T> : null}
        {off ? <Pill label={`${off}% off`} tone="success" style={{ marginBottom: 4 }} /> : null}
      </Row>
      <T v="caption">Inclusive of all taxes</T>

      {p.variants.length ? (
        <>
          <T v="h3" style={{ marginTop: 22, marginBottom: 10 }}>Size</T>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            {p.variants.map((x) => <Chip key={x} label={x} selected={v === x} onPress={() => setVariant(x)} />)}
          </Row>
        </>
      ) : null}

      <T v="h3" style={{ marginTop: 22, marginBottom: 6 }}>About this product</T>
      <T v="body">{p.description}</T>

      <View style={{ marginTop: 20, gap: 10, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.line }}>
        <Row gap={10}><Truck size={18} color={colors.teal} /><T v="small" style={{ flex: 1 }}>Free delivery on orders over ₹999</T></Row>
        <Row gap={10}><RotateCcw size={18} color={colors.teal} /><T v="small" style={{ flex: 1 }}>Easy 7-day returns on unopened items</T></Row>
      </View>
    </Screen>
  );
}

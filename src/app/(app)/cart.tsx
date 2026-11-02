import { useRouter } from 'expo-router';
import { Truck } from 'lucide-react-native';
import { View } from 'react-native';

import * as api from '@/api';
import { OrderSummary, ProductArt } from '@/components/blocks';
import { Button, Card, EmptyState, Loading, Row, Screen, Stepper, T, TopBar } from '@/components/ui';
import { FREE_DELIVERY_OVER, priceCart } from '@/lib/cart';
import { inr } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors } from '@/theme';

export default function Cart() {
  const router = useRouter();
  const { state, dispatch, cartCount } = useStore();
  const { data, loading } = useApi(() => api.getProducts(), []);
  const priced = priceCart(state.cart, data ?? []);

  if (!state.cart.length) {
    return (
      <Screen>
        <TopBar title="Cart" />
        <EmptyState title="Your cart is empty" body="Food, treats and toys — delivered to your door." action={<Button label="Start shopping" onPress={() => router.dismissTo('/shop')} />} />
      </Screen>
    );
  }

  const toFree = FREE_DELIVERY_OVER - priced.subtotal;

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View style={{ flex: 1 }}>
            <T v="caption">Total</T>
            <T v="h2">{inr(priced.total)}</T>
          </View>
          <Button label="Checkout" size="lg" onPress={() => router.push('/checkout')} disabled={loading} />
        </Row>
      }>
      <TopBar title="Cart" subtitle={`${cartCount} ${cartCount === 1 ? 'item' : 'items'}`} />
      {toFree > 0 ? (
        <Row gap={10} style={{ backgroundColor: colors.tealSoft, padding: 12, borderRadius: 14, marginBottom: 14 }}>
          <Truck size={18} color={colors.teal} />
          <T v="small" color={colors.teal} style={{ flex: 1 }}>Add {inr(toFree)} more for free delivery</T>
        </Row>
      ) : null}
      {loading ? <Loading rows={2} h={96} /> : (
        <View style={{ gap: 10 }}>
          {priced.lines.map((l) => (
            <Card key={`${l.productId}-${l.variant}`} padded={false} style={{ padding: 10 }}>
              <Row gap={12}>
                <View style={{ width: 76 }}><ProductArt product={l.product} height={76} /></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="smallStrong" numberOfLines={2}>{l.product.name}</T>
                  {l.variant ? <T v="caption">{l.variant}</T> : null}
                  <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
                    <T v="title">{inr(l.product.price * l.qty)}</T>
                    <Stepper value={l.qty} onChange={(qty) => dispatch({ type: 'cartQty', productId: l.productId, variant: l.variant, qty })} />
                  </Row>
                </View>
              </Row>
            </Card>
          ))}
        </View>
      )}
      <View style={{ marginTop: 18 }}>
        <OrderSummary {...priced} />
      </View>
    </Screen>
  );
}

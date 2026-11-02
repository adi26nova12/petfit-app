import { useRouter } from 'expo-router';
import { Banknote, Check, CreditCard, House, Plus, Smartphone, Store } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as api from '@/api';
import { OrderSummary } from '@/components/blocks';
import { Button, Loading, Row, Screen, T, TopBar, tap } from '@/components/ui';
import { priceCart } from '@/lib/cart';
import { inr } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, radius } from '@/theme';

const payments = [
  { key: 'UPI', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { key: 'Card', label: 'Credit / debit card', sub: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { key: 'COD', label: 'Cash on delivery', sub: 'Pay when it arrives', icon: Banknote },
];

function Radio({ on }: { on: boolean }) {
  return (
    <View style={[styles.radio, on && { backgroundColor: colors.brand600, borderColor: colors.brand600 }]}>
      {on ? <Check size={12} color={colors.white} strokeWidth={3} /> : null}
    </View>
  );
}

export default function Checkout() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const { data, loading } = useApi(() => api.getProducts(), []);
  const priced = priceCart(state.cart, data ?? []);
  const [addressId, setAddressId] = useState(state.addresses[0]?.id ?? '');
  const [payment, setPayment] = useState('UPI');
  const [placing, setPlacing] = useState(false);

  const place = async () => {
    setPlacing(true);
    // Production: create the order, open Razorpay / UPI intent, then confirm with the payment id.
    const order = await api.placeOrder({ items: state.cart, addressId, paymentMethod: payment });
    dispatch({ type: 'order', order });
    dispatch({ type: 'cartClear' });
    router.dismissTo('/home');
    router.push({ pathname: '/order-success', params: { id: order.id } });
  };

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View style={{ flex: 1 }}>
            <T v="caption">{payment === 'COD' ? 'Pay on delivery' : `Pay with ${payment}`}</T>
            <T v="h2">{inr(priced.total)}</T>
          </View>
          <Button label="Place order" size="lg" loading={placing} disabled={!addressId || loading || !priced.lines.length} onPress={place} />
        </Row>
      }>
      <TopBar title="Checkout" />

      <T v="h3" style={styles.h}>Deliver to</T>
      <View style={{ gap: 8 }}>
        {state.addresses.map((a) => (
          <Pressable key={a.id} onPress={() => { tap(); setAddressId(a.id); }} style={[styles.opt, a.id === addressId && styles.on]}>
            {a.label === 'Home' ? <House size={20} color={colors.brand600} /> : <Store size={20} color={colors.brand600} />}
            <View style={{ flex: 1 }}>
              <T v="title">{a.label}</T>
              <T v="small" numberOfLines={2}>{a.line1}, {a.line2}, {a.city} {a.pincode}</T>
            </View>
            <Radio on={a.id === addressId} />
          </Pressable>
        ))}
        <Pressable onPress={() => router.push('/addresses')} style={[styles.opt, { borderStyle: 'dashed' }]}>
          <Plus size={20} color={colors.brand600} />
          <T v="title" color={colors.brand700}>Add a new address</T>
        </Pressable>
      </View>

      <T v="h3" style={styles.h}>Payment</T>
      <View style={{ gap: 8 }}>
        {payments.map((p) => (
          <Pressable key={p.key} onPress={() => { tap(); setPayment(p.key); }} style={[styles.opt, p.key === payment && styles.on]}>
            <p.icon size={20} color={colors.brand600} />
            <View style={{ flex: 1 }}>
              <T v="title">{p.label}</T>
              <T v="small">{p.sub}</T>
            </View>
            <Radio on={p.key === payment} />
          </Pressable>
        ))}
      </View>

      <T v="h3" style={styles.h}>Summary</T>
      {loading ? <Loading rows={1} h={120} /> : <OrderSummary {...priced} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { marginTop: 22, marginBottom: 10 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.line },
  on: { borderColor: colors.brand600, backgroundColor: colors.brand50 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
});

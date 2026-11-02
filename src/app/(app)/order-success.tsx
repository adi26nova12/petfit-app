import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PackageCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { Button, Card, Row, Screen, T } from '@/components/ui';
import { inr } from '@/lib/format';
import { useStore } from '@/store/app';
import { colors } from '@/theme';

const duo = require('@/assets/brand/luna-pip-sitting.webp');

export default function OrderSuccess() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state } = useStore();
  const order = state.orders.find((o) => o.id === id);

  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          <Button label="Track order" size="lg" full onPress={() => router.replace({ pathname: '/order/[id]', params: { id } })} />
          <Button label="Continue shopping" variant="ghost" full onPress={() => router.dismissTo('/shop')} />
        </View>
      }>
      <View style={{ alignItems: 'center', marginTop: 28 }}>
        <Image source={duo} style={{ width: 220, height: 171 }} contentFit="contain" accessibilityLabel="Luna and Pip" />
        <View style={{ marginTop: -14, backgroundColor: colors.amberSoft, borderRadius: 999, padding: 12 }}>
          <PackageCheck size={28} color={colors.amberInk} />
        </View>
        <T v="h1" center style={{ marginTop: 14 }}>Order placed!</T>
        <T v="body" center style={{ marginTop: 6 }}>Order {id} · we'll message you at every step.</T>
      </View>
      {order ? (
        <Card style={{ marginTop: 24 }}>
          {order.items.map((i) => (
            <Row key={`${i.productId}-${i.variant}`} style={{ justifyContent: 'space-between', marginBottom: 6 }} align="flex-start">
              <T v="body" style={{ flex: 1 }} numberOfLines={1}>{i.qty} × {i.name}</T>
              <T v="bodyStrong">{inr(i.price * i.qty)}</T>
            </Row>
          ))}
          <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
            <T v="title">Paid via {order.paymentMethod}</T>
            <T v="h3">{inr(order.total)}</T>
          </Row>
        </Card>
      ) : null}
    </Screen>
  );
}

import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { CircleHelp, MapPin } from '@/components/doodles';
import { OrderSummary } from '@/components/blocks';
import { OrderTracker } from '@/components/OrderTracker';
import { Button, Card, EmptyState, Row, Screen, T, TopBar } from '@/components/ui';
import { inr, shortDate } from '@/lib/format';
import { useStore } from '@/store/app';
import { colors } from '@/theme';

export default function OrderDetail() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state } = useStore();
  const o = state.orders.find((x) => x.id === id);
  if (!o) return <Screen><TopBar title="Order" /><EmptyState title="Order not found" /></Screen>;
  const address = state.addresses.find((a) => a.id === o.addressId);

  return (
    <Screen>
      <TopBar title={`Order ${o.id}`} subtitle={`Placed ${shortDate(o.placedAt)}`} />
      <Card>
        <OrderTracker status={o.status} />
      </Card>

      {address ? (
        <Card style={{ marginTop: 14 }}>
          <Row gap={10} align="flex-start">
            <MapPin size={18} color={colors.brand600} />
            <View style={{ flex: 1 }}>
              <T v="title">{address.label}</T>
              <T v="small">{address.line1}, {address.line2}, {address.city} {address.pincode}</T>
            </View>
          </Row>
        </Card>
      ) : null}

      <T v="h3" style={{ marginTop: 22, marginBottom: 10 }}>Items</T>
      <Card>
        {o.items.map((i) => (
          <Row key={`${i.productId}-${i.variant}`} style={{ justifyContent: 'space-between', marginBottom: 8 }} align="flex-start">
            <View style={{ flex: 1 }}>
              <T v="bodyStrong" numberOfLines={2}>{i.name}</T>
              <T v="caption">{i.variant ? `${i.variant} · ` : ''}Qty {i.qty}</T>
            </View>
            <T v="bodyStrong">{inr(i.price * i.qty)}</T>
          </Row>
        ))}
      </Card>
      <View style={{ marginTop: 12 }}>
        <OrderSummary subtotal={o.subtotal} delivery={o.delivery} total={o.total} />
      </View>
      <Button label="Need help with this order?" variant="ghost" full style={{ marginTop: 12 }} icon={<CircleHelp size={18} color={colors.brand700} />} onPress={() => router.push('/support')} />
    </Screen>
  );
}

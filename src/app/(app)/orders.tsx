import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

import { Package } from '@/components/doodles';
import { orderStatusLabel } from '@/components/OrderTracker';
import { Button, Card, EmptyState, IconTile, Pill, Row, Screen, T, TopBar } from '@/components/ui';
import { inr, shortDate } from '@/lib/format';
import { useStore } from '@/store/app';
import { colors } from '@/theme';

export default function Orders() {
  const router = useRouter();
  const { state } = useStore();
  return (
    <Screen>
      <TopBar title="My orders" />
      {!state.orders.length ? (
        <EmptyState title="No orders yet" body="Food, treats and toys you buy will show up here." action={<Button label="Go to shop" onPress={() => router.dismissTo('/shop')} />} />
      ) : (
        <View style={{ gap: 12 }}>
          {state.orders.map((o) => (
            <Card key={o.id} onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.id } })}>
              <Row gap={12}>
                <IconTile tone={o.status === 'delivered' ? 'teal' : 'amber'}>
                  <Package size={29} color={o.status === 'delivered' ? colors.teal : colors.amberInk} />
                </IconTile>
                <View style={{ flex: 1 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <T v="title">Order {o.id}</T>
                    <T v="title">{inr(o.total)}</T>
                  </Row>
                  <T v="small" numberOfLines={1}>{o.items.map((i) => i.name).join(', ')}</T>
                  <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
                    <Pill label={orderStatusLabel(o.status)} tone={o.status === 'delivered' ? 'success' : 'amber'} />
                    <T v="caption">{shortDate(o.placedAt)}</T>
                  </Row>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </Row>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

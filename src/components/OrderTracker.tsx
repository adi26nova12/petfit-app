import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import type { OrderStatus } from '@/api/types';
import { colors } from '@/theme';
import { T } from './ui';

export const orderSteps: { key: OrderStatus; label: string; body: string }[] = [
  { key: 'placed', label: 'Order placed', body: "We've received your order" },
  { key: 'packed', label: 'Packed', body: 'Your items are packed and ready' },
  { key: 'shipped', label: 'Shipped', body: 'On its way to your city' },
  { key: 'out_for_delivery', label: 'Out for delivery', body: 'Arriving today' },
  { key: 'delivered', label: 'Delivered', body: 'Enjoy, and give them a scratch from us' },
];

export const orderStatusLabel = (s: OrderStatus) => orderSteps.find((x) => x.key === s)?.label ?? s;

export function OrderTracker({ status }: { status: OrderStatus }) {
  const at = orderSteps.findIndex((s) => s.key === status);
  return (
    <View>
      {orderSteps.map((s, i) => {
        const done = i <= at;
        const current = i === at;
        return (
          <View key={s.key} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: done ? (current ? colors.amber : colors.brand600) : colors.white,
                  borderWidth: 2,
                  borderColor: done ? (current ? colors.amber : colors.brand600) : colors.lineStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {done && !current ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
                {current ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ink }} /> : null}
              </View>
              {i < orderSteps.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 26, backgroundColor: i < at ? colors.brand600 : colors.line }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: 18 }}>
              <T v="title" color={done ? colors.ink : colors.muted}>{s.label}</T>
              {current ? <T v="small">{s.body}</T> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

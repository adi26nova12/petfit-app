import { View } from 'react-native';

import { Bell, CalendarClock, FileText, Package, Syringe, Tag } from '@/components/doodles';
import * as api from '@/api';
import type { AppNotification } from '@/api/types';
import { Card, EmptyState, IconTile, Loading, Row, Screen, T, TopBar } from '@/components/ui';
import { useApi } from '@/lib/useApi';
import { colors, type Tone } from '@/theme';

const meta: Record<AppNotification['kind'], { icon: typeof Bell; tone: Tone }> = {
  reminder: { icon: Syringe, tone: 'amber' },
  booking: { icon: CalendarClock, tone: 'teal' },
  order: { icon: Package, tone: 'purple' },
  record: { icon: FileText, tone: 'blush' },
  offer: { icon: Tag, tone: 'sand' },
};

export default function Notifications() {
  const { data, loading } = useApi(() => api.getNotifications(), []);
  return (
    <Screen>
      <TopBar title="Notifications" />
      {loading ? <Loading rows={4} h={76} /> : (
        <View style={{ gap: 10 }}>
          {(data ?? []).map((n) => {
            const m = meta[n.kind];
            return (
              <Card key={n.id} padded={false} style={{ padding: 14, backgroundColor: n.read ? colors.white : colors.brand50 }}>
                <Row gap={12} align="flex-start">
                  <IconTile tone={m.tone} size={40}><m.icon size={28} color={colors.ink} /></IconTile>
                  <View style={{ flex: 1 }}>
                    <Row style={{ justifyContent: 'space-between' }} align="flex-start">
                      <T v="title" style={{ flex: 1 }}>{n.title}</T>
                      {!n.read ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand600, marginTop: 6 }} /> : null}
                    </Row>
                    <T v="small" style={{ marginTop: 2 }}>{n.body}</T>
                    <T v="caption" style={{ marginTop: 6 }}>{n.time}</T>
                  </View>
                </Row>
              </Card>
            );
          })}
          {!data?.length ? <EmptyState title="All caught up" body="Reminders, booking updates and new records show up here." /> : null}
        </View>
      )}
    </Screen>
  );
}

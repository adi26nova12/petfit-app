import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { CalendarClock, MapPin, Video } from '@/components/doodles';
import * as api from '@/api';
import type { Booking } from '@/api/types';
import { PetAvatar } from '@/components/blocks';
import { Button, Card, EmptyState, IconTile, Pill, Row, Screen, Segmented, T, TopBar } from '@/components/ui';
import { getService } from '@/data/services';
import { daysFrom, inr, shortDate, weekday } from '@/lib/format';
import { useStore } from '@/store/app';
import { colors } from '@/theme';

function BookingCard({ b }: { b: Booking }) {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const pet = state.pets.find((p) => p.id === b.petId);
  const service = getService(b.serviceSlug);
  const soon = b.status === 'upcoming' && daysFrom(b.date) <= 0;

  const cancel = () =>
    Alert.alert('Cancel this booking?', `${b.title} with ${b.providerName}`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          await api.cancelBooking(b.id);
          dispatch({ type: 'booking', booking: { ...b, status: 'cancelled' } });
        },
      },
    ]);

  return (
    <Card>
      <Row gap={12} align="flex-start">
        <IconTile tone={b.mode === 'tele' ? 'teal' : 'purple'}>
          {b.mode === 'tele' ? <Video size={29} color={colors.teal} /> : <CalendarClock size={29} color={colors.brand600} />}
        </IconTile>
        <View style={{ flex: 1 }}>
          <T v="caption">{service?.name}</T>
          <T v="title">{b.title}</T>
          <T v="small">{b.providerName}</T>
        </View>
        {b.status === 'completed' ? <Pill label="Done" tone="success" /> : b.status === 'cancelled' ? <Pill label="Cancelled" tone="danger" /> : <Pill label="Confirmed" tone="purple" />}
      </Row>
      <Row gap={14} style={{ marginTop: 12, flexWrap: 'wrap' }}>
        <Row gap={6}><CalendarClock size={14} color={colors.muted} /><T v="smallStrong">{weekday(b.date)}, {shortDate(b.date)} · {b.slot}</T></Row>
        <Row gap={6}>
          {b.mode === 'tele' ? <Video size={14} color={colors.muted} /> : <MapPin size={14} color={colors.muted} />}
          <T v="small">{b.mode === 'tele' ? 'Video' : b.mode === 'home' ? 'At home' : 'At centre'}</T>
        </Row>
      </Row>
      <Row style={{ marginTop: 12, justifyContent: 'space-between' }}>
        <Row gap={8}>
          {pet ? <PetAvatar pet={pet} size={26} /> : null}
          <T v="small">{pet?.name} · {inr(b.amount)}</T>
        </Row>
        {b.status === 'upcoming' ? (
          <Row gap={8}>
            <Button label="Cancel" variant="ghost" size="sm" onPress={cancel} />
            {b.mode === 'tele' ? (
              <Button
                label={soon ? 'Join call' : 'Join'}
                size="sm"
                disabled={!soon}
                onPress={() => Alert.alert('Video consult', 'The call opens here (e.g. via the vet platform\'s video SDK) once the backend issues a room token.')}
              />
            ) : null}
          </Row>
        ) : b.status === 'completed' ? (
          <Button label="Book again" size="sm" variant="outline" onPress={() => router.push({ pathname: '/service/[slug]', params: { slug: b.serviceSlug } })} />
        ) : null}
      </Row>
    </Card>
  );
}

export default function Bookings() {
  const { state } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const list = state.bookings
    .filter((b) => (tab === 'upcoming' ? b.status === 'upcoming' : b.status !== 'upcoming'))
    .sort((a, b) => (tab === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

  return (
    <Screen>
      <TopBar title="My bookings" />
      <Segmented value={tab} onChange={setTab} options={[{ key: 'upcoming', label: 'Upcoming' }, { key: 'past', label: 'Past' }]} />
      <View style={{ gap: 12, marginTop: 16 }}>
        {list.map((b) => <BookingCard key={b.id} b={b} />)}
        {!list.length ? (
          <EmptyState
            title={tab === 'upcoming' ? 'Nothing booked yet' : 'No past bookings'}
            body="Vets, grooming, lab tests and more — booked in a few taps."
            action={<Button label="Explore services" onPress={() => router.push('/services')} />}
          />
        ) : null}
      </View>
    </Screen>
  );
}

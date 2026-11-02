import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarCheck, FileText, MapPin, Video } from 'lucide-react-native';
import { View } from 'react-native';

import { Button, Card, Row, Screen, T } from '@/components/ui';
import { shortDate, weekday } from '@/lib/format';
import { useStore } from '@/store/app';
import { colors } from '@/theme';

const duo = require('@/assets/brand/luna-pip-sitting.webp');

export default function BookingSuccess() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state } = useStore();
  const b = state.bookings.find((x) => x.id === id);
  const pet = state.pets.find((p) => p.id === b?.petId);

  return (
    <Screen
      edges={['top']}
      footer={
        <View style={{ gap: 10 }}>
          <Button label="View my bookings" size="lg" full onPress={() => router.replace('/bookings')} />
          <Button label="Back to home" variant="ghost" full onPress={() => router.dismissTo('/home')} />
        </View>
      }>
      <View style={{ alignItems: 'center', marginTop: 28 }}>
        <Image source={duo} style={{ width: 220, height: 171 }} contentFit="contain" accessibilityLabel="Luna and Pip celebrating" />
        <View style={{ marginTop: -14, backgroundColor: colors.tealSoft, borderRadius: 999, padding: 12 }}>
          <CalendarCheck size={28} color={colors.teal} />
        </View>
        <T v="h1" center style={{ marginTop: 14 }}>Booked!</T>
        <T v="body" center style={{ marginTop: 6, maxWidth: 300 }}>
          {pet?.name ?? 'Your pet'} is all set. We'll remind you before it starts.
        </T>
      </View>

      {b ? (
        <Card style={{ marginTop: 24 }}>
          <T v="title">{b.title}</T>
          <T v="small">{b.providerName}</T>
          <Row gap={8} style={{ marginTop: 12 }}>
            <CalendarCheck size={16} color={colors.brand600} />
            <T v="bodyStrong">{weekday(b.date)}, {shortDate(b.date)} · {b.slot}</T>
          </Row>
          <Row gap={8} style={{ marginTop: 6 }}>
            {b.mode === 'tele' ? <Video size={16} color={colors.brand600} /> : <MapPin size={16} color={colors.brand600} />}
            <T v="body">{b.mode === 'tele' ? 'Video call — join from Bookings' : b.mode === 'home' ? 'At your home' : 'At the centre'}</T>
          </Row>
          <Row gap={8} style={{ marginTop: 14, backgroundColor: colors.brand50, padding: 10, borderRadius: 12 }}>
            <FileText size={16} color={colors.brand600} />
            <T v="small" style={{ flex: 1 }}>Notes and reports from this visit will appear in {pet?.name ?? 'your pet'}'s vault.</T>
          </Row>
        </Card>
      ) : null}
    </Screen>
  );
}

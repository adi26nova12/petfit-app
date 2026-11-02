import { Redirect, useLocalSearchParams } from 'expo-router';
import { CircleCheck, MapPin } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import * as api from '@/api';
import { ProviderCard, VetCard } from '@/components/blocks';
import { Icon } from '@/components/Icon';
import { Button, Card, Chip, ChipRow, EmptyState, Field, Gap, Loading, Paw, Pill, Row, Screen, T, TopBar } from '@/components/ui';
import { getService, type Service } from '@/data/services';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, radius, tones } from '@/theme';

function Hero({ service }: { service: Service }) {
  const t = tones[service.tone];
  return (
    <View style={{ backgroundColor: t.bg, borderRadius: radius.xl, padding: 18, marginTop: 4 }}>
      <Row gap={12} align="flex-start">
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={service.icon} size={26} color={t.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <T v="h2">{service.name}</T>
          <T v="small" color={colors.inkSoft} style={{ marginTop: 4 }}>{service.promise}</T>
        </View>
      </Row>
    </View>
  );
}

function HowItWorks({ service }: { service: Service }) {
  const steps = [
    ['Choose', 'Compare verified providers and prices up front.'],
    ['Book', 'Pick a slot and pay the price on the card — no booking fee.'],
    ['Saved to profile', service.profileStep],
  ];
  return (
    <Card style={{ marginTop: 24 }}>
      <T v="h3">How it works</T>
      {steps.map(([title, body], i) => (
        <Row key={title} gap={12} align="flex-start" style={{ marginTop: 14 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brand600, alignItems: 'center', justifyContent: 'center' }}>
            <T v="smallStrong" color={colors.white}>{i + 1}</T>
          </View>
          <View style={{ flex: 1 }}>
            <T v="title">{title}</T>
            <T v="small">{body}</T>
          </View>
        </Row>
      ))}
    </Card>
  );
}

function VetList() {
  const [filter, setFilter] = useState<'all' | 'tele' | 'specialist'>('all');
  const { data, loading } = useApi(() => api.getVets(), []);
  const list = useMemo(
    () =>
      (data ?? []).filter((v) =>
        filter === 'tele' ? v.teleconsultationFee != null : filter === 'specialist' ? v.specialization !== 'General practice' : true,
      ),
    [data, filter],
  );
  return (
    <>
      <ChipRow>
        <Chip label="All vets" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Video consult" selected={filter === 'tele'} onPress={() => setFilter('tele')} />
        <Chip label="Specialists" selected={filter === 'specialist'} onPress={() => setFilter('specialist')} />
      </ChipRow>
      <Gap h={14} />
      {loading ? <Loading rows={3} h={170} /> : (
        <View style={{ gap: 12 }}>
          {list.map((v) => <VetCard key={v.id} vet={v} />)}
          {!list.length ? <EmptyState title="No vets match" body="Try another filter." /> : null}
        </View>
      )}
    </>
  );
}

function ProviderList({ serviceType, tone }: { serviceType: string; tone: Service['tone'] }) {
  const [mode, setMode] = useState<'all' | 'home' | 'centre'>('all');
  const { data, loading } = useApi(() => api.getProviders(serviceType), [serviceType]);
  const list = (data ?? []).filter((p) => mode === 'all' || p.modes.includes(mode));
  const hasBoth = (data ?? []).some((p) => p.modes.length > 1 || p.modes[0] === 'home');
  return (
    <>
      {hasBoth ? (
        <>
          <ChipRow>
            <Chip label="All" selected={mode === 'all'} onPress={() => setMode('all')} />
            <Chip label="At home" selected={mode === 'home'} onPress={() => setMode('home')} />
            <Chip label="At centre" selected={mode === 'centre'} onPress={() => setMode('centre')} />
          </ChipRow>
          <Gap h={14} />
        </>
      ) : null}
      {loading ? <Loading rows={3} h={150} /> : (
        <View style={{ gap: 12 }}>
          {list.map((p) => <ProviderCard key={p.id} provider={p} tone={tone} />)}
          {!list.length ? <EmptyState title="No providers here yet" body="We're onboarding verified partners in your city." /> : null}
        </View>
      )}
    </>
  );
}

function Waitlist({ service }: { service: Service }) {
  const { state } = useStore();
  const [city, setCity] = useState(state.user?.city ?? '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <>
      <Card style={{ marginTop: 16 }}>
        <Pill label="Coming soon" tone="amber" />
        <T v="body" style={{ marginTop: 10 }}>{service.intro}</T>
        {service.included.map((i) => (
          <Row key={i.title} gap={10} align="flex-start" style={{ marginTop: 12 }}>
            <Paw size={16} color={colors.brand400} />
            <View style={{ flex: 1 }}>
              <T v="title">{i.title}</T>
              <T v="small">{i.body}</T>
            </View>
          </Row>
        ))}
      </Card>
      <Card style={{ marginTop: 14 }}>
        {done ? (
          <Row gap={12}>
            <CircleCheck size={26} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <T v="title">You're on the list</T>
              <T v="small">We'll notify you when {service.shortName.toLowerCase()} opens in {city}.</T>
            </View>
          </Row>
        ) : (
          <>
            <T v="h3">Join the waitlist</T>
            <T v="small" style={{ marginTop: 4 }}>Be first to know when it opens in your city.</T>
            <Field style={{ marginTop: 14 }} label="City" value={city} onChangeText={setCity} placeholder="e.g. Gurugram" />
            <Button
              label="Notify me"
              full
              style={{ marginTop: 16 }}
              loading={loading}
              disabled={!city.trim()}
              onPress={async () => {
                setLoading(true);
                await api.joinWaitlist({ service: service.slug, city, phone: state.user?.phone ?? '' });
                setLoading(false);
                setDone(true);
              }}
            />
          </>
        )}
      </Card>
    </>
  );
}

export default function ServiceScreen() {
  const { slug = '' } = useLocalSearchParams<{ slug: string }>();
  const { state } = useStore();
  const service = getService(slug);
  if (!service) return <Screen><TopBar /><EmptyState title="Service not found" /></Screen>;
  if (service.listing.kind === 'rescue') return <Redirect href="/rescue" />;

  return (
    <Screen>
      <TopBar
        title={service.shortName}
        right={
          <Row gap={4}>
            <MapPin size={14} color={colors.brand600} />
            <T v="smallStrong" color={colors.brand600}>{state.user?.city}</T>
          </Row>
        }
      />
      <Hero service={service} />
      <Gap h={18} />
      {service.listing.kind === 'vets' ? <VetList /> : null}
      {service.listing.kind === 'providers' ? <ProviderList serviceType={service.listing.serviceType} tone={service.tone} /> : null}
      {service.listing.kind === 'waitlist' ? <Waitlist service={service} /> : <HowItWorks service={service} />}
    </Screen>
  );
}

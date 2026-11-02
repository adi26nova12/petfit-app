import { useLocalSearchParams, useRouter } from 'expo-router';
import { House, MapPin, Store, Video } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import * as api from '@/api';
import type { BookingMode } from '@/api/types';
import { PetAvatar } from '@/components/blocks';
import { Button, Card, Divider, Field, Gap, Loading, Row, Screen, Segmented, T, TopBar, tap } from '@/components/ui';
import { getService } from '@/data/services';
import { inr, isoDay, shortDate, weekday } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, radius, space } from '@/theme';

const serviceTypeToSlug: Record<string, string> = {
  labs: 'diagnostics',
  daycare: 'daycare-boarding',
  travel: 'pet-travel',
};

export default function Book() {
  const params = useLocalSearchParams<{ kind: 'vet' | 'provider'; id: string; mode?: string; packageId?: string }>();
  const router = useRouter();
  const { state, dispatch, activePet } = useStore();

  const { data: target, loading } = useApi(async () => {
    if (params.kind === 'vet') {
      const vet = await api.getVet(params.id);
      if (!vet) return null;
      const tele = params.mode === 'tele';
      return {
        providerId: vet.id,
        providerName: vet.name,
        title: tele ? 'Video consult' : 'Clinic visit',
        price: (tele ? vet.teleconsultationFee : vet.consultationFee) ?? 0,
        serviceSlug: 'vets',
        modes: [tele ? 'tele' : 'clinic'] as BookingMode[],
        where: tele ? 'Video call from the app' : `${vet.clinicName}, ${vet.area}`,
      };
    }
    const p = await api.getProvider(params.id);
    const pkg = p?.packages.find((x) => x.id === params.packageId);
    if (!p || !pkg) return null;
    return {
      providerId: p.id,
      providerName: p.name,
      title: pkg.name,
      price: pkg.price,
      serviceSlug: serviceTypeToSlug[p.serviceType] ?? p.serviceType,
      modes: p.modes.map((m) => (m === 'home' ? 'home' : 'centre')) as BookingMode[],
      where: `${p.area}, ${p.city}`,
    };
  }, [params.kind, params.id, params.mode, params.packageId]);

  const dates = useMemo(() => Array.from({ length: 10 }, (_, i) => isoDay(i + 1)), []);
  const [date, setDate] = useState(dates[0]);
  const [slot, setSlot] = useState<string | null>(null);
  const [petId, setPetId] = useState(activePet?.id ?? '');
  const [mode, setMode] = useState<BookingMode | null>(null);
  const [addressId, setAddressId] = useState(state.addresses[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const slots = useApi(() => (target ? api.getSlots(target.providerId, date) : Promise.resolve([])), [target?.providerId, date]);

  if (loading) return <Screen><TopBar title="Book" /><Loading rows={4} h={90} /></Screen>;
  if (!target) return <Screen><TopBar title="Book" /><T v="body">This booking is no longer available.</T></Screen>;

  const activeMode = mode ?? target.modes[0];
  const service = getService(target.serviceSlug);

  const confirm = async () => {
    if (!slot) return;
    setSaving(true);
    const booking = await api.createBooking({
      serviceSlug: target.serviceSlug,
      providerId: target.providerId,
      providerName: target.providerName,
      title: target.title,
      petId,
      date,
      slot,
      mode: activeMode,
      amount: target.price,
    });
    dispatch({ type: 'booking', booking });
    router.dismissTo('/home');
    router.push({ pathname: '/booking-success', params: { id: booking.id } });
  };

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View style={{ flex: 1 }}>
            <T v="caption">{slot ? `${shortDate(date)}, ${slot}` : 'Pick a time'}</T>
            <T v="h2">{inr(target.price)}</T>
          </View>
          <Button label="Confirm booking" size="lg" disabled={!slot || !petId} loading={saving} onPress={confirm} />
        </Row>
      }>
      <TopBar title="Book a slot" subtitle={service?.name} />

      <Card>
        <T v="title">{target.title}</T>
        <T v="small">{target.providerName}</T>
        <Row gap={6} style={{ marginTop: 6 }}>
          {activeMode === 'tele' ? <Video size={14} color={colors.teal} /> : <MapPin size={14} color={colors.muted} />}
          <T v="caption">{activeMode === 'home' ? 'At your address' : target.where}</T>
        </Row>
      </Card>

      <T v="h3" style={styles.h}>Who's it for?</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {state.pets.map((p) => {
          const on = p.id === petId;
          return (
            <Pressable key={p.id} onPress={() => { tap(); setPetId(p.id); }} style={[styles.pet, on && styles.on]}>
              <PetAvatar pet={p} size={36} />
              <T v="title" color={on ? colors.brand700 : colors.ink}>{p.name}</T>
            </Pressable>
          );
        })}
      </ScrollView>

      {target.modes.length > 1 ? (
        <>
          <T v="h3" style={styles.h}>Where?</T>
          <Segmented
            value={activeMode}
            onChange={setMode}
            options={target.modes.map((m) => ({ key: m, label: m === 'home' ? 'At my home' : 'At the centre' }))}
          />
        </>
      ) : null}

      <T v="h3" style={styles.h}>Date</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.gutter }} contentContainerStyle={{ gap: 8, paddingHorizontal: space.gutter }}>
        {dates.map((d) => {
          const on = d === date;
          return (
            <Pressable key={d} onPress={() => { tap(); setDate(d); setSlot(null); }} style={[styles.date, on && styles.dateOn]}>
              <T v="caption" color={on ? colors.brand200 : colors.muted}>{weekday(d)}</T>
              <T v="h2" color={on ? colors.white : colors.ink}>{Number(d.slice(8))}</T>
              <T v="caption" color={on ? colors.brand200 : colors.muted}>{shortDate(d).split(' ')[1]}</T>
            </Pressable>
          );
        })}
      </ScrollView>

      <T v="h3" style={styles.h}>Time</T>
      {slots.loading ? <Loading rows={1} h={100} /> : (
        <View style={styles.slots}>
          {(slots.data ?? []).map((s) => {
            const on = s.time === slot;
            return (
              <Pressable
                key={s.time}
                disabled={!s.available}
                onPress={() => { tap(); setSlot(s.time); }}
                style={[styles.slot, on && styles.slotOn, !s.available && styles.slotOff]}>
                <T v="smallStrong" color={on ? colors.white : s.available ? colors.ink : colors.muted} style={!s.available && { textDecorationLine: 'line-through' }}>
                  {s.time}
                </T>
              </Pressable>
            );
          })}
        </View>
      )}

      {activeMode === 'home' ? (
        <>
          <T v="h3" style={styles.h}>Address</T>
          <View style={{ gap: 8 }}>
            {state.addresses.map((a) => {
              const on = a.id === addressId;
              return (
                <Pressable key={a.id} onPress={() => { tap(); setAddressId(a.id); }} style={[styles.addr, on && styles.on]}>
                  {a.label === 'Home' ? <House size={18} color={colors.brand600} /> : <Store size={18} color={colors.brand600} />}
                  <View style={{ flex: 1 }}>
                    <T v="title">{a.label}</T>
                    <T v="small" numberOfLines={1}>{a.line1}, {a.line2}, {a.city}</T>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <Field style={{ marginTop: 22 }} label="Notes for the provider (optional)" placeholder="E.g. nervous around clippers" multiline value={notes} onChangeText={setNotes} />

      <Card style={{ marginTop: 22 }}>
        <Row style={{ justifyContent: 'space-between' }}><T v="body">{target.title}</T><T v="bodyStrong">{inr(target.price)}</T></Row>
        <Row style={{ justifyContent: 'space-between', marginTop: 6 }}><T v="body">Booking fee</T><T v="bodyStrong" color={colors.teal}>₹0</T></Row>
        <Divider style={{ marginVertical: 12 }} />
        <Row style={{ justifyContent: 'space-between' }}><T v="title">To pay</T><T v="h3">{inr(target.price)}</T></Row>
        <T v="caption" style={{ marginTop: 8 }}>Pay after the service or online. Free cancellation up to 2 hours before.</T>
      </Card>
      <Gap h={8} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { marginTop: 24, marginBottom: 10 },
  pet: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingLeft: 8, paddingRight: 16, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.line },
  on: { borderColor: colors.brand600, backgroundColor: colors.brand50 },
  date: { width: 62, alignItems: 'center', paddingVertical: 10, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  dateOn: { backgroundColor: colors.brand600, borderColor: colors.brand600 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: '31%', alignItems: 'center', paddingVertical: 11, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lineStrong },
  slotOn: { backgroundColor: colors.brand600, borderColor: colors.brand600 },
  slotOff: { backgroundColor: colors.sand, borderColor: 'transparent' },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.line },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Award, Building2, Languages, MapPin, Video } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import * as api from '@/api';
import { PersonAvatar, Verified } from '@/components/blocks';
import { Button, Card, Divider, EmptyState, Loading, Pill, Rating, Row, Screen, Segmented, T, TopBar } from '@/components/ui';
import { inr } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { colors } from '@/theme';

export default function VetDetail() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: vet, loading } = useApi(() => api.getVet(id), [id]);
  const [mode, setMode] = useState<'clinic' | 'tele'>('clinic');

  if (loading) return <Screen><TopBar /><Loading rows={3} h={140} /></Screen>;
  if (!vet) return <Screen><TopBar /><EmptyState title="Vet not found" /></Screen>;

  const fee = mode === 'clinic' ? vet.consultationFee : vet.teleconsultationFee;
  const facts = [
    { icon: Award, label: `${vet.experienceYears} yrs experience` },
    { icon: Building2, label: vet.clinicName },
    { icon: MapPin, label: `${vet.area}, ${vet.city}` },
    { icon: Languages, label: vet.languages.join(', ') },
  ];

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View style={{ flex: 1 }}>
            <T v="caption">{mode === 'clinic' ? 'Clinic visit' : 'Video consult'} · ₹0 booking fee</T>
            <T v="h2">{inr(fee)}</T>
          </View>
          <Button
            label="Pick a slot"
            size="lg"
            disabled={fee == null}
            onPress={() => router.push({ pathname: '/book', params: { kind: 'vet', id: vet.id, mode } })}
          />
        </Row>
      }>
      <TopBar title="Vet profile" />
      <Card>
        <Row gap={14} align="flex-start">
          <PersonAvatar name={vet.name} size={72} url={vet.avatarUrl} />
          <View style={{ flex: 1 }}>
            <T v="h2">{vet.name}</T>
            <T v="small">{vet.specialization}</T>
            <Row gap={10} style={{ marginTop: 8, flexWrap: 'wrap' }}>
              <Rating value={vet.rating} reviews={vet.reviews} />
              {vet.verified ? <Verified /> : null}
            </Row>
          </View>
        </Row>
        {vet.recommended ? <Pill label="Recommended by PetFit" tone="amber" style={{ marginTop: 14 }} /> : null}
        <Divider style={{ marginVertical: 16 }} />
        <View style={{ gap: 10 }}>
          {facts.map((f) => (
            <Row key={f.label} gap={10}>
              <f.icon size={17} color={colors.brand600} />
              <T v="body" style={{ flex: 1 }}>{f.label}</T>
            </Row>
          ))}
        </View>
      </Card>

      <T v="h3" style={{ marginTop: 24, marginBottom: 10 }}>Consultation type</T>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { key: 'clinic', label: `Clinic · ${inr(vet.consultationFee)}` },
          { key: 'tele', label: vet.teleconsultationFee != null ? `Video · ${inr(vet.teleconsultationFee)}` : 'Video · n/a' },
        ]}
      />
      {mode === 'tele' ? (
        <Row gap={8} style={{ marginTop: 10 }}>
          <Video size={15} color={colors.teal} />
          <T v="small">Join the call from Bookings — no app download for the vet.</T>
        </Row>
      ) : null}

      <T v="h3" style={{ marginTop: 24, marginBottom: 6 }}>About</T>
      <T v="body">{vet.about}</T>
      <T v="small" style={{ marginTop: 14 }}>
        After the visit, the vet's notes and any digital prescription are saved to your pet's health timeline and vault.
      </T>
    </Screen>
  );
}

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Camera, CircleCheck, LifeBuoy, LocateFixed } from '@/components/doodles';
import * as api from '@/api';
import type { RescueRequest } from '@/api/types';
import { Button, Card, Field, Notice, Pill, Row, Screen, T, TopBar } from '@/components/ui';
import { useStore } from '@/store/app';
import { colors, radius } from '@/theme';

export default function Rescue() {
  const { state } = useStore();
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const valid = location.trim().length > 3 && description.trim().length > 5;

  const submit = async () => {
    setSending(true);
    const r = await api.createRescueRequest({ location, description, phone: state.user?.phone ?? '' });
    setRequests([r, ...requests]);
    setLocation('');
    setDescription('');
    setSending(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={<Button label="Send rescue request" variant="danger" size="lg" full disabled={!valid} loading={sending} onPress={submit} />}>
        <TopBar title="Report a pet in need" />
        <Notice
          tone="blush"
          icon={<LifeBuoy size={22} color={colors.blushInk} />}
          title="PetFit assigns a nearby rescuer"
          body="Share the location and what happened. PetFit charges nothing for rescue."
        />

        {requests.map((r) => (
          <Card key={r.id} style={{ marginTop: 14 }}>
            <Row gap={10}>
              <CircleCheck size={22} color={colors.teal} />
              <View style={{ flex: 1 }}>
                <T v="title">Request sent</T>
                <T v="small" numberOfLines={1}>{r.location}</T>
              </View>
              <Pill label="Finding rescuer" tone="amber" />
            </Row>
          </Card>
        ))}

        <View style={{ gap: 16, marginTop: 20 }}>
          <View style={{ gap: 8 }}>
            <Field label="Where is the animal?" value={location} onChangeText={setLocation} placeholder="Landmark, street, pincode" />
            {/* Production: expo-location → reverse geocode into this field. */}
            <Pressable onPress={() => setLocation(`Near ${state.addresses[0]?.line2 ?? 'my location'}, ${state.user?.city ?? ''}`)}>
              <Row gap={6}>
                <LocateFixed size={16} color={colors.brand600} />
                <T v="smallStrong" color={colors.brand600}>Use my current location</T>
              </Row>
            </Pressable>
          </View>
          <Field label="What happened?" value={description} onChangeText={setDescription} placeholder="E.g. injured dog limping near the bus stop" multiline />
          <Pressable style={styles.photo}>
            <Camera size={22} color={colors.brand600} />
            <View style={{ flex: 1 }}>
              <T v="title" color={colors.brand700}>Add a photo (optional)</T>
              <T v="caption">Helps the rescuer find and assess the animal</T>
            </View>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  photo: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.brand300, backgroundColor: colors.brand50 },
});

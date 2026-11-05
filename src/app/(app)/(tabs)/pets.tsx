import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FileText, FlaskConical, Pencil, Plane, Scale, Syringe, Upload } from '@/components/doodles';
import * as api from '@/api';
import type { VaultDoc, VaultDocKind } from '@/api/types';
import { PetAvatar } from '@/components/blocks';
import { ScoreRing, WeightChart } from '@/components/charts';
import { Button, Card, EmptyState, Field, IconButton, IconTile, Loading, Pill, Row, Segmented, T, tap } from '@/components/ui';
import { dogBreeds, estimateBodyCondition, lifeStageFromDob } from '@/data/nutrition';
import { daysFrom, petAge, relativeDue, shortDate } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, fonts, radius, space, type Tone } from '@/theme';

const docMeta: Record<VaultDocKind, { icon: typeof FileText; tone: Tone; label: string }> = {
  lab: { icon: FlaskConical, tone: 'teal', label: 'Lab report' },
  prescription: { icon: FileText, tone: 'purple', label: 'Prescription' },
  vaccination: { icon: Syringe, tone: 'amber', label: 'Vaccination' },
  travel: { icon: Plane, tone: 'blush', label: 'Travel' },
  other: { icon: FileText, tone: 'sand', label: 'Document' },
};

function HealthTab({ petId }: { petId: string }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { activePet, dispatch } = useStore();
  const vaccines = useApi(() => api.getVaccinations(petId), [petId]);
  const weights = useApi(() => api.getWeights(petId), [petId]);
  const [logging, setLogging] = useState(false);
  const [kg, setKg] = useState('');

  const breed = activePet?.species === 'dog' ? dogBreeds.find((b) => b.breed.startsWith(activePet.breed)) : undefined;
  const bc = breed && activePet ? estimateBodyCondition(breed, activePet.weightKg) : null;
  const sorted = [...(vaccines.data ?? [])].sort((a, b) => {
    if (!a.givenOn !== !b.givenOn) return a.givenOn ? 1 : -1;
    return a.givenOn ? b.dueOn.localeCompare(a.dueOn) : a.dueOn.localeCompare(b.dueOn);
  });

  const saveWeight = async () => {
    const n = Number(kg.replace(',', '.'));
    if (!activePet || !n || n <= 0 || n > 120) return;
    const entry = await api.logWeight(petId, n);
    weights.setData([...(weights.data ?? []), entry]);
    dispatch({ type: 'pet', pet: { ...activePet, weightKg: n } });
    setKg('');
    setLogging(false);
  };

  return (
    <>
      <Row gap={10} style={{ marginTop: 16 }} align="stretch">
        <Card style={styles.stat} padded={false}>
          <T v="caption">Body condition</T>
          <T v="title" color={bc?.band === 'Ideal' ? colors.teal : bc ? colors.amberInk : colors.ink}>{bc?.band ?? 'Log weight'}</T>
          {bc ? <T v="caption">Ideal {bc.idealMinKg}–{bc.idealMaxKg} kg</T> : null}
        </Card>
        <Card style={styles.stat} padded={false}>
          <T v="caption">Life stage</T>
          <T v="title">{lifeStageFromDob(activePet?.dob).replace('Puppy-Kitten', activePet?.species === 'cat' ? 'Kitten' : 'Puppy')}</T>
          <T v="caption">{activePet ? petAge(activePet.dob) : ''}</T>
        </Card>
      </Row>

      <Row style={styles.h}>
        <T v="h2">Vaccinations</T>
        <Pressable onPress={() => router.push({ pathname: '/tools/[tool]', params: { tool: 'vaccines' } })}><T v="smallStrong" color={colors.brand600}>Schedule</T></Pressable>
      </Row>
      {vaccines.loading ? <Loading rows={2} h={64} /> : (
        <Card padded={false}>
          {sorted.map((v, i) => {
            const overdue = !v.givenOn && daysFrom(v.dueOn) < 0;
            return (
              <View key={v.id} style={[styles.vRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
                <View style={[styles.vDot, { backgroundColor: v.givenOn ? colors.teal : overdue ? colors.danger : colors.amber }]} />
                <View style={{ flex: 1 }}>
                  <T v="title">{v.name}</T>
                  <T v="caption">{v.givenOn ? `Given ${shortDate(v.givenOn)}${v.provider ? ` · ${v.provider}` : ''}` : `${shortDate(v.dueOn)} · ${relativeDue(v.dueOn)}`}</T>
                </View>
                {v.givenOn ? (
                  <Pill label="Done" tone="success" />
                ) : (
                  <Button label="Book" size="sm" variant={overdue ? 'danger' : 'primary'} onPress={() => router.push({ pathname: '/service/[slug]', params: { slug: 'vaccination' } })} />
                )}
              </View>
            );
          })}
        </Card>
      )}

      <Row style={styles.h}>
        <T v="h2">Weight</T>
        <Pressable onPress={() => setLogging((x) => !x)}><T v="smallStrong" color={colors.brand600}>{logging ? 'Cancel' : 'Log weight'}</T></Pressable>
      </Row>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <T v="caption">Latest</T>
            <T v="h2">{activePet?.weightKg} kg</T>
          </View>
          <IconTile tone="teal"><Scale size={29} color={colors.teal} /></IconTile>
        </Row>
        {logging ? (
          <Row gap={10} style={{ marginTop: 12 }} align="flex-end">
            <Field style={{ flex: 1 }} label="Today's weight (kg)" keyboardType="decimal-pad" value={kg} onChangeText={setKg} placeholder="e.g. 28.6" autoFocus />
            <Button label="Save" onPress={saveWeight} disabled={!kg} />
          </Row>
        ) : null}
        {weights.loading ? <Loading rows={1} h={150} /> : (
          <View style={{ marginTop: 10 }}>
            <WeightChart data={weights.data ?? []} width={width - space.gutter * 2 - 34} idealMin={bc?.idealMinKg} idealMax={bc?.idealMaxKg} />
          </View>
        )}
      </Card>
    </>
  );
}

function VaultTab({ petId }: { petId: string }) {
  const { data, loading, setData } = useApi(() => api.getVault(petId), [petId]);
  const [filter, setFilter] = useState<VaultDocKind | 'all'>('all');
  const list = (data ?? []).filter((d) => filter === 'all' || d.kind === filter);

  const upload = () => {
    // Production: open expo-document-picker / expo-image-picker, then multipart POST via api.addVaultDoc.
    Alert.alert('Add a document', 'Choose what you are adding', [
      ...(['lab', 'prescription', 'vaccination'] as VaultDocKind[]).map((kind) => ({
        text: docMeta[kind].label,
        onPress: async () => {
          const doc = await api.addVaultDoc(petId, { title: `${docMeta[kind].label} (uploaded)`, kind });
          setData([doc, ...(data ?? [])]);
        },
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <>
      <Pressable onPress={upload} style={styles.upload}>
        <Upload size={20} color={colors.brand600} />
        <View style={{ flex: 1 }}>
          <T v="title" color={colors.brand700}>Upload a document</T>
          <T v="caption">PDF or photo. Vets and labs on PetFit add theirs automatically.</T>
        </View>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, marginHorizontal: -space.gutter }} contentContainerStyle={{ gap: 8, paddingHorizontal: space.gutter }}>
        {(['all', 'lab', 'prescription', 'vaccination', 'travel'] as const).map((k) => (
          <Pressable key={k} onPress={() => { tap(); setFilter(k); }} style={[styles.chip, filter === k && styles.chipOn]}>
            <T v="smallStrong" color={filter === k ? colors.white : colors.ink}>{k === 'all' ? 'All' : docMeta[k].label}</T>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ gap: 10, marginTop: 14 }}>
        {loading ? <Loading rows={3} h={64} /> : list.map((d: VaultDoc) => {
          const m = docMeta[d.kind];
          return (
            <Card key={d.id} padded={false} style={{ padding: 12 }} onPress={() => Alert.alert(d.title, 'The document viewer opens here once files come from the API.')}>
              <Row gap={12}>
                <IconTile tone={m.tone} size={40}><m.icon size={28} color={colors.ink} /></IconTile>
                <View style={{ flex: 1 }}>
                  <T v="title" numberOfLines={1}>{d.title}</T>
                  <T v="caption">{d.source} · {shortDate(d.date)}</T>
                </View>
              </Row>
            </Card>
          );
        })}
        {!loading && !list.length ? <EmptyState title="Nothing here yet" body="Reports and prescriptions will appear here." /> : null}
      </View>
    </>
  );
}

export default function PetProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, dispatch, activePet } = useStore();
  const [tab, setTab] = useState<'health' | 'vault'>('health');

  if (!activePet) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 40, paddingHorizontal: space.gutter }}>
        <EmptyState title="No pets yet" body="Add your pet to keep vaccines, weight and records in one place." action={<Button label="Add a pet" onPress={() => router.push('/pet-form')} />} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T v="eyebrow" color={colors.amber}>Pet profile</T>
            <IconButton label="Edit pet" onPress={() => router.push({ pathname: '/pet-form', params: { id: activePet.id } })}>
              <Pencil size={17} color={colors.white} />
            </IconButton>
          </Row>
          <Row gap={16} style={{ marginTop: 8 }}>
            <PetAvatar pet={activePet} size={84} ring />
            <View style={{ flex: 1 }}>
              <T v="h1" color={colors.white}>{activePet.name}</T>
              <T v="small" color={colors.brand200}>{activePet.breed}</T>
              <T v="small" color={colors.brand200}>{activePet.gender === 'male' ? 'Male' : 'Female'} · {petAge(activePet.dob)} · {activePet.weightKg} kg</T>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ScoreRing score={activePet.healthScore} size={64} light />
              <T v="caption" color={colors.brand200} style={{ marginTop: 3 }}>Health score</T>
            </View>
          </Row>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18 }} contentContainerStyle={{ gap: 8 }}>
            {state.pets.map((p) => {
              const on = p.id === activePet.id;
              return (
                <Pressable key={p.id} onPress={() => { tap(); dispatch({ type: 'activePet', id: p.id }); }} style={[styles.switch, on && { backgroundColor: colors.amber }]}>
                  <PetAvatar pet={p} size={26} />
                  <T v="smallStrong" color={on ? colors.ink : colors.white}>{p.name}</T>
                </Pressable>
              );
            })}
            <Pressable onPress={() => router.push('/pet-form')} style={styles.switch}>
              <Plus size={16} color={colors.white} />
              <T v="smallStrong" color={colors.white}>Add pet</T>
            </Pressable>
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: space.gutter, marginTop: -22 }}>
          <Segmented value={tab} onChange={setTab} options={[{ key: 'health', label: 'Health' }, { key: 'vault', label: 'Vault' }]} />
          {tab === 'health' ? <HealthTab petId={activePet.id} /> : <VaultTab petId={activePet.id} />}
          {activePet.microchipId ? (
            <T v="caption" center style={{ marginTop: 24 }}>Microchip {activePet.microchipId}</T>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.brand900, paddingHorizontal: space.gutter, paddingBottom: 44, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  switch: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingLeft: 6, paddingRight: 14, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.12)' },
  stat: { flex: 1, padding: 14, gap: 2 },
  h: { justifyContent: 'space-between', marginTop: 26, marginBottom: 10 },
  vRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  vDot: { width: 10, height: 10, borderRadius: 5 },
  upload: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.brand300, backgroundColor: colors.brand50 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lineStrong },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  serif: { fontFamily: fonts.serifItalic },
});

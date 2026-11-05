import { useRouter } from 'expo-router';
import { ChevronRight, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Search as SearchIcon } from '@/components/doodles';
import * as api from '@/api';
import { PersonAvatar, ProductArt } from '@/components/blocks';
import { Icon } from '@/components/Icon';
import { Chip, IconTile, Row, Screen, T, TopBar } from '@/components/ui';
import { services } from '@/data/services';
import { inr } from '@/lib/format';
import { openService } from '@/lib/nav';
import { useApi } from '@/lib/useApi';
import { colors, fonts, radius, tones } from '@/theme';

const popular = ['Vet', 'Grooming', 'Vaccine', 'Boarding', 'Dog food', 'Lab test'];

export default function Search() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const vets = useApi(() => api.getVets(), []);
  const products = useApi(() => (term.length > 1 ? api.getProducts({ q: term }) : Promise.resolve([])), [term]);

  const svc = term ? services.filter((s) => `${s.name} ${s.shortName} ${s.promise}`.toLowerCase().includes(term)) : [];
  const vetHits = term ? (vets.data ?? []).filter((v) => `${v.name} ${v.specialization} ${v.clinicName}`.toLowerCase().includes(term)) : [];
  const prodHits = products.data ?? [];
  const none = term.length > 1 && !svc.length && !vetHits.length && !prodHits.length && !products.loading;

  return (
    <Screen>
      <TopBar title="Search" />
      <View style={styles.box}>
        <SearchIcon size={18} color={colors.muted} />
        <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Search vets, grooming, food…" placeholderTextColor={colors.muted} style={styles.input} returnKeyType="search" />
        {q ? <Pressable accessibilityLabel="Clear" onPress={() => setQ('')}><X size={18} color={colors.muted} /></Pressable> : null}
      </View>

      {!term ? (
        <>
          <T v="eyebrow" color={colors.muted} style={{ marginTop: 22, marginBottom: 10 }}>Popular</T>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            {popular.map((p) => <Chip key={p} label={p} onPress={() => setQ(p)} />)}
          </Row>
        </>
      ) : null}

      {svc.length ? (
        <>
          <T v="eyebrow" color={colors.muted} style={styles.h}>Services</T>
          {svc.map((s) => (
            <Pressable key={s.slug} onPress={() => openService(router, s)} style={styles.row}>
              <IconTile tone={s.tone} size={38}><Icon name={s.icon} size={26} color={tones[s.tone].fg} /></IconTile>
              <T v="title" style={{ flex: 1 }}>{s.name}</T>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          ))}
        </>
      ) : null}

      {vetHits.length ? (
        <>
          <T v="eyebrow" color={colors.muted} style={styles.h}>Vets</T>
          {vetHits.map((v) => (
            <Pressable key={v.id} onPress={() => router.push({ pathname: '/vet/[id]', params: { id: v.id } })} style={styles.row}>
              <PersonAvatar name={v.name} size={38} />
              <View style={{ flex: 1 }}>
                <T v="title">{v.name}</T>
                <T v="caption">{v.specialization} · {v.clinicName}</T>
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          ))}
        </>
      ) : null}

      {prodHits.length ? (
        <>
          <T v="eyebrow" color={colors.muted} style={styles.h}>Products</T>
          {prodHits.map((p) => (
            <Pressable key={p.id} onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })} style={styles.row}>
              <View style={{ width: 38 }}><ProductArt product={p} height={38} rounded={10} /></View>
              <View style={{ flex: 1 }}>
                <T v="title" numberOfLines={1}>{p.name}</T>
                <T v="caption">{p.brand}</T>
              </View>
              <T v="smallStrong">{inr(p.price)}</T>
            </Pressable>
          ))}
        </>
      ) : null}

      {none ? <T v="body" center style={{ marginTop: 32 }}>No results for “{q}”. Try “vet” or “food”.</T> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.brand300, paddingHorizontal: 16 },
  input: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.ink, paddingVertical: 13 },
  h: { marginTop: 22, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
});

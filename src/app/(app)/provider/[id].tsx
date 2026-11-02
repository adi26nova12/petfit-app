import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Clock, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as api from '@/api';
import type { Package } from '@/api/types';
import { PersonAvatar, Verified } from '@/components/blocks';
import { Button, Card, EmptyState, Loading, Pill, Rating, Row, Screen, T, TopBar, tap } from '@/components/ui';
import { discountPct, inr } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { colors, radius } from '@/theme';

function PackageRow({ pkg, selected, onPress }: { pkg: Package; selected: boolean; onPress: () => void }) {
  const off = discountPct(pkg.price, pkg.mrp);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[styles.pkg, selected && styles.pkgOn]}>
      <View style={[styles.radio, selected && { backgroundColor: colors.brand600, borderColor: colors.brand600 }]}>
        {selected ? <Check size={13} color={colors.white} strokeWidth={3} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <T v="title">{pkg.name}</T>
        {pkg.details.map((d) => <T key={d} v="small">· {d}</T>)}
        {pkg.durationMins ? (
          <Row gap={4} style={{ marginTop: 4 }}>
            <Clock size={12} color={colors.muted} />
            <T v="caption">{pkg.durationMins} min</T>
          </Row>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <T v="title">{inr(pkg.price)}</T>
        {off ? <T v="caption" style={{ textDecorationLine: 'line-through' }}>{inr(pkg.mrp)}</T> : null}
        {off ? <T v="caption" color={colors.teal} style={{ fontFamily: 'Figtree_700Bold' }}>{off}% off</T> : null}
      </View>
    </Pressable>
  );
}

export default function ProviderDetail() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: provider, loading } = useApi(() => api.getProvider(id), [id]);
  const [picked, setPicked] = useState<string | null>(null);

  if (loading) return <Screen><TopBar /><Loading rows={3} h={140} /></Screen>;
  if (!provider) return <Screen><TopBar /><EmptyState title="Provider not found" /></Screen>;

  const groups = [...new Set(provider.packages.map((p) => p.group ?? 'Packages'))];
  const pkg = provider.packages.find((p) => p.id === picked) ?? null;

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View style={{ flex: 1 }}>
            <T v="caption" numberOfLines={1}>{pkg ? pkg.name : 'Choose a package'}</T>
            <T v="h2">{pkg ? inr(pkg.price) : '—'}</T>
          </View>
          <Button
            label="Pick a slot"
            size="lg"
            disabled={!pkg}
            onPress={() => {
              if (pkg) router.push({ pathname: '/book', params: { kind: 'provider', id: provider.id, packageId: pkg.id } });
            }}
          />
        </Row>
      }>
      <TopBar title={provider.businessName} />
      <Card>
        <Row gap={14} align="flex-start">
          <PersonAvatar name={provider.name} size={68} url={provider.avatarUrl} />
          <View style={{ flex: 1 }}>
            <T v="h2">{provider.name}</T>
            <Row gap={4} style={{ marginTop: 2 }}>
              <MapPin size={13} color={colors.muted} />
              <T v="small">{provider.area}, {provider.city}</T>
            </Row>
            <Row gap={10} style={{ marginTop: 8, flexWrap: 'wrap' }}>
              <Rating value={provider.rating} reviews={provider.reviews} />
              {provider.verified ? <Verified /> : null}
            </Row>
          </View>
        </Row>
        <T v="body" style={{ marginTop: 14 }}>{provider.description}</T>
        <Row gap={6} style={{ marginTop: 12, flexWrap: 'wrap' }}>
          {provider.modes.includes('home') ? <Pill label="Comes to your home" tone="teal" /> : null}
          {provider.modes.includes('centre') ? <Pill label="Visit the centre" tone="purple" /> : null}
          {provider.experienceYears ? <Pill label={`${provider.experienceYears} yrs on the job`} tone="sand" /> : null}
        </Row>
      </Card>

      {groups.map((g) => (
        <View key={g}>
          <T v="eyebrow" color={colors.muted} style={{ marginTop: 24, marginBottom: 10 }}>{g}</T>
          <View style={{ gap: 10 }}>
            {provider.packages.filter((p) => (p.group ?? 'Packages') === g).map((p) => (
              <PackageRow key={p.id} pkg={p} selected={picked === p.id} onPress={() => setPicked(p.id)} />
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pkg: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  pkgOn: { borderColor: colors.brand600, backgroundColor: colors.brand50 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});

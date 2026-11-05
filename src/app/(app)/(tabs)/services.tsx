import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Search } from '@/components/doodles';
import { Icon } from '@/components/Icon';
import { Eyebrow, IconTile, Pill, Row, Screen, T } from '@/components/ui';
import { serviceGroups, services } from '@/data/services';
import { openService } from '@/lib/nav';
import { colors, radius, tones } from '@/theme';

export default function Services() {
  const router = useRouter();
  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginTop: 12 }}>
        <View>
          <Eyebrow>Everything your pet needs</Eyebrow>
          <T v="h1">Services</T>
        </View>
        <Pressable accessibilityLabel="Search" onPress={() => router.push('/search')} style={styles.searchBtn}>
          <Search size={20} color={colors.ink} />
        </Pressable>
      </Row>

      {serviceGroups.map((group) => (
        <View key={group} style={{ marginTop: 24 }}>
          <T v="eyebrow" color={colors.muted} style={{ marginBottom: 10 }}>{group}</T>
          <View style={styles.group}>
            {services.filter((s) => s.group === group).map((s, i) => (
              <Pressable
                key={s.slug}
                onPress={() => openService(router, s)}
                style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { backgroundColor: colors.brand50 }]}>
                <IconTile tone={s.tone} size={44}>
                  <Icon name={s.icon} size={30} color={tones[s.tone].fg} />
                </IconTile>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Row gap={8}>
                    <T v="title" numberOfLines={1} style={{ flexShrink: 1 }}>{s.name}</T>
                    {s.listing.kind === 'waitlist' ? <Pill label="Soon" tone="sand" /> : null}
                  </Row>
                  <T v="small" numberOfLines={2}>{s.promise}</T>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  group: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
});

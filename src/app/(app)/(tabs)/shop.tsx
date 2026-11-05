import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, TextInput, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart, Search, ShoppingCart } from '@/components/doodles';
import * as api from '@/api';
import type { ProductCategory } from '@/api/types';
import { ProductCard } from '@/components/blocks';
import { Chip, ChipRow, EmptyState, Eyebrow, IconButton, Loading, Row, T } from '@/components/ui';
import { useApi } from '@/lib/useApi';
import { useStore } from '@/store/app';
import { colors, fonts, radius, space } from '@/theme';

const categories: { key: ProductCategory | 'all' | 'wishlist'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'food', label: 'Food' },
  { key: 'treats', label: 'Treats' },
  { key: 'toys', label: 'Toys' },
  { key: 'apparel', label: 'Apparel' },
  { key: 'beds', label: 'Beds & bowls' },
  { key: 'walk', label: 'Leashes' },
  { key: 'wishlist', label: 'Wishlist' },
];
type CategoryKey = (typeof categories)[number]['key'];

export default function Shop() {
  const { cat } = useLocalSearchParams<{ cat?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, cartCount, activePet } = useStore();
  // A deep link (?cat=food from Home / Services) picks the shelf until the user taps another chip.
  const [picked, setPicked] = useState<{ cat?: string; value: CategoryKey } | null>(null);
  const fromLink = categories.find((c) => c.key === cat)?.key ?? 'all';
  const category = picked && picked.cat === cat ? picked.value : fromLink;
  const setCategory = (value: CategoryKey) => setPicked({ cat, value });
  const [species, setSpecies] = useState<'all' | 'dog' | 'cat'>('all');
  const [q, setQ] = useState('');

  const { data, loading } = useApi(
    () => api.getProducts({ category: category === 'all' || category === 'wishlist' ? undefined : category, species: species === 'all' ? undefined : species, q }),
    [category, species, q],
  );
  const list = (data ?? []).filter((p) => category !== 'wishlist' || state.wishlist.includes(p.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream, paddingTop: insets.top }}>
      <FlatList
        data={loading ? [] : list}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: space.gutter, paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 2 }}>
            <Row style={{ justifyContent: 'space-between', marginTop: 12 }}>
              <View>
                <Eyebrow>Food, treats & more</Eyebrow>
                <T v="h1">Shop</T>
              </View>
              <IconButton label="Cart" badge={cartCount} onPress={() => router.push('/cart')}>
                <ShoppingCart size={20} color={colors.ink} />
              </IconButton>
            </Row>
            <View style={styles.search}>
              <Search size={18} color={colors.muted} />
              <TextInput value={q} onChangeText={setQ} placeholder="Search food, toys, brands" placeholderTextColor={colors.muted} style={styles.input} returnKeyType="search" />
            </View>
            <ChipRow>
              {categories.map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  selected={category === c.key}
                  onPress={() => setCategory(c.key)}
                  icon={c.key === 'wishlist' ? <Heart size={14} color={category === c.key ? colors.white : colors.danger} /> : undefined}
                />
              ))}
            </ChipRow>
            <Row gap={8}>
              {(['all', 'dog', 'cat'] as const).map((s) => (
                <Chip key={s} label={s === 'all' ? 'All pets' : s === 'dog' ? 'Dogs' : 'Cats'} selected={species === s} onPress={() => setSpecies(s)} />
              ))}
            </Row>
            {activePet && species === 'all' && category === 'all' && !q ? (
              <T v="small">Showing everything. Tap <T v="smallStrong">{activePet.species === 'cat' ? 'Cats' : 'Dogs'}</T> to see what fits {activePet.name}.</T>
            ) : null}
            {loading ? <Loading rows={2} h={230} /> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState
              title={category === 'wishlist' ? 'Your wishlist is empty' : 'Nothing matches'}
              body={category === 'wishlist' ? 'Tap the heart on any product to save it here.' : 'Try another search or shelf.'}
            />
          )
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.lineStrong, paddingHorizontal: 16 },
  input: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink, paddingVertical: 12 },
});

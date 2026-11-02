import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { House, LayoutGrid, ShoppingBag, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetAvatar } from '@/components/blocks';
import { tap } from '@/components/ui';
import { useStore } from '@/store/app';
import { colors, fonts } from '@/theme';

const icons = { home: House, services: LayoutGrid, shop: ShoppingBag, account: UserRound } as const;
const labels: Record<string, string> = { home: 'Home', services: 'Services', pets: 'My pet', shop: 'Shop', account: 'Account' };

function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { activePet, cartCount } = useStore();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const color = focused ? colors.brand600 : colors.muted;
        const onPress = () => {
          const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) {
            tap();
            navigateToTab(route.key);
          }
        };
        const Icon = icons[route.name as keyof typeof icons];
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={labels[route.name]} onPress={onPress} style={styles.item}>
            {route.name === 'pets' ? (
              <View style={[styles.petBubble, focused && { borderColor: colors.brand600 }]}>
                {activePet ? <PetAvatar pet={activePet} size={36} /> : null}
              </View>
            ) : (
              <View style={[styles.iconWrap, focused && { backgroundColor: colors.brand100 }]}>
                <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
                {route.name === 'shop' && cartCount > 0 ? (
                  <View style={styles.dot}>
                    <Text style={styles.dotText}>{cartCount}</Text>
                  </View>
                ) : null}
              </View>
            )}
            <Text style={[styles.label, { color, fontFamily: focused ? fonts.bodyBold : fonts.bodySemi }]}>{labels[route.name]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.cream } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="pets" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineStrong,
    paddingTop: 8,
    shadowColor: colors.brand900,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: { width: 52, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  petBubble: {
    marginTop: -22,
    width: 54,
    height: 54,
    borderRadius: 20,
    padding: 3,
    backgroundColor: colors.amber,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11 },
  dot: {
    position: 'absolute',
    top: -2,
    right: 6,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.ink },
});

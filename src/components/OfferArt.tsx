/**
 * Pet-themed 3D category icons for the Home "All in one app" grid.
 * Generated as one sheet in the brand palette and sliced into assets/icons/*.png (240px, transparent).
 */
import { Image } from 'expo-image';

const art = {
  Health: require('@/assets/icons/health.png'),
  Care: require('@/assets/icons/care.png'),
  Food: require('@/assets/icons/food.png'),
  Products: require('@/assets/icons/products.png'),
  Travel: require('@/assets/icons/travel.png'),
  Protect: require('@/assets/icons/protect.png'),
} as const;
export type OfferArtName = keyof typeof art;

export function OfferArt({ name, size = 56 }: { name: OfferArtName; size?: number }) {
  return <Image source={art[name]} style={{ width: size, height: size }} contentFit="contain" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}

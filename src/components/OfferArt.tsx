/** Category doodles for the Home "All in one app" grid. */
import { Doodle, type DoodleName } from './doodles';

const art = {
  Health: 'stethoscope',
  Care: 'scissors',
  Food: 'food-bowl',
  Products: 'shopping-bag',
  Travel: 'train',
  Protect: 'shield',
} as const satisfies Record<string, DoodleName>;
export type OfferArtName = keyof typeof art;

export function OfferArt({ name, size = 56 }: { name: OfferArtName; size?: number }) {
  return <Doodle name={art[name]} size={size} />;
}

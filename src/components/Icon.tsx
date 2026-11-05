import { Doodle, type DoodleName } from './doodles';

/** Service icons referenced by name in `data/services.ts` (same names as the web catalogue), drawn as doodles. */
const map: Record<string, DoodleName> = {
  Bone: 'food-bowl',
  FileCheck2: 'file-check',
  FlaskConical: 'flask',
  Flower2: 'flower',
  HeartPulse: 'heart-pulse',
  House: 'doghouse',
  LifeBuoy: 'lifebuoy',
  PartyPopper: 'party',
  Pill: 'pill',
  Scissors: 'scissors',
  ShieldCheck: 'shield',
  ShoppingBag: 'shopping-bag',
  Stethoscope: 'stethoscope',
  Syringe: 'syringe',
  TrainFront: 'train',
};

export function Icon({ name, size = 22 }: { name: string; size?: number; color?: string; strokeWidth?: number }) {
  return <Doodle name={map[name] ?? 'paw'} size={size} />;
}

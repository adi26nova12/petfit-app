import {
  Bone,
  FileCheck2,
  FlaskConical,
  Flower2,
  HeartPulse,
  House,
  LifeBuoy,
  PartyPopper,
  PawPrint,
  Pill,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Syringe,
  TrainFront,
  type LucideIcon,
} from 'lucide-react-native';

/** Service icons referenced by name in `data/services.ts` (same names as the web catalogue). */
const map: Record<string, LucideIcon> = {
  Bone,
  FileCheck2,
  FlaskConical,
  Flower2,
  HeartPulse,
  House,
  LifeBuoy,
  PartyPopper,
  Pill,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Syringe,
  TrainFront,
};

export function Icon({ name, size = 22, color, strokeWidth = 2 }: { name: string; size?: number; color: string; strokeWidth?: number }) {
  const C = map[name] ?? PawPrint;
  return <C size={size} color={color} strokeWidth={strokeWidth} />;
}

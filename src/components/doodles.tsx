/**
 * Hand-drawn doodle icons (assets/doodles/*.png, 192px, transparent), generated in the brand palette.
 * Each lucide icon the app used is re-exported here under the same name, so screens swap icon sets
 * by import path alone. Tiny controls (chevrons, +/-, close, ticks, rating star) stay as lucide vectors.
 */
import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

const sources = {
  'award': require('@/assets/doodles/award.png'),
  'ball': require('@/assets/doodles/ball.png'),
  'bandage': require('@/assets/doodles/bandage.png'),
  'bandana': require('@/assets/doodles/bandana.png'),
  'bed': require('@/assets/doodles/bed.png'),
  'bell': require('@/assets/doodles/bell.png'),
  'bone': require('@/assets/doodles/bone.png'),
  'building': require('@/assets/doodles/building.png'),
  'calendar': require('@/assets/doodles/calendar.png'),
  'camera': require('@/assets/doodles/camera.png'),
  'cart': require('@/assets/doodles/cart.png'),
  'cash': require('@/assets/doodles/cash.png'),
  'cat': require('@/assets/doodles/cat.png'),
  'chat': require('@/assets/doodles/chat.png'),
  'check-circle': require('@/assets/doodles/check-circle.png'),
  'clock': require('@/assets/doodles/clock.png'),
  'credit-card': require('@/assets/doodles/credit-card.png'),
  'document': require('@/assets/doodles/document.png'),
  'dog': require('@/assets/doodles/dog.png'),
  'doghouse': require('@/assets/doodles/doghouse.png'),
  'droplet': require('@/assets/doodles/droplet.png'),
  'file-check': require('@/assets/doodles/file-check.png'),
  'flame': require('@/assets/doodles/flame.png'),
  'flask': require('@/assets/doodles/flask.png'),
  'flower': require('@/assets/doodles/flower.png'),
  'food-bowl': require('@/assets/doodles/food-bowl.png'),
  'grid': require('@/assets/doodles/grid.png'),
  'heart': require('@/assets/doodles/heart.png'),
  'heart-pulse': require('@/assets/doodles/heart-pulse.png'),
  'help': require('@/assets/doodles/help.png'),
  'house': require('@/assets/doodles/house.png'),
  'languages': require('@/assets/doodles/languages.png'),
  'leash': require('@/assets/doodles/leash.png'),
  'lifebuoy': require('@/assets/doodles/lifebuoy.png'),
  'locate': require('@/assets/doodles/locate.png'),
  'logout': require('@/assets/doodles/logout.png'),
  'mail': require('@/assets/doodles/mail.png'),
  'map-pin': require('@/assets/doodles/map-pin.png'),
  'package': require('@/assets/doodles/package.png'),
  'party': require('@/assets/doodles/party.png'),
  'paw': require('@/assets/doodles/paw.png'),
  'pencil': require('@/assets/doodles/pencil.png'),
  'phone': require('@/assets/doodles/phone.png'),
  'pill': require('@/assets/doodles/pill.png'),
  'plane': require('@/assets/doodles/plane.png'),
  'return': require('@/assets/doodles/return.png'),
  'scale': require('@/assets/doodles/scale.png'),
  'scissors': require('@/assets/doodles/scissors.png'),
  'search': require('@/assets/doodles/search.png'),
  'shield': require('@/assets/doodles/shield.png'),
  'shopping-bag': require('@/assets/doodles/shopping-bag.png'),
  'smartphone': require('@/assets/doodles/smartphone.png'),
  'sparkles': require('@/assets/doodles/sparkles.png'),
  'stethoscope': require('@/assets/doodles/stethoscope.png'),
  'syringe': require('@/assets/doodles/syringe.png'),
  'tag': require('@/assets/doodles/tag.png'),
  'train': require('@/assets/doodles/train.png'),
  'treat': require('@/assets/doodles/treat.png'),
  'truck': require('@/assets/doodles/truck.png'),
  'upload': require('@/assets/doodles/upload.png'),
  'user': require('@/assets/doodles/user.png'),
  'verified': require('@/assets/doodles/verified.png'),
  'video': require('@/assets/doodles/video.png'),
  'warning': require('@/assets/doodles/warning.png'),
} as const;
export type DoodleName = keyof typeof sources;

type DoodleProps = {
  size?: number;
  /** Faded look for inactive states (unselected tab, un-wished heart). */
  dim?: boolean;
  style?: StyleProp<ImageStyle>;
  /** Accepted for lucide compatibility; doodles keep their own colours. */
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

/** Doodles carry sparkle accents around the object, so they draw a touch larger than their layout box. */
const BLEED = 0.14;

export function Doodle({ name, size = 24, dim, style }: DoodleProps & { name: DoodleName }) {
  const drawn = size * (1 + BLEED);
  return (
    <Image
      source={sources[name]}
      style={[{ width: drawn, height: drawn, margin: (size - drawn) / 2, opacity: dim ? 0.38 : 1 }, style]}
      contentFit="contain"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const make = (name: DoodleName) => {
  const Icon = (props: DoodleProps) => <Doodle name={name} {...props} />;
  Icon.displayName = `Doodle(${name})`;
  return Icon;
};
export type DoodleIcon = ReturnType<typeof make>;

export const Award = make('award');
export const BadgeCheck = make('verified');
export const Banknote = make('cash');
export const Bed = make('bed');
export const Bell = make('bell');
export const Bone = make('food-bowl');
export const Building2 = make('building');
export const CalendarCheck = make('calendar');
export const CalendarClock = make('calendar');
export const Camera = make('camera');
export const CircleCheck = make('check-circle');
export const CircleHelp = make('help');
export const Clock = make('clock');
export const Cookie = make('treat');
export const CreditCard = make('credit-card');
export const Droplet = make('droplet');
export const FileCheck2 = make('file-check');
export const FileText = make('document');
export const Flame = make('flame');
export const FlaskConical = make('flask');
export const Flower2 = make('flower');
export const Footprints = make('leash');
export const Heart = make('heart');
export const HeartPulse = make('heart-pulse');
export const House = make('house');
export const Languages = make('languages');
export const LayoutGrid = make('grid');
export const LifeBuoy = make('lifebuoy');
export const LocateFixed = make('locate');
export const LogOut = make('logout');
export const Mail = make('mail');
export const MapPin = make('map-pin');
export const MessageCircle = make('chat');
export const Package = make('package');
export const PackageCheck = make('package');
export const PartyPopper = make('party');
export const PawPrint = make('paw');
export const Pencil = make('pencil');
export const Phone = make('phone');
export const Pill = make('pill');
export const Plane = make('plane');
export const RotateCcw = make('return');
export const Scale = make('scale');
export const Scissors = make('scissors');
export const Search = make('search');
export const ShieldCheck = make('shield');
export const Shirt = make('bandana');
export const ShoppingBag = make('shopping-bag');
export const ShoppingCart = make('cart');
export const Smartphone = make('smartphone');
export const Sparkles = make('sparkles');
export const Stethoscope = make('stethoscope');
export const Store = make('building');
export const Syringe = make('syringe');
export const Tag = make('tag');
export const ToyBrick = make('ball');
export const TrainFront = make('train');
export const TriangleAlert = make('warning');
export const Truck = make('truck');
export const Upload = make('upload');
export const UserRound = make('user');
export const Video = make('video');

/**
 * Home carousel slides (marketing campaigns). Order here is the order on screen.
 * Each slide points at a real screen; keep the copy to promises the app actually keeps.
 */
import type { Href } from 'expo-router';

import type { DoodleName } from '@/components/doodles';
import { colors } from '@/theme';

export type Campaign = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: Href;
  bg: string;
  /** Text colour on `bg`. */
  ink: string;
  /** Eyebrow / CTA accent on `bg`. */
  accent: string;
  /** 'mascots' shows Luna & Pip peeking; otherwise a doodle. */
  art: 'mascots' | DoodleName;
};

export const campaigns: Campaign[] = [
  {
    id: 'zero-fee',
    eyebrow: 'Pet parents pay',
    title: '₹0 booking fee',
    body: 'You pay the price on the card. Always.',
    cta: 'Book a service',
    href: '/services',
    bg: colors.amber,
    ink: colors.ink,
    accent: colors.amberInk,
    art: 'mascots',
  },
  {
    id: 'vaccines-home',
    eyebrow: 'Never miss a shot',
    title: 'Vaccines at home',
    body: "Book a home visit. We'll remind you when the next one is due.",
    cta: 'Book vaccination',
    href: { pathname: '/service/[slug]', params: { slug: 'vaccination' } },
    bg: colors.teal,
    ink: colors.white,
    accent: colors.tealSoft,
    art: 'syringe',
  },
  {
    id: 'free-delivery',
    eyebrow: 'PetFit shop',
    title: 'Free delivery over ₹999',
    body: 'Food, treats, toys and beds, delivered to your door.',
    cta: 'Shop now',
    href: '/shop',
    bg: colors.brand700,
    ink: colors.white,
    accent: colors.amber,
    art: 'truck',
  },
  {
    id: 'rescue',
    eyebrow: 'Animal in distress?',
    title: 'Report a rescue',
    body: 'Share the location and PetFit assigns a nearby rescuer.',
    cta: 'Report now',
    href: { pathname: '/service/[slug]', params: { slug: 'pet-rescue' } },
    bg: colors.blush,
    ink: colors.ink,
    accent: colors.blushInk,
    art: 'lifebuoy',
  },
];

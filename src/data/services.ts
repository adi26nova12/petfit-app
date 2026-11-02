/**
 * Service catalogue — ported from the web app's `src/data/services.ts` so both
 * surfaces describe every service with the same words and the same honesty rules:
 * services with no live supply (pharmacy, after-care) or `availability: "waitlist"`
 * (insurance) show "Coming soon" and a waitlist, never listings.
 */
import type { ServiceGroup } from '@/api/types';
import type { Tone } from '@/theme';

export type ServiceListing =
  | { kind: 'vets' }
  | { kind: 'providers'; serviceType: string }
  | { kind: 'rescue' }
  | { kind: 'shop'; category?: string }
  | { kind: 'tool'; tool: string }
  | { kind: 'waitlist' };

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  group: ServiceGroup;
  /** lucide icon name, resolved in components/Icon. */
  icon: string;
  tone: Tone;
  promise: string;
  intro: string;
  included: { title: string; body: string }[];
  profileStep: string;
  listing: ServiceListing;
  priceUnit?: string;
};

export const services: Service[] = [
  {
    slug: 'vets',
    name: 'Vets & teleconsult',
    shortName: 'Vets',
    group: 'Health',
    icon: 'Stethoscope',
    tone: 'teal',
    promise: 'Verified vets with clear prices and live slots.',
    intro:
      "Find a verified veterinarian near you, compare clinic-visit and teleconsult prices up front, and book a slot in a few taps. After the visit, notes and prescriptions go straight into your pet's profile.",
    included: [
      { title: 'Clinic visit or teleconsult', body: "Both prices are shown on every vet's card before you book." },
      { title: 'Specialists, not just GPs', body: 'Dermatology, cardiology, behaviour, surgery and integrative care.' },
      { title: 'Verified before listing', body: "Every vet's licence and clinic are checked before they go live." },
    ],
    profileStep: "The consultation, the vet's notes and any digital prescription are saved to your pet's health timeline and vault.",
    listing: { kind: 'vets' },
    priceUnit: 'per consultation',
  },
  {
    slug: 'diagnostics',
    name: 'Diagnostics & lab tests',
    shortName: 'Lab tests',
    group: 'Health',
    icon: 'FlaskConical',
    tone: 'purple',
    promise: 'Screening packages for every life stage, collected at home.',
    intro:
      "From a puppy's first screening to a senior full-body check, book lab tests and wellness packages with transparent MRP and discounted prices. Reports land in your pet's vault.",
    included: [
      { title: 'Wellness packages by life stage', body: 'Puppy screening, adult full body and senior (7+) full body.' },
      { title: 'Home sample collection', body: 'Your pet skips the stressful clinic trip.' },
      { title: 'Reports in the vault', body: "Labs upload reports directly into your pet's digital vault." },
    ],
    profileStep: "The lab uploads the report into your pet's vault, next to their vaccinations and prescriptions.",
    listing: { kind: 'providers', serviceType: 'labs' },
    priceUnit: 'per package',
  },
  {
    slug: 'vaccination',
    name: 'Vaccination',
    shortName: 'Vaccines',
    group: 'Health',
    icon: 'Syringe',
    tone: 'amber',
    promise: "Book the shot. We'll remember when the next one is due.",
    intro:
      "Book core and optional vaccines for dogs and cats with verified providers. Each completed shot is added to your pet's vaccination timeline with the next due date.",
    included: [
      { title: 'Dog vaccines', body: 'DHPPi/L, 9-in-1, anti-rabies, kennel cough, canine corona and puppy DP.' },
      { title: 'Cat vaccines', body: 'Tri-cat and CRP, plus anti-rabies.' },
      { title: 'Anti-tick injections', body: 'Priced by weight band so you know the cost before you book.' },
    ],
    profileStep: "The vaccination is added to your pet's timeline automatically, with a reminder for the next due date.",
    listing: { kind: 'providers', serviceType: 'vaccination' },
    priceUnit: 'per dose',
  },
  {
    slug: 'sterilisation',
    name: 'Sterilisation',
    shortName: 'Sterilisation',
    group: 'Health',
    icon: 'HeartPulse',
    tone: 'blush',
    promise: 'Transparent sterilisation packages for dogs and cats.',
    intro:
      "Compare spay and neuter packages by species and weight band, book with a verified provider, and have the procedure recorded on your pet's health timeline.",
    included: [
      { title: 'Dogs by weight band', body: 'Small, medium, large and giant — each with its own price.' },
      { title: 'Cats', body: 'Separate packages for male (tom) and female (molly) cats.' },
    ],
    profileStep: "The sterilisation is recorded on your pet's health timeline.",
    listing: { kind: 'providers', serviceType: 'sterilisation' },
    priceUnit: 'per package',
  },
  {
    slug: 'pharmacy',
    name: 'Pharmacy',
    shortName: 'Pharmacy',
    group: 'Health',
    icon: 'Pill',
    tone: 'teal',
    promise: "Medicines and health essentials, linked to your pet's prescriptions.",
    intro:
      "We're stocking the pharmacy now. Join the waitlist and we'll tell you when it opens in your city.",
    included: [
      { title: 'Filter by pet, category and brand', body: 'Find the right product for the right pet.' },
      { title: 'Linked to prescriptions', body: 'Digital prescriptions from PetFit vets live in your pet\'s vault.' },
    ],
    profileStep: "Prescriptions stay in your pet's vault, so re-ordering is simple.",
    listing: { kind: 'waitlist' },
  },
  {
    slug: 'grooming',
    name: 'Grooming',
    shortName: 'Grooming',
    group: 'Care',
    icon: 'Scissors',
    tone: 'blush',
    promise: 'Salon and at-home grooming with prices on every package.',
    intro:
      'Book verified groomers for everything from a quick bath to a full haircut, at a salon or at your doorstep. Every package shows its price, so there are no surprises.',
    included: [
      { title: 'Bath & spa', body: 'Bath and blow dry, aromatherapy baths and complete bath packages.' },
      { title: 'Hygiene and coat care', body: 'Nail clipping, ear and eye cleaning, de-matting and de-shedding.' },
      { title: 'At home or at the salon', body: 'Some groomers come to you, including van-based doorstep grooming.' },
    ],
    profileStep: 'Your grooming bookings and history are kept alongside your pet\'s profile.',
    listing: { kind: 'providers', serviceType: 'grooming' },
    priceUnit: 'per service',
  },
  {
    slug: 'daycare-boarding',
    name: 'Daycare & boarding',
    shortName: 'Boarding',
    group: 'Care',
    icon: 'House',
    tone: 'purple',
    promise: 'Supervised daycare, boarding and pet resorts from verified partners.',
    intro:
      'Going to work, travelling or away for a wedding? Book supervised daycare or boarding with verified partners. Some partners share daily progress notes.',
    included: [
      { title: 'Daycare', body: "Supervised play, rest windows and care while you're at work." },
      { title: 'Boarding', body: 'Standard, luxury and medical boarding, with options for cats and rabbits too.' },
      { title: 'Daily updates', body: 'Some partners send daily progress notes to pet parents.' },
    ],
    profileStep: "Your pet's vaccination records are already in the vault — ready for boarding check-in.",
    listing: { kind: 'providers', serviceType: 'daycare' },
    priceUnit: 'per day',
  },
  {
    slug: 'pet-cremation',
    name: 'Cremation & after-care',
    shortName: 'After-care',
    group: 'Care',
    icon: 'Flower2',
    tone: 'sand',
    promise: 'Gentle, respectful after-care when you need it most.',
    intro:
      "Saying goodbye is hard. PetFit is bringing respectful after-care partners onto the platform. Leave your details and we'll let you know when a partner is available in your city.",
    included: [{ title: 'Respectful cremation services', body: 'From verified after-care partners.' }],
    profileStep: "Your pet's profile and records remain in your account as long as you want them.",
    listing: { kind: 'waitlist' },
  },
  {
    slug: 'food',
    name: 'Pet food & treats',
    shortName: 'Food',
    group: 'Shop',
    icon: 'Bone',
    tone: 'amber',
    promise: 'Dry, wet and fresh food, treats and chews.',
    intro: 'Shop food and treats for every life stage, delivered to your door.',
    included: [],
    profileStep: 'Orders are saved to your account so re-ordering is one tap.',
    listing: { kind: 'shop', category: 'food' },
  },
  {
    slug: 'products',
    name: 'Toys, apparel & more',
    shortName: 'Products',
    group: 'Shop',
    icon: 'ShoppingBag',
    tone: 'purple',
    promise: 'Toys, apparel, beds, bowls and leashes.',
    intro: 'From festive bandanas to beds, bowls and leashes. Clear prices, a wishlist and a cart.',
    included: [],
    profileStep: 'Orders are saved to your account so re-ordering is one tap.',
    listing: { kind: 'shop' },
  },
  {
    slug: 'pet-travel',
    name: 'Pet travel',
    shortName: 'Travel',
    group: 'Life & Travel',
    icon: 'TrainFront',
    tone: 'teal',
    promise: 'Expert help with Indian Railways pet rules, cabins and paperwork.',
    intro:
      "Travelling by train with a pet means rules, first-AC cabin requests and paperwork. PetFit's travel assistance walks you through it — from consultation to journey planning.",
    included: [
      { title: 'Train travel consultation', body: 'Understand Indian Railways pet rules for your route.' },
      { title: '1st AC coupe / cabin request', body: 'Help requesting a coupe so your pet can travel with you.' },
      { title: 'Documentation & journey planning', body: "Guidance on the documents you'll need." },
    ],
    profileStep: "Vaccination and health records needed for travel are already in your pet's vault.",
    listing: { kind: 'providers', serviceType: 'travel' },
    priceUnit: 'per package',
  },
  {
    slug: 'celebrations',
    name: 'Celebrations',
    shortName: 'Parties',
    group: 'Life & Travel',
    icon: 'PartyPopper',
    tone: 'amber',
    promise: 'Birthdays, gotcha days and milestones, done properly.',
    intro:
      'Plan a birthday, adoption anniversary or milestone with verified celebration partners — backdrops, balloon décor, cakes, hosts and photography.',
    included: [
      { title: 'Décor & backdrops', body: 'Personalised backdrops, balloon décor and photo-op standees.' },
      { title: 'Cakes, hosts & photography', body: 'Everything for the day, from verified partners.' },
    ],
    profileStep: "Milestones become part of your pet's story on PetFit.",
    listing: { kind: 'providers', serviceType: 'celebrations' },
    priceUnit: 'per package',
  },
  {
    slug: 'pet-insurance',
    name: 'Pet insurance',
    shortName: 'Insurance',
    group: 'Protect',
    icon: 'ShieldCheck',
    tone: 'purple',
    promise: 'Compare plans side by side and apply using records you already have.',
    intro:
      "We're building pet insurance into PetFit: compare plans on benefits, exclusions and sum insured, and apply using documents already in your pet's vault. Join the waitlist to hear first.",
    included: [
      { title: 'Compare plans', body: 'Benefits, exclusions and sum insured, side by side.' },
      { title: 'Apply with your vault', body: "Upload documents from your pet's vault and track your application." },
    ],
    profileStep: "Your pet's health records are already organised for applications and claims.",
    listing: { kind: 'waitlist' },
  },
  {
    slug: 'pet-rescue',
    name: 'Pet rescue',
    shortName: 'Rescue',
    group: 'Protect',
    icon: 'LifeBuoy',
    tone: 'blush',
    promise: 'Report an animal in distress. PetFit assigns a nearby rescuer.',
    intro:
      'See an injured or stranded animal? Share the location, what happened and a photo if you can. PetFit assigns a nearby rescuer and you can track your request.',
    included: [],
    profileStep: 'Your rescue requests and their status stay in your PetFit account.',
    listing: { kind: 'rescue' },
  },
  {
    slug: 'registration',
    name: 'Registration & compliance',
    shortName: 'Registration',
    group: 'Protect',
    icon: 'FileCheck2',
    tone: 'sand',
    promise: 'Municipal pet licence rules and documents for your city.',
    intro: 'Know what your city needs for a pet licence, with the documents already in your vault.',
    included: [],
    profileStep: 'Your anti-rabies certificate is ready in the vault for the application.',
    listing: { kind: 'waitlist' },
  },
];

export const serviceGroups: ServiceGroup[] = ['Health', 'Care', 'Shop', 'Life & Travel', 'Protect'];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

/** The six offer tiles on Home, as on the web hero ("All in one app"). */
export const homeOffer = [
  { name: 'Health', items: 'Vets, labs, vaccines', icon: 'Stethoscope', slug: 'vets', tone: 'teal' },
  { name: 'Care', items: 'Grooming, boarding', icon: 'Scissors', slug: 'grooming', tone: 'blush' },
  { name: 'Food', items: 'Dry, wet, fresh, treats', icon: 'Bone', slug: 'food', tone: 'amber' },
  { name: 'Products', items: 'Toys, beds, leashes', icon: 'ShoppingBag', slug: 'products', tone: 'purple' },
  { name: 'Travel', items: 'Trains, parties', icon: 'TrainFront', slug: 'pet-travel', tone: 'teal' },
  { name: 'Protect', items: 'Insurance, rescue', icon: 'ShieldCheck', slug: 'pet-rescue', tone: 'sand' },
] as const;

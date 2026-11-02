/**
 * Demo data so every screen renders without a backend.
 * Nothing outside `src/api/` imports this file — when the real API is wired in,
 * delete it (or keep it for Storybook / screenshots).
 * Names and businesses here are fictional.
 */
import type {
  Address,
  AppNotification,
  Booking,
  Order,
  Pet,
  Product,
  Provider,
  User,
  Vaccination,
  VaultDoc,
  Vet,
  WeightEntry,
} from '@/api/types';
import { isoDay } from '@/lib/format';

/** Dates are relative to today so the demo never looks stale. */
const day = isoDay;

export const user: User = {
  id: 'u_1',
  name: 'Aditi Sharma',
  phone: '+91 98100 12345',
  email: 'aditi@example.com',
  city: 'Gurugram',
};

export const pets: Pet[] = [
  {
    id: 'p_pip',
    name: 'Pip',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    dob: '2023-03-14',
    weightKg: 28.4,
    sterilised: true,
    microchipId: '985 141 000 123 456',
    photo: 'demo:pip',
    healthScore: 86,
  },
  {
    id: 'p_luna',
    name: 'Luna',
    species: 'cat',
    breed: 'Indie Cat',
    gender: 'female',
    dob: '2022-08-02',
    weightKg: 4.1,
    sterilised: true,
    microchipId: null,
    photo: 'demo:luna',
    healthScore: 92,
  },
];

export const weights: WeightEntry[] = [
  ...[22.1, 24.0, 25.6, 26.9, 27.5, 28.0, 28.4].map((kg, i) => ({ petId: 'p_pip', date: day(-30 * (6 - i)), kg })),
  ...[3.6, 3.8, 3.9, 4.0, 4.1, 4.1, 4.1].map((kg, i) => ({ petId: 'p_luna', date: day(-30 * (6 - i)), kg })),
];

export const vaccinations: Vaccination[] = [
  { id: 'v1', petId: 'p_pip', name: 'Anti-rabies booster', givenOn: null, dueOn: day(12), provider: null },
  { id: 'v2', petId: 'p_pip', name: '9-in-1 (DHPPi/L)', givenOn: day(-40), dueOn: day(-40), provider: 'Paws & Claws Clinic' },
  { id: 'v3', petId: 'p_pip', name: 'Kennel cough', givenOn: null, dueOn: day(-3), provider: null },
  { id: 'v4', petId: 'p_pip', name: 'Canine corona', givenOn: day(-200), dueOn: day(-200), provider: 'Paws & Claws Clinic' },
  { id: 'v5', petId: 'p_luna', name: 'Tri-cat (FVRCP)', givenOn: day(-90), dueOn: day(-90), provider: 'Whiskers Vet Care' },
  { id: 'v6', petId: 'p_luna', name: 'Anti-rabies', givenOn: null, dueOn: day(45), provider: null },
];

export const vault: VaultDoc[] = [
  { id: 'd1', petId: 'p_pip', title: 'Full body checkup report', kind: 'lab', source: 'Uploaded by lab', date: day(-6), fileUrl: null },
  { id: 'd2', petId: 'p_pip', title: 'Prescription — skin care', kind: 'prescription', source: 'Digital prescription', date: day(-14), fileUrl: null },
  { id: 'd3', petId: 'p_pip', title: '9-in-1 vaccination card', kind: 'vaccination', source: 'Added to timeline', date: day(-40), fileUrl: null },
  { id: 'd4', petId: 'p_pip', title: 'Travel fitness certificate', kind: 'travel', source: 'You', date: day(-75), fileUrl: null },
  { id: 'd5', petId: 'p_luna', title: 'Blood report (CBC)', kind: 'lab', source: 'Uploaded by lab', date: day(-21), fileUrl: null },
  { id: 'd6', petId: 'p_luna', title: 'Tri-cat vaccination card', kind: 'vaccination', source: 'Added to timeline', date: day(-90), fileUrl: null },
];

export const vets: Vet[] = [
  {
    id: 'vet_1', name: 'Dr. Meera Kapoor', specialization: 'General practice', clinicName: 'Paws & Claws Clinic',
    city: 'Gurugram', area: 'Sector 56', consultationFee: 600, teleconsultationFee: 399, rating: 4.9, reviews: 312,
    experienceYears: 11, languages: ['English', 'Hindi'], verified: true, recommended: true, avatarUrl: null,
    about: 'Family vet with a soft spot for anxious rescues. Preventive care, vaccinations and nutrition plans.',
  },
  {
    id: 'vet_2', name: 'Dr. Arjun Rao', specialization: 'Dermatology', clinicName: 'SkinVet Specialty Centre',
    city: 'Gurugram', area: 'Golf Course Road', consultationFee: 900, teleconsultationFee: 599, rating: 4.8, reviews: 184,
    experienceYears: 9, languages: ['English', 'Hindi', 'Telugu'], verified: true, recommended: false, avatarUrl: null,
    about: 'Allergies, itchy skin, hot spots and ear infections — with diet trials that actually stick.',
  },
  {
    id: 'vet_3', name: 'Dr. Sana Qureshi', specialization: 'Feline medicine', clinicName: 'Whiskers Vet Care',
    city: 'New Delhi', area: 'Hauz Khas', consultationFee: 700, teleconsultationFee: 449, rating: 4.9, reviews: 221,
    experienceYears: 8, languages: ['English', 'Hindi', 'Urdu'], verified: true, recommended: true, avatarUrl: null,
    about: 'Cat-only clinic hours, fear-free handling and senior-cat wellness.',
  },
  {
    id: 'vet_4', name: 'Dr. Vikram Sethi', specialization: 'Orthopaedics & surgery', clinicName: 'Sethi Animal Hospital',
    city: 'Noida', area: 'Sector 18', consultationFee: 1000, teleconsultationFee: null, rating: 4.7, reviews: 96,
    experienceYears: 17, languages: ['English', 'Hindi', 'Punjabi'], verified: true, recommended: false, avatarUrl: null,
    about: 'Hip dysplasia, ligament repairs and post-op physiotherapy plans.',
  },
  {
    id: 'vet_5', name: 'Dr. Nikhil Menon', specialization: 'Behaviour', clinicName: 'Calm Tails',
    city: 'Gurugram', area: 'DLF Phase 4', consultationFee: 800, teleconsultationFee: 499, rating: 4.6, reviews: 58,
    experienceYears: 6, languages: ['English', 'Malayalam'], verified: true, recommended: false, avatarUrl: null,
    about: 'Separation anxiety, reactivity and puppy socialisation — teleconsult friendly.',
  },
];

const pkg = (id: string, name: string, price: number, mrp: number | null, details: string[], group: string | null = null, durationMins?: number) =>
  ({ id, name, price, mrp, details, group, durationMins });

export const providers: Provider[] = [
  {
    id: 'pr_groom1', name: 'Fluff & Fold Groomers', businessName: 'Fluff & Fold', serviceType: 'grooming',
    city: 'Gurugram', area: 'Sector 49', description: 'Golden retrievers are a favourite. Van-based doorstep grooming.',
    rating: 4.9, reviews: 402, experienceYears: 6, verified: true, recommended: true, modes: ['home', 'centre'], avatarUrl: null,
    packages: [
      pkg('g1', 'Bath + haircut', 1299, 1599, ['Nails, ears, blow-dry', 'Breed-specific trim'], 'Full groom', 120),
      pkg('g2', 'Bath & blow dry', 699, 849, ['Shampoo + conditioner', 'Blow dry & brush'], 'Bath & spa', 60),
      pkg('g3', 'Aromatherapy spa', 1099, null, ['Essential-oil bath', 'Paw massage'], 'Bath & spa', 75),
      pkg('g4', 'Nail clip + ear clean', 349, 399, ['Hygiene essentials'], 'Hygiene', 20),
    ],
  },
  {
    id: 'pr_groom2', name: 'The Pawlour', businessName: 'The Pawlour', serviceType: 'grooming',
    city: 'New Delhi', area: 'Greater Kailash', description: 'Calm salon with cat-friendly slots on weekday mornings.',
    rating: 4.7, reviews: 233, experienceYears: 4, verified: true, recommended: false, modes: ['centre'], avatarUrl: null,
    packages: [
      pkg('g5', 'Complete bath package', 899, 999, ['Bath, dry, brush', 'Nails & ears'], 'Bath & spa', 75),
      pkg('g6', 'De-shedding treatment', 1199, null, ['Undercoat removal', 'Coat conditioner'], 'Coat care', 90),
    ],
  },
  {
    id: 'pr_lab1', name: 'VetPath Diagnostics', businessName: 'VetPath', serviceType: 'labs',
    city: 'Gurugram', area: 'Udyog Vihar', description: 'NABL-accredited partner lab with home sample collection.',
    rating: 4.8, reviews: 140, experienceYears: 12, verified: true, recommended: true, modes: ['home', 'centre'], avatarUrl: null,
    packages: [
      pkg('l1', 'Puppy screening', 1199, 1799, ['CBC', 'Parasite screen', 'Liver & kidney basics'], 'Puppy'),
      pkg('l2', 'Adult full body', 2499, 3499, ['CBC', 'LFT + KFT', 'Thyroid (T4)', 'Urine routine'], 'Young / adult'),
      pkg('l3', 'Senior (7+) full body', 3299, 4599, ['Everything in adult', 'Cardiac marker', 'Electrolytes'], 'Senior'),
      pkg('l4', 'CBC only', 499, 650, ['Complete blood count'], 'Individual tests'),
    ],
  },
  {
    id: 'pr_vac1', name: 'Paws & Claws Clinic', businessName: 'Paws & Claws', serviceType: 'vaccination',
    city: 'Gurugram', area: 'Sector 56', description: 'Core and optional vaccines, with home visits on weekends.',
    rating: 4.9, reviews: 312, experienceYears: 11, verified: true, recommended: true, modes: ['home', 'centre'], avatarUrl: null,
    packages: [
      pkg('vc1', 'Anti-rabies', 450, null, ['Certificate included'], 'Dog'),
      pkg('vc2', '9-in-1 (DHPPi/L)', 950, 1100, ['Annual booster'], 'Dog'),
      pkg('vc3', 'Kennel cough', 750, null, ['Intranasal'], 'Dog'),
      pkg('vc4', 'Tri-cat (FVRCP)', 1050, null, ['Annual booster'], 'Cat'),
      pkg('vc5', 'Anti-tick injection (10–25 kg)', 1450, null, ['Lasts ~12 weeks'], 'Anti-tick'),
    ],
  },
  {
    id: 'pr_ster1', name: 'Sethi Animal Hospital', businessName: 'Sethi Animal Hospital', serviceType: 'sterilisation',
    city: 'Noida', area: 'Sector 18', description: 'Day-care surgery with pre-op bloods and an overnight option.',
    rating: 4.7, reviews: 96, experienceYears: 17, verified: true, recommended: false, modes: ['centre'], avatarUrl: null,
    packages: [
      pkg('s1', 'Dog spay — small (up to 10 kg)', 6500, null, ['Pre-op check', 'Cone & meds'], 'Dog'),
      pkg('s2', 'Dog spay — medium (10–25 kg)', 8500, null, ['Pre-op check', 'Cone & meds'], 'Dog'),
      pkg('s3', 'Dog neuter — large (25–45 kg)', 9500, null, ['Pre-op check', 'Cone & meds'], 'Dog'),
      pkg('s4', 'Cat — tom', 3500, null, ['Same-day discharge'], 'Cat'),
      pkg('s5', 'Cat — molly', 5500, null, ['Same-day discharge'], 'Cat'),
    ],
  },
  {
    id: 'pr_day1', name: 'Wag Hotel & Daycare', businessName: 'Wag Hotel', serviceType: 'daycare',
    city: 'Gurugram', area: 'Sohna Road', description: 'Open-air play yards, AC suites and daily photo updates.',
    rating: 4.8, reviews: 188, experienceYears: 5, verified: true, recommended: true, modes: ['centre'], avatarUrl: null,
    packages: [
      pkg('d1', 'Daycare (9 am – 7 pm)', 799, null, ['Supervised play', 'Lunch & rest window'], 'Daycare'),
      pkg('d2', 'Standard boarding', 1199, null, ['Per night', 'Twice-daily walks'], 'Boarding'),
      pkg('d3', 'Luxury suite', 1999, null, ['Per night', 'AC suite + webcam'], 'Boarding'),
    ],
  },
  {
    id: 'pr_travel1', name: 'PetFit Travel Desk', businessName: 'PetFit', serviceType: 'travel',
    city: 'Pan-India', area: 'Remote', description: 'Indian Railways pet rules, 1st AC coupe requests and paperwork.',
    rating: 4.9, reviews: 77, experienceYears: 3, verified: true, recommended: true, modes: ['home'], avatarUrl: null,
    packages: [
      pkg('t1', 'Train travel consultation', 499, null, ['30-min call', 'Route-specific rules'], 'Consult'),
      pkg('t2', 'Coupe request + documents', 1999, null, ['Coupe / cabin request', 'Document checklist'], 'Plan & book'),
      pkg('t3', 'End-to-end journey plan', 3499, null, ['Priority booking assistance', 'Day-of support'], 'Plan & book'),
    ],
  },
  {
    id: 'pr_cel1', name: 'Barkday Co.', businessName: 'Barkday', serviceType: 'celebrations',
    city: 'Gurugram', area: 'Sector 29', description: 'Backdrops, balloon décor and pet-safe cakes.',
    rating: 4.8, reviews: 64, experienceYears: 4, verified: true, recommended: true, modes: ['home'], avatarUrl: null,
    packages: [
      pkg('c1', 'Mini pawty', 3999, 4999, ['Backdrop + balloons', 'Pet-safe cake (500 g)'], 'Birthday'),
      pkg('c2', 'Grand pawty', 8999, 10999, ['Décor + photo-op standee', 'Cake, host & photographer'], 'Birthday'),
    ],
  },
];

export const products: Product[] = [
  { id: 'pd1', name: 'Adult dry food — chicken & rice', brand: 'Farmina', category: 'food', subcategory: 'Dry food', petSpecies: 'dog', price: 2349, mrp: 2599, rating: 4.7, reviews: 1290, description: 'Grain-inclusive adult kibble with real chicken as the first ingredient.', variants: ['3 kg', '7 kg', '12 kg'], imageUrl: null, inStock: true },
  { id: 'pd2', name: 'Fresh meal — lamb & pumpkin', brand: 'Kennel Kitchen', category: 'food', subcategory: 'Fresh food', petSpecies: 'dog', price: 199, mrp: null, rating: 4.8, reviews: 412, description: 'Human-grade, gently cooked. Ready to serve.', variants: ['300 g'], imageUrl: null, inStock: true },
  { id: 'pd3', name: 'Wet food — tuna in gravy', brand: 'Sheba', category: 'food', subcategory: 'Wet food', petSpecies: 'cat', price: 45, mrp: 50, rating: 4.6, reviews: 2210, description: 'Pouch of tuna chunks in gravy for adult cats.', variants: ['70 g', 'Pack of 12'], imageUrl: null, inStock: true },
  { id: 'pd4', name: 'Kitten dry food', brand: 'Royal Canin', category: 'food', subcategory: 'Dry food', petSpecies: 'cat', price: 1180, mrp: 1250, rating: 4.7, reviews: 860, description: 'For kittens up to 12 months.', variants: ['400 g', '2 kg'], imageUrl: null, inStock: true },
  { id: 'pd5', name: 'Chicken jerky strips', brand: 'Dogsee', category: 'treats', subcategory: 'Treats & chews', petSpecies: 'dog', price: 349, mrp: 399, rating: 4.5, reviews: 540, description: 'Single-ingredient, oven-dried chicken.', variants: ['100 g'], imageUrl: null, inStock: true },
  { id: 'pd6', name: 'Yak cheese chew', brand: 'Himalayan Dog Chew', category: 'treats', subcategory: 'Treats & chews', petSpecies: 'dog', price: 299, mrp: null, rating: 4.6, reviews: 330, description: 'Long-lasting, lactose-reduced chew.', variants: ['Medium', 'Large'], imageUrl: null, inStock: true },
  { id: 'pd7', name: 'Rope tug toy', brand: 'Trixie', category: 'toys', subcategory: 'Toys & play', petSpecies: 'dog', price: 449, mrp: 599, rating: 4.4, reviews: 210, description: 'Cotton rope for tug and fetch.', variants: [], imageUrl: null, inStock: true },
  { id: 'pd8', name: 'Feather wand', brand: 'Petstages', category: 'toys', subcategory: 'Toys & play', petSpecies: 'cat', price: 299, mrp: null, rating: 4.3, reviews: 120, description: 'Interactive wand with replaceable feathers.', variants: [], imageUrl: null, inStock: true },
  { id: 'pd9', name: 'Festive bandana — marigold', brand: 'PetFit Studio', category: 'apparel', subcategory: 'Apparel & bandanas', petSpecies: 'all', price: 349, mrp: 499, rating: 4.9, reviews: 88, description: 'Hand-block printed cotton bandana.', variants: ['S', 'M', 'L'], imageUrl: null, inStock: true },
  { id: 'pd10', name: 'Orthopaedic bed', brand: 'Bruno', category: 'beds', subcategory: 'Beds & bowls', petSpecies: 'dog', price: 3499, mrp: 4299, rating: 4.7, reviews: 302, description: 'Memory-foam base with washable cover.', variants: ['M', 'L', 'XL'], imageUrl: null, inStock: true },
  { id: 'pd11', name: 'Steel slow-feeder bowl', brand: 'Basil', category: 'beds', subcategory: 'Beds & bowls', petSpecies: 'all', price: 549, mrp: null, rating: 4.5, reviews: 190, description: 'Anti-gulp ridges, non-slip base.', variants: ['750 ml'], imageUrl: null, inStock: false },
  { id: 'pd12', name: 'Reflective leash + collar set', brand: 'Heads Up For Tails', category: 'walk', subcategory: 'Leashes & collars', petSpecies: 'dog', price: 899, mrp: 1099, rating: 4.6, reviews: 455, description: 'Night-safe reflective stitching.', variants: ['S', 'M', 'L'], imageUrl: null, inStock: true },
];

export const addresses: Address[] = [
  { id: 'a1', label: 'Home', line1: 'B-204, Palm Grove Apartments', line2: 'Sector 54', city: 'Gurugram', pincode: '122011' },
  { id: 'a2', label: 'Work', line1: '4th floor, Tower B, Cyber Park', line2: 'Sector 39', city: 'Gurugram', pincode: '122002' },
];

export const bookings: Booking[] = [
  { id: 'b1', serviceSlug: 'vets', providerId: 'vet_1', providerName: 'Dr. Meera Kapoor', title: 'Teleconsult', petId: 'p_pip', date: day(4), slot: '11:30 AM', mode: 'tele', amount: 399, status: 'upcoming' },
  { id: 'b2', serviceSlug: 'grooming', providerId: 'pr_groom1', providerName: 'Fluff & Fold Groomers', title: 'Bath + haircut', petId: 'p_pip', date: day(-9), slot: '1:00 PM', mode: 'home', amount: 1299, status: 'completed' },
  { id: 'b3', serviceSlug: 'diagnostics', providerId: 'pr_lab1', providerName: 'VetPath Diagnostics', title: 'Adult full body', petId: 'p_pip', date: day(-8), slot: '8:00 AM', mode: 'home', amount: 2499, status: 'completed' },
];

export const orders: Order[] = [
  {
    id: 'PF10231', subtotal: 2698, delivery: 0, total: 2698, status: 'out_for_delivery', placedAt: day(-1), addressId: 'a1', paymentMethod: 'UPI',
    items: [
      { productId: 'pd1', variant: '3 kg', qty: 1, name: 'Adult dry food — chicken & rice', price: 2349 },
      { productId: 'pd5', variant: '100 g', qty: 1, name: 'Chicken jerky strips', price: 349 },
    ],
  },
  {
    id: 'PF10107', subtotal: 540, delivery: 49, total: 589, status: 'delivered', placedAt: day(-20), addressId: 'a1', paymentMethod: 'Card',
    items: [{ productId: 'pd3', variant: 'Pack of 12', qty: 1, name: 'Wet food — tuna in gravy', price: 540 }],
  },
];

export const notifications: AppNotification[] = [
  { id: 'n1', title: 'Kennel cough vaccine is overdue', body: 'Pip’s dose was due 3 days ago. Book a home visit in two taps.', time: '2h ago', kind: 'reminder', read: false },
  { id: 'n2', title: 'Your order is out for delivery', body: 'Order PF10231 arrives today by 7 pm.', time: '5h ago', kind: 'order', read: false },
  { id: 'n3', title: 'Lab report added to Pip’s vault', body: 'VetPath uploaded “Full body checkup report”.', time: '6 days ago', kind: 'record', read: true },
  { id: 'n4', title: 'Teleconsult confirmed', body: 'Dr. Meera Kapoor · join from Bookings 5 minutes before.', time: '1 week ago', kind: 'booking', read: true },
];

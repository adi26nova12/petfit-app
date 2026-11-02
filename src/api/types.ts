/**
 * Domain types the screens render. Field names follow the PetFit API
 * (api.petfit.co.in/api/v1) in camelCase; `src/api/index.ts` is the only place
 * that should map raw API responses into these shapes.
 */

export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type LifeStage = 'Puppy-Kitten' | 'Adult' | 'Senior';

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string;
};

export type Pet = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  gender: 'male' | 'female';
  /** ISO date (yyyy-mm-dd). */
  dob: string;
  weightKg: number;
  sterilised: boolean;
  microchipId: string | null;
  /** Remote URL from the API, or a bundled demo photo key. */
  photo: string | null;
  /** 0–100, computed by the backend from vaccines, weight and visits. */
  healthScore: number;
};

export type WeightEntry = { petId: string; date: string; kg: number };

export type Vaccination = {
  id: string;
  petId: string;
  name: string;
  /** Present once given. */
  givenOn: string | null;
  dueOn: string;
  provider: string | null;
};

export type VaultDocKind = 'lab' | 'prescription' | 'vaccination' | 'travel' | 'other';
export type VaultDoc = {
  id: string;
  petId: string;
  title: string;
  kind: VaultDocKind;
  /** Who added it: "Uploaded by lab", "Digital prescription", "You". */
  source: string;
  date: string;
  fileUrl: string | null;
};

export type ServiceGroup = 'Health' | 'Care' | 'Shop' | 'Life & Travel' | 'Protect';

export type Vet = {
  id: string;
  name: string;
  specialization: string;
  clinicName: string;
  city: string;
  area: string;
  consultationFee: number | null;
  teleconsultationFee: number | null;
  rating: number | null;
  reviews: number;
  experienceYears: number | null;
  languages: string[];
  verified: boolean;
  recommended: boolean;
  about: string;
  avatarUrl: string | null;
};

export type Package = {
  id: string;
  name: string;
  group: string | null;
  price: number;
  mrp: number | null;
  details: string[];
  durationMins?: number;
};

export type Provider = {
  id: string;
  name: string;
  businessName: string;
  /** Matches `Service.serviceType`, e.g. "grooming", "daycare", "labs". */
  serviceType: string;
  city: string;
  area: string;
  description: string;
  rating: number | null;
  reviews: number;
  experienceYears: number | null;
  verified: boolean;
  recommended: boolean;
  /** Where the service happens. */
  modes: ('home' | 'centre')[];
  avatarUrl: string | null;
  packages: Package[];
};

export type ProductCategory = 'food' | 'treats' | 'toys' | 'apparel' | 'beds' | 'walk' | 'grooming' | 'health';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string;
  petSpecies: Species | 'all';
  price: number;
  mrp: number | null;
  rating: number | null;
  reviews: number;
  description: string;
  variants: string[];
  imageUrl: string | null;
  inStock: boolean;
};

export type CartItem = { productId: string; variant: string | null; qty: number };

export type BookingMode = 'clinic' | 'tele' | 'home' | 'centre';
export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';
export type Booking = {
  id: string;
  serviceSlug: string;
  providerId: string;
  providerName: string;
  title: string;
  petId: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  slot: string;
  mode: BookingMode;
  amount: number;
  status: BookingStatus;
};

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';
export type Order = {
  id: string;
  items: (CartItem & { name: string; price: number })[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  addressId: string;
  paymentMethod: string;
};

export type Address = {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  line1: string;
  line2: string;
  city: string;
  pincode: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'reminder' | 'booking' | 'order' | 'record' | 'offer';
  read: boolean;
};

export type RescueRequest = {
  id: string;
  location: string;
  description: string;
  status: 'submitted' | 'assigned' | 'resolved';
  createdAt: string;
};

export type Slot = { time: string; available: boolean };

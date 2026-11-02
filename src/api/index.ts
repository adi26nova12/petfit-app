/**
 * The app's single data boundary. Every screen reads and writes through these
 * functions — nothing else touches `fetch` or the demo data.
 *
 * Each function has a demo branch (USE_MOCKS) and a network branch with the
 * suggested endpoint. Paths for vets / providers / products / rescue match what
 * the web app already reads from api.petfit.co.in; the others are proposals —
 * adjust the path and map the raw response to the types in `./types` here.
 */
import * as db from '@/data/mock';
import { isoDay } from '@/lib/format';
import { http, mock, USE_MOCKS } from './client';
import type {
  Address,
  AppNotification,
  Booking,
  CartItem,
  Order,
  Pet,
  Product,
  ProductCategory,
  Provider,
  RescueRequest,
  Slot,
  User,
  Vaccination,
  VaultDoc,
  Vet,
  WeightEntry,
} from './types';

const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

/* ---------- auth ---------- */

export async function sendOtp(phone: string): Promise<{ requestId: string }> {
  if (USE_MOCKS) return mock({ requestId: id('otp') }, 600);
  return http.post('/auth/otp/send', { phone });
}

export async function verifyOtp(requestId: string, code: string): Promise<{ token: string; user: User; isNewUser: boolean }> {
  if (USE_MOCKS) return mock({ token: 'demo-token', user: db.user, isNewUser: false }, 700);
  return http.post('/auth/otp/verify', { request_id: requestId, code });
}

export async function getMe(): Promise<User> {
  if (USE_MOCKS) return mock(db.user);
  return http.get('/me');
}

export async function updateMe(patch: Partial<User>): Promise<User> {
  if (USE_MOCKS) return mock({ ...db.user, ...patch });
  return http.patch('/me', patch);
}

/* ---------- pets & health records ---------- */

export async function getPets(): Promise<Pet[]> {
  if (USE_MOCKS) return mock(db.pets);
  return http.get('/pets');
}

export async function savePet(pet: Omit<Pet, 'id' | 'healthScore'> & { id?: string }): Promise<Pet> {
  if (USE_MOCKS) return mock({ healthScore: 75, ...pet, id: pet.id ?? id('p') } as Pet, 500);
  return pet.id ? http.patch(`/pets/${pet.id}`, pet) : http.post('/pets', pet);
}

export async function getVaccinations(petId: string): Promise<Vaccination[]> {
  if (USE_MOCKS) return mock(db.vaccinations.filter((v) => v.petId === petId));
  return http.get(`/pets/${petId}/vaccinations`);
}

export async function getWeights(petId: string): Promise<WeightEntry[]> {
  if (USE_MOCKS) return mock(db.weights.filter((w) => w.petId === petId));
  return http.get(`/pets/${petId}/weights`);
}

export async function logWeight(petId: string, kg: number): Promise<WeightEntry> {
  const entry = { petId, kg, date: isoDay() };
  if (USE_MOCKS) return mock(entry);
  return http.post(`/pets/${petId}/weights`, entry);
}

export async function getVault(petId: string): Promise<VaultDoc[]> {
  if (USE_MOCKS) return mock(db.vault.filter((d) => d.petId === petId));
  return http.get(`/pets/${petId}/vault`);
}

/** Upload is a multipart POST in production — pass the picked file's uri from expo-document-picker. */
export async function addVaultDoc(petId: string, doc: Pick<VaultDoc, 'title' | 'kind'>): Promise<VaultDoc> {
  const created: VaultDoc = { ...doc, id: id('d'), petId, source: 'You', date: isoDay(), fileUrl: null };
  if (USE_MOCKS) return mock(created, 600);
  return http.post(`/pets/${petId}/vault`, doc);
}

/* ---------- catalogue: vets, providers, products ---------- */

export async function getVets(params: { city?: string; tele?: boolean } = {}): Promise<Vet[]> {
  if (USE_MOCKS) {
    return mock(db.vets.filter((v) => (!params.tele || v.teleconsultationFee != null) && (!params.city || v.city === params.city)));
  }
  return http.get(`/vets?limit=100&sort=rating_desc${params.city ? `&city=${encodeURIComponent(params.city)}` : ''}`);
}

export async function getVet(vetId: string): Promise<Vet | null> {
  if (USE_MOCKS) return mock(db.vets.find((v) => v.id === vetId) ?? null);
  return http.get(`/vets/${vetId}`);
}

export async function getProviders(serviceType: string): Promise<Provider[]> {
  if (USE_MOCKS) return mock(db.providers.filter((p) => p.serviceType === serviceType));
  return http.get(`/providers?service_type=${encodeURIComponent(serviceType)}`);
}

export async function getProvider(providerId: string): Promise<Provider | null> {
  if (USE_MOCKS) return mock(db.providers.find((p) => p.id === providerId) ?? null);
  return http.get(`/providers/${providerId}`);
}

export async function getSlots(providerId: string, date: string): Promise<Slot[]> {
  if (USE_MOCKS) {
    // Deterministic pseudo-availability per provider + date.
    const seed = [...(providerId + date)].reduce((a, c) => a + c.charCodeAt(0), 0);
    const times = ['9:00 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:30 PM', '6:00 PM', '7:30 PM'];
    return mock(times.map((time, i) => ({ time, available: (seed + i * 7) % 5 !== 0 })), 250);
  }
  return http.get(`/providers/${providerId}/slots?date=${date}`);
}

export async function getProducts(params: { category?: ProductCategory; species?: string; q?: string } = {}): Promise<Product[]> {
  if (USE_MOCKS) {
    const q = params.q?.toLowerCase();
    return mock(
      db.products.filter(
        (p) =>
          (!params.category || p.category === params.category) &&
          (!params.species || p.petSpecies === params.species || p.petSpecies === 'all') &&
          (!q || `${p.name} ${p.brand} ${p.subcategory}`.toLowerCase().includes(q)),
      ),
    );
  }
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  return http.get(`/products?${qs}`);
}

export async function getProduct(productId: string): Promise<Product | null> {
  if (USE_MOCKS) return mock(db.products.find((p) => p.id === productId) ?? null);
  return http.get(`/products/${productId}`);
}

/* ---------- bookings & orders ---------- */

export async function getBookings(): Promise<Booking[]> {
  if (USE_MOCKS) return mock(db.bookings);
  return http.get('/bookings');
}

export async function createBooking(b: Omit<Booking, 'id' | 'status'>): Promise<Booking> {
  if (USE_MOCKS) return mock({ ...b, id: id('b'), status: 'upcoming' as const }, 800);
  return http.post('/bookings', b);
}

export async function cancelBooking(bookingId: string): Promise<void> {
  if (USE_MOCKS) return mock(undefined);
  return http.post(`/bookings/${bookingId}/cancel`);
}

export async function getOrders(): Promise<Order[]> {
  if (USE_MOCKS) return mock(db.orders);
  return http.get('/orders');
}

/** Payment (Razorpay / UPI intent) happens between quote and confirm in production. */
export async function placeOrder(input: { items: CartItem[]; addressId: string; paymentMethod: string }): Promise<Order> {
  if (USE_MOCKS) {
    const items = input.items.map((ci) => {
      const p = db.products.find((x) => x.id === ci.productId)!;
      return { ...ci, name: p.name, price: p.price };
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = subtotal >= 999 ? 0 : 49;
    return mock(
      { id: `PF${Math.floor(10300 + Math.random() * 600)}`, items, subtotal, delivery, total: subtotal + delivery, status: 'placed' as const, placedAt: isoDay(), addressId: input.addressId, paymentMethod: input.paymentMethod },
      900,
    );
  }
  return http.post('/orders', input);
}

/* ---------- account ---------- */

export async function getAddresses(): Promise<Address[]> {
  if (USE_MOCKS) return mock(db.addresses);
  return http.get('/addresses');
}

export async function saveAddress(a: Omit<Address, 'id'> & { id?: string }): Promise<Address> {
  if (USE_MOCKS) return mock({ ...a, id: a.id ?? id('a') });
  return a.id ? http.patch(`/addresses/${a.id}`, a) : http.post('/addresses', a);
}

export async function getNotifications(): Promise<AppNotification[]> {
  if (USE_MOCKS) return mock(db.notifications);
  return http.get('/notifications');
}

/* ---------- rescue & waitlist ---------- */

export async function createRescueRequest(input: { location: string; description: string; phone: string }): Promise<RescueRequest> {
  if (USE_MOCKS) return mock({ id: id('r'), location: input.location, description: input.description, status: 'submitted' as const, createdAt: new Date().toISOString() }, 800);
  return http.post('/rescue/requests', input);
}

export async function joinWaitlist(input: { service: string; city: string; phone: string }): Promise<void> {
  if (USE_MOCKS) return mock(undefined, 600);
  return http.post('/waitlist', input);
}

# PetFit — mobile app (Android & iOS)

The PetFit pet-parent app, built in **Expo SDK 58 / React Native 0.88 / TypeScript**. One codebase ships to Android and iOS.

This repo is the **frontend only**: every screen, flow and design is done and runs on bundled demo data. The backend team connects the real API in one file (`src/api/index.ts`). Nothing else needs to change.

The design matches the PetFit website: logo purple `#6C42A8`, amber `#FDBD05`, cream canvas, Bricolage Grotesque / Figtree / Instrument Serif type, Luna & Pip mascots, and the same service catalogue and health-tool formulas.

---

## Run it

```bash
npm install
npx expo start          # press a = Android emulator, i = iOS simulator, w = web preview
```

To try it on a phone, install **Expo Go** and scan the QR code. In demo mode, any 10-digit mobile number and any 6-digit OTP signs you in to a sample account with two pets, Pip and Luna.

Checks:

```bash
npx tsc --noEmit        # type-check
npx expo lint           # lint
npx expo-doctor         # dependency / config health
```

## Build for the stores

The app uses EAS (Expo's cloud build), so you don't need Xcode or Android Studio:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android   # .aab for Play Store
npx eas-cli@latest build --platform ios       # .ipa for App Store
```

Before the first store build, set the real identifiers in `app.json`. They are currently `in.petfit.app`. The live App Store app ([Petfit India](https://apps.apple.com/in/app/petfit-india/id6809904524)) already has a bundle ID, and it must match if this build replaces that app.

---

## Screens

| Area | Screens | Files (`src/app/…`) |
|---|---|---|
| **Auth** | Onboarding (3 slides), phone login, OTP | `onboarding.tsx`, `login.tsx`, `otp.tsx` |
| **Tabs** | Home, Services, My pet, Shop, Account | `(app)/(tabs)/*` |
| **Services** | Service listing (vets / providers / waitlist), vet profile, provider + packages, booking (pet, date, slot, address), booking confirmed, my bookings | `(app)/service/[slug].tsx`, `vet/[id].tsx`, `provider/[id].tsx`, `book.tsx`, `booking-success.tsx`, `bookings.tsx` |
| **Pet profile** | Health score, vaccination timeline, weight chart + log weight, body condition, document vault + upload, add / edit pet | `(app)/(tabs)/pets.tsx`, `pet-form.tsx` |
| **Shop** | Catalogue with shelves and filters, wishlist, product detail, cart, checkout (address + UPI / card / COD), order placed, order tracking, my orders | `(app)/(tabs)/shop.tsx`, `product/[id].tsx`, `cart.tsx`, `checkout.tsx`, `order-success.tsx`, `order/[id].tsx`, `orders.tsx` |
| **Tools** | Daily calories & water, ideal weight by breed, vaccine schedule | `(app)/tools/[tool].tsx` |
| **Other** | Search, notifications, rescue report, addresses, profile, help & support | `(app)/search.tsx`, `notifications.tsx`, `rescue.tsx`, `addresses.tsx`, `profile.tsx`, `support.tsx` |

Everything under `src/app/(app)/` sits behind sign-in. The guard is in `src/app/_layout.tsx`.

The web app's honesty rules carry over: Pharmacy, After-care, Insurance and Registration show **Coming soon + waitlist**, never fake listings. Pet parents always see a **₹0 booking fee**.

---

## Connecting the backend

### 1. Point the app at the API

```bash
cp .env.example .env.local
# set EXPO_PUBLIC_USE_MOCKS=false and EXPO_PUBLIC_API_URL
```

### 2. Fill in `src/api/index.ts`

This file is the app's only data boundary: screens call these functions and nothing else. Each function has a demo branch and a network branch:

```ts
export async function getVets(params = {}): Promise<Vet[]> {
  if (USE_MOCKS) return mock(db.vets.filter(...));            // demo data
  return http.get(`/vets?limit=100&sort=rating_desc...`);     // ← real API
}
```

For each function:
- **Check the path.** `/vets`, `/providers?service_type=`, `/products` and `/rescue/*` are the paths the website already reads from `api.petfit.co.in`. The others (`/auth/otp/*`, `/pets/*`, `/bookings`, `/orders`, `/addresses`, `/notifications`, `/waitlist`) are proposals. Rename them to match your API.
- **Map the response.** The screens expect the camelCase types in `src/api/types.ts`. If the API returns snake_case (as `/vets` does, e.g. `consultation_fee`), map it inside the function. The website already does this mapping in `src/lib/api.ts`, so you can copy it from there.

`src/api/client.ts` adds the `Authorization: Bearer <token>` header, unwraps `{ data: [...] }` responses, and throws `ApiError` when a response isn't OK.

| Function | Used by | Suggested endpoint |
|---|---|---|
| `sendOtp`, `verifyOtp` | Login / OTP | `POST /auth/otp/send`, `POST /auth/otp/verify` → `{ token, user, isNewUser }` |
| `getMe`, `updateMe` | Account, profile | `GET/PATCH /me` |
| `getPets`, `savePet` | Everywhere / pet form | `GET /pets`, `POST /pets`, `PATCH /pets/:id` |
| `getVaccinations`, `getWeights`, `logWeight` | Pet profile, Home reminder | `/pets/:id/vaccinations`, `/pets/:id/weights` |
| `getVault`, `addVaultDoc` | Vault tab | `GET /pets/:id/vault`, `POST` (multipart) |
| `getVets`, `getVet` | Vets list / profile | `GET /vets`, `GET /vets/:id` |
| `getProviders`, `getProvider`, `getSlots` | Service listings, booking | `GET /providers?service_type=`, `/providers/:id`, `/providers/:id/slots?date=` |
| `getProducts`, `getProduct` | Shop, search | `GET /products?category=&species=&q=`, `/products/:id` |
| `getBookings`, `createBooking`, `cancelBooking` | Booking flow, My bookings | `/bookings` |
| `getOrders`, `placeOrder` | Checkout, My orders | `/orders` |
| `getAddresses`, `saveAddress` | Checkout, addresses | `/addresses` |
| `getNotifications` | Bell / notifications | `/notifications` |
| `createRescueRequest` | Rescue | `POST /rescue/requests` |
| `joinWaitlist` | Coming-soon services | `POST /waitlist` |

### 3. Integration points left for the backend team

These are marked with `Production:` comments in the code:

- **Session persistence.** The token is held in memory (`src/store/app.tsx`). Save it with `expo-secure-store` so users stay signed in.
- **Payments.** `checkout.tsx` has the hook for Razorpay or a UPI intent, which runs between creating and confirming the order.
- **File and photo upload.** Pet photo (`pet-form.tsx`), vault upload (`pets.tsx`) and rescue photo (`rescue.tsx`). Use `expo-image-picker` or `expo-document-picker` with a multipart POST.
- **Location.** Address autofill and rescue location (`addresses.tsx`, `rescue.tsx`). Use `expo-location`.
- **Video consult.** The "Join call" button in `bookings.tsx` should open your video SDK with a room token.
- **Push notifications.** Use `expo-notifications` for reminders and order updates.
- **Product images.** `ProductArt` shows a branded placeholder until the API sends `imageUrl`.

Libraries with native code (secure-store, image-picker, location and so on) need a development build (`npx expo run:android|ios` or `eas build --profile development`) instead of Expo Go.

---

## Project layout

```
src/
  app/              screens (Expo Router: each file is a route)
  api/              index.ts = data boundary · client.ts = fetch wrapper · types.ts = domain types
  components/       ui.tsx (buttons, cards, inputs…) · blocks.tsx (pet/vet/product cards) · charts.tsx
  data/             services.ts (catalogue, from the web app) · nutrition.ts (tool formulas) · mock.ts (demo data)
  store/app.tsx     session, pets, cart, wishlist, bookings, orders
  theme/index.ts    colours, fonts, radii, shadows (mirrors the website's tokens)
  lib/              formatting, cart totals, useApi hook
assets/brand/       logo, Luna & Pip artwork
```

To change the look, edit `src/theme/index.ts`. Every screen reads its colours and fonts from there.

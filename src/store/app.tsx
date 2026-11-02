/**
 * App-wide session state: who is signed in, their pets, cart, bookings and orders.
 * Catalogue data (vets, providers, products) is fetched per screen with `useApi`.
 *
 * State lives in memory. To keep users signed in across launches, persist
 * `token` with expo-secure-store and `onboarded` with AsyncStorage in the effects below.
 */
import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import * as api from '@/api';
import { setAuthToken } from '@/api/client';
import type { Address, Booking, CartItem, Order, Pet, User } from '@/api/types';

type State = {
  onboarded: boolean;
  token: string | null;
  user: User | null;
  pets: Pet[];
  activePetId: string | null;
  cart: CartItem[];
  wishlist: string[];
  bookings: Booking[];
  orders: Order[];
  addresses: Address[];
};

type Action =
  | { type: 'onboarded' }
  | { type: 'signedIn'; token: string; user: User; pets: Pet[]; bookings: Booking[]; orders: Order[]; addresses: Address[] }
  | { type: 'signedOut' }
  | { type: 'user'; user: User }
  | { type: 'activePet'; id: string }
  | { type: 'pet'; pet: Pet }
  | { type: 'cartAdd'; item: CartItem }
  | { type: 'cartQty'; productId: string; variant: string | null; qty: number }
  | { type: 'cartClear' }
  | { type: 'wish'; productId: string }
  | { type: 'booking'; booking: Booking }
  | { type: 'order'; order: Order }
  | { type: 'address'; address: Address };

const initial: State = {
  onboarded: false,
  token: null,
  user: null,
  pets: [],
  activePetId: null,
  cart: [],
  wishlist: [],
  bookings: [],
  orders: [],
  addresses: [],
};

const sameLine = (a: CartItem, productId: string, variant: string | null) => a.productId === productId && a.variant === variant;
const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'onboarded':
      return { ...s, onboarded: true };
    case 'signedIn':
      return { ...s, token: a.token, user: a.user, pets: a.pets, activePetId: a.pets[0]?.id ?? null, bookings: a.bookings, orders: a.orders, addresses: a.addresses };
    case 'signedOut':
      return { ...initial, onboarded: true };
    case 'user':
      return { ...s, user: a.user };
    case 'activePet':
      return { ...s, activePetId: a.id };
    case 'pet':
      return { ...s, pets: s.pets.some((p) => p.id === a.pet.id) ? upsert(s.pets, a.pet) : [...s.pets, a.pet], activePetId: a.pet.id };
    case 'cartAdd': {
      const hit = s.cart.find((c) => sameLine(c, a.item.productId, a.item.variant));
      return {
        ...s,
        cart: hit
          ? s.cart.map((c) => (c === hit ? { ...c, qty: c.qty + a.item.qty } : c))
          : [...s.cart, a.item],
      };
    }
    case 'cartQty':
      return {
        ...s,
        cart: a.qty <= 0
          ? s.cart.filter((c) => !sameLine(c, a.productId, a.variant))
          : s.cart.map((c) => (sameLine(c, a.productId, a.variant) ? { ...c, qty: a.qty } : c)),
      };
    case 'cartClear':
      return { ...s, cart: [] };
    case 'wish':
      return { ...s, wishlist: s.wishlist.includes(a.productId) ? s.wishlist.filter((x) => x !== a.productId) : [...s.wishlist, a.productId] };
    case 'booking':
      return { ...s, bookings: upsert(s.bookings, a.booking) };
    case 'order':
      return { ...s, orders: upsert(s.orders, a.order) };
    case 'address':
      return { ...s, addresses: upsert(s.addresses, a.address) };
  }
}

function useStoreValue() {
  const [state, dispatch] = useReducer(reducer, initial);

  const signIn = useCallback(async (token: string, user: User) => {
    setAuthToken(token);
    const [pets, bookings, orders, addresses] = await Promise.all([api.getPets(), api.getBookings(), api.getOrders(), api.getAddresses()]);
    dispatch({ type: 'signedIn', token, user, pets, bookings, orders, addresses });
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    dispatch({ type: 'signedOut' });
  }, []);

  const activePet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0] ?? null;
  const cartCount = state.cart.reduce((n, c) => n + c.qty, 0);

  return useMemo(() => ({ state, dispatch, signIn, signOut, activePet, cartCount }), [state, signIn, signOut, activePet, cartCount]);
}

type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <AppProvider>');
  return ctx;
}

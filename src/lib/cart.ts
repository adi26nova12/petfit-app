import type { CartItem, Product } from '@/api/types';

export const FREE_DELIVERY_OVER = 999;
export const DELIVERY_FEE = 49;

/** Joins cart lines with product data and totals them. The backend re-prices on checkout. */
export function priceCart(cart: CartItem[], products: Product[]) {
  const lines = cart
    .map((c) => ({ ...c, product: products.find((p) => p.id === c.productId) }))
    .filter((l): l is CartItem & { product: Product } => !!l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const mrpTotal = lines.reduce((s, l) => s + (l.product.mrp ?? l.product.price) * l.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  return { lines, subtotal, savings: mrpTotal - subtotal, delivery, total: subtotal + delivery };
}

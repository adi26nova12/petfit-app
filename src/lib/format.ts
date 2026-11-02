import type { Pet } from '@/api/types';

export function inr(n: number | null | undefined) {
  if (n == null) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function discountPct(price: number, mrp: number | null) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

const parse = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);

/** "12 Nov" or "12 Nov 2025" when not this year. */
export function shortDate(iso: string) {
  const d = parse(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
}

export function weekday(iso: string) {
  return parse(iso).toLocaleDateString('en-IN', { weekday: 'short' });
}

/** Whole days from today (negative = past). */
export function daysFrom(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parse(iso).getTime() - today.getTime()) / 864e5);
}

export function relativeDue(iso: string) {
  const n = daysFrom(iso);
  if (n === 0) return 'due today';
  if (n === 1) return 'due tomorrow';
  if (n > 1) return `due in ${n} days`;
  return n === -1 ? 'overdue by 1 day' : `overdue by ${-n} days`;
}

export function petAge(dob: string) {
  const d = parse(dob);
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 12) return `${Math.max(months, 0)} mo`;
  const y = Math.floor(months / 12);
  return `${y} yr${y > 1 ? 's' : ''}`;
}

export function petSubtitle(p: Pet) {
  return `${p.breed} · ${petAge(p.dob)} · ${p.weightKg} kg`;
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .filter((w) => /^[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** yyyy-mm-dd for today ± n days (local time). */
export function isoDay(n = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

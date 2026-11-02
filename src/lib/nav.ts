import type { useRouter } from 'expo-router';

import type { Service } from '@/data/services';

/** Shop-type services open the Shop tab filtered; everything else opens its service screen. */
export function openService(router: ReturnType<typeof useRouter>, s: Service) {
  if (s.listing.kind === 'shop') router.push({ pathname: '/shop', params: { cat: s.listing.category ?? '' } });
  else router.push({ pathname: '/service/[slug]', params: { slug: s.slug } });
}

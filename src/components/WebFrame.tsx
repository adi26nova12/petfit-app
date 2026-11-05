import type { ReactNode } from 'react';

/** Native: nothing to frame. The web build swaps in WebFrame.web.tsx. */
export function WebFrame({ children }: { children: ReactNode }) {
  return children;
}

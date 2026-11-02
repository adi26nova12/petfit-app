/**
 * PetFit design tokens — mirrored from the web app's `globals.css` @theme block
 * so the mobile app and petfit.in share one brand world:
 * logo purple + logo yellow, Luna teal, warm cream canvas.
 */

export const colors = {
  brand50: '#f6f1fc',
  brand100: '#ede4f8',
  brand200: '#d9c8f0',
  brand300: '#bfa3e3',
  brand400: '#9a73cb',
  brand500: '#7b50bb',
  brand600: '#6c42a8',
  brand700: '#57348a',
  brand800: '#42276a',
  brand900: '#2b1748',

  ink: '#24173a',
  inkSoft: '#4a3d60',
  muted: '#6b5e80',
  cream: '#fff8ec',
  sand: '#fbf0dc',
  surface: '#fbf8ff',
  white: '#ffffff',
  line: 'rgba(36,23,58,0.12)',
  lineStrong: 'rgba(36,23,58,0.22)',

  amber: '#fdbd05',
  amberDeep: '#b98500',
  amberSoft: '#fff1c2',
  amberInk: '#8a5e00',
  teal: '#1f7f7a',
  tealSoft: '#d6efec',
  blush: '#ffd9c7',
  blushInk: '#a2432a',
  danger: '#b42318',
  dangerSoft: '#fde7e5',
  success: '#1f7f7a',
} as const;

/** Tile tones used for service icons (bg + icon colour), as on the web phone mockup. */
export const tones = {
  purple: { bg: colors.brand100, fg: colors.brand600 },
  teal: { bg: colors.tealSoft, fg: colors.teal },
  amber: { bg: colors.amberSoft, fg: colors.amberInk },
  blush: { bg: colors.blush, fg: colors.blushInk },
  sand: { bg: colors.sand, fg: colors.inkSoft },
} as const;
export type Tone = keyof typeof tones;

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
} as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, gutter: 20 } as const;

export const shadow = {
  card: {
    shadowColor: colors.brand900,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lift: {
    shadowColor: colors.brand900,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
} as const;

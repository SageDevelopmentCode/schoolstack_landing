import type { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';

import { Garden } from '@/components/parent/garden/tokens';

/**
 * The welcome screen's "school day": what MudKitchen does, told through the
 * sample notifications it sends along the way. Mirrors `DAY` in the web home
 * page (`src/components/home-garden/sections/DayTrack.tsx`). Keep every string
 * word for word with its web source:
 * - sticker title / subtitle → `STICKERS_BY_DEMO` (`src/components/home/FloatingStickers.tsx`)
 * - title / description → `PRODUCT_PREVIEW_TABS` (`src/lib/marketing/product-preview-tabs.ts`),
 *   and Messages → `DOWNLOAD_APP_SLIDES[2].caption` (`src/lib/marketing/download-app-slides.ts`)
 * - `when` is decorative handwriting only.
 */

type IoniconName = keyof typeof Ionicons.glyphMap;

export type IntroDayMoment = {
  id: string;
  when: string;
  sticker: { title: string; subtitle: string; icon: IoniconName; color: string };
  title: string;
  description: string;
  /** Garden pastel for the icon tile. */
  tint: string;
  /** Full-screen backdrop colour for this moment. */
  wash: string;
  /** Deep partner of the pastel for the day track and handwriting. */
  ink: string;
};

/**
 * Full-screen backdrop per pastel. The pale pastels are used as-is (mixing them
 * into cream turns them grey); butter is softened so it doesn't shout.
 */
const WASH = {
  butter: '#FBEBB8',
  mint: Garden.mint,
  sky: Garden.sky,
  peach: Garden.peach,
  lav: Garden.lav,
} as const;

/** Text-safe deep partner of each pastel (matches `CHIP_TONES`). */
const INK = {
  butter: '#6B4F00',
  mint: Garden.forest,
  sky: '#24507A',
  peach: '#7E4533',
  lav: '#5E3A78',
} as const;

export const INTRO_DAY_INTERVAL_MS = 2800;
/** After a manual pick, wait this long before auto-advancing again. */
export const INTRO_DAY_RESUME_MS = 6000;

export const INTRO_DAY: IntroDayMoment[] = [
  {
    id: 'timeclock',
    when: 'first thing',
    sticker: { title: 'Clocked in', subtitle: '7:58 AM', icon: 'time-outline', color: '#0E7A5A' },
    title: 'Timeclock',
    description: 'Log hours, track sessions, and view weekly and monthly totals in one place.',
    tint: Garden.butter,
    wash: WASH.butter,
    ink: INK.butter,
  },
  {
    id: 'attendance',
    when: 'morning',
    sticker: {
      title: 'Attendance saved',
      subtitle: 'Morning check-in',
      icon: 'checkmark-circle-outline',
      color: Garden.forest,
    },
    title: 'Attendance',
    description:
      'Log daily attendance for every student, track who showed up, and navigate week by week.',
    tint: Garden.mint,
    wash: WASH.mint,
    ink: INK.mint,
  },
  {
    id: 'messages',
    when: 'mid-morning',
    sticker: {
      title: 'New message',
      subtitle: 'From Ms. Rivera',
      icon: 'chatbubble-ellipses-outline',
      color: '#24507A',
    },
    title: 'Messages',
    description: 'Message staff directly in the app—no digging through inboxes.',
    tint: Garden.sky,
    wash: WASH.sky,
    ink: INK.sky,
  },
  {
    id: 'admin',
    when: 'lunchtime',
    sticker: {
      title: 'New application',
      subtitle: 'Grade 2 · Fall',
      icon: 'person-add-outline',
      color: '#7E4533',
    },
    title: 'Admin Portal',
    description:
      'Enrollment, billing, and daily operations in one workspace — from first click to enrolled.',
    tint: Garden.peach,
    wash: WASH.peach,
    ink: INK.peach,
  },
  {
    id: 'tuition',
    when: 'afternoon',
    sticker: {
      title: 'Tuition paid',
      subtitle: 'October · autopay',
      icon: 'card-outline',
      color: '#5E3A78',
    },
    title: 'Tuition & Billing',
    description: 'Families view invoices, make payments, and track tuition history in one place.',
    tint: Garden.lav,
    wash: WASH.lav,
    ink: INK.lav,
  },
  {
    id: 'website',
    when: 'after pickup',
    sticker: {
      title: 'Tour booked',
      subtitle: 'From your website',
      icon: 'globe-outline',
      color: Garden.forest,
    },
    title: 'School Website',
    description: 'A full school website with programs, FAQs, team, and calls to action.',
    tint: Garden.mint,
    wash: WASH.mint,
    ink: INK.mint,
  },
  {
    id: 'marketing',
    when: 'tonight',
    sticker: {
      title: 'Campaign sent',
      subtitle: 'Open house invite',
      icon: 'mail-outline',
      color: '#6B4F00',
    },
    title: 'Marketing',
    description:
      'Automated email campaigns and lead nurture sequences, all tied to your pipeline.',
    tint: Garden.butter,
    wash: WASH.butter,
    ink: INK.butter,
  },
];

/** `HERO_COPY` in `src/components/home/home-copy.ts`. */
export const INTRO_HEADLINE = {
  lead: 'Everything your microschool needs,',
  accent: 'all in one place.',
} as const;

/** `SAGEFIELD_PHOTOS.mudKitchen` in `src/components/home-garden/assets.ts`. */
export const INTRO_PHOTO: { source: ImageSourcePropType; alt: string } = {
  source: require('@/assets/images/sagefield/mud-kitchen.jpg'),
  alt: 'Kids playing at the outdoor mud kitchen at Sage Field',
};

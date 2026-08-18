import { ImageSourcePropType } from 'react-native';

export const AUTH_GATE_SLIDE_INTERVAL_MS = 6000;

export type PromoSlide = {
  image: ImageSourcePropType;
  badge: string;
  headlineLead: string;
  headlineAccent: string;
  subtext: string;
};

export const PROMO_SLIDES: PromoSlide[] = [
  {
    image: require('@/assets/images/stock/Homeschool2.webp'),
    badge: 'Built for Microschools',
    headlineLead: 'Everything your microschool',
    headlineAccent: 'needs, all in one place.',
    subtext:
      'MudKitchen keeps parents, teachers, and administrators aligned with enrollment, communication, billing, and more—so you can focus on what matters most: your students.',
  },
  {
    image: require('@/assets/images/stock/ImageOne.webp'),
    badge: 'Family clarity',
    headlineLead: 'Give families one place',
    headlineAccent: 'to stay in the loop.',
    subtext:
      'Parents should not have to search through old emails, group chats, and scattered links. MudKitchen gives families a simpler experience for updates, forms, schedules, and the information they actually need.',
  },
  {
    image: require('@/assets/images/stock/ImageFour.webp'),
    badge: 'What is MudKitchen?',
    headlineLead: 'One system for running',
    headlineAccent: 'a microschool.',
    subtext:
      'MudKitchen brings enrollment, family communication, student information, schedules, and everyday operations into one place—so school teams stay organized without a patchwork of spreadsheets, forms, and apps.',
  },
  {
    image: require('@/assets/images/stock/Homeschool.webp'),
    badge: 'Enrollment',
    headlineLead: 'Enrollment workflows',
    headlineAccent: 'families can actually finish.',
    subtext:
      'Collect health info, emergency contacts, uploads, and signatures in one guided flow—so applications move forward without chasing families across email and PDFs.',
  },
  {
    image: require('@/assets/images/stock/ImageFive.webp'),
    badge: 'Tuition & billing',
    headlineLead: 'Tuition and billing',
    headlineAccent: 'where families already are.',
    subtext:
      'Families view invoices, make payments, and track tuition history without juggling separate portals, payment links, and manual reminders.',
  },
  {
    image: require('@/assets/images/stock/ImageSix.webp'),
    badge: 'For teachers',
    headlineLead: 'Support teachers with',
    headlineAccent: 'a calmer school day.',
    subtext:
      'When teachers can easily see what is happening and what families need, the whole day runs more smoothly—so they spend more energy teaching instead of tracking down details.',
  },
  {
    image: require('@/assets/images/stock/ImageSeven.webp'),
    badge: 'Growing operations',
    headlineLead: 'As enrollment grows',
    headlineAccent: 'admin grows faster.',
    subtext:
      'MudKitchen helps small teams turn repeating work—forms, reminders, onboarding, records, and follow-ups—into clearer workflows, so growth feels manageable instead of messy.',
  },
];

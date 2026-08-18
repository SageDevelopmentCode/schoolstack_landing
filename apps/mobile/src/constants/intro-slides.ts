import { ImageSourcePropType } from 'react-native';

export const INTRO_SLIDE_INTERVAL_MS = 5000;

export type IntroSlide = {
  image: ImageSourcePropType;
  headlineLead: string;
  headlineAccent: string;
};

export const INTRO_SLIDES: IntroSlide[] = [
  {
    image: require('@/assets/images/stock/Homeschool2.webp'),
    headlineLead: 'Everything your microschool',
    headlineAccent: 'needs, all in one place.',
  },
  {
    image: require('@/assets/images/stock/ImageOne.webp'),
    headlineLead: 'Give families one place',
    headlineAccent: 'to stay in the loop.',
  },
  {
    image: require('@/assets/images/stock/ImageFive.webp'),
    headlineLead: 'Tuition and billing',
    headlineAccent: 'where families already are.',
  },
  {
    image: require('@/assets/images/stock/ImageSix.webp'),
    headlineLead: 'Support teachers with',
    headlineAccent: 'a calmer school day.',
  },
];

import type { Href } from 'expo-router';

type BackNavigableRouter = {
  canGoBack(): boolean;
  back(): void;
  replace(href: Href): void;
};

export function goBackOrReplace(router: BackNavigableRouter, fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}

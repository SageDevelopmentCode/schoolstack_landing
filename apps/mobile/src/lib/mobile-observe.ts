import { requireOptionalNativeModule } from 'expo';

function isMobileObserveNativeAvailable(): boolean {
  return (
    requireOptionalNativeModule('ExpoAppMetrics') != null &&
    requireOptionalNativeModule('ExpoObserve') != null
  );
}

// expo-observe pulls in expo-app-metrics, which throws at import time when the binary
// lacks ExpoAppMetrics (Expo Go). Pick stub vs enabled once per bundle load.
const mobileObserve = isMobileObserveNativeAvailable()
  ? require('./mobile-observe-enabled') as typeof import('./mobile-observe-stub')
  : require('./mobile-observe-stub') as typeof import('./mobile-observe-stub');

export const Observe = mobileObserve.Observe;
export const ObserveRoot = mobileObserve.ObserveRoot;
export const useObserve = mobileObserve.useObserve;

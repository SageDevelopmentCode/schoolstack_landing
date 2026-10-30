require('react-native-get-random-values');

jest.mock('@/lib/sentry', () => ({
  isMobileSentryEnabled: () => false,
  initMobileSentry: jest.fn(),
  navigationIntegration: {},
  captureMobileOperationalPostFailure: jest.fn(),
  withMobileApiSpan: (_url: string, _method: string, run: () => Promise<unknown>) => run(),
  Sentry: {
    captureMessage: jest.fn(),
    captureException: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

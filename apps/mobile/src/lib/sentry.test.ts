import { setMobileSentryInitializedForTests, withMobileApiSpan } from '@/lib/sentry';

const mockStartSpan = jest.fn(
  (_options: unknown, callback: () => unknown) => callback(),
);
const mockWithActiveSpan = jest.fn((_span: unknown, callback: () => unknown) => callback());

jest.mock('@sentry/react-native', () => ({
  reactNavigationIntegration: jest.fn(() => ({ name: 'ReactNavigation' })),
  init: jest.fn(),
  setTags: jest.fn(),
  captureMessage: jest.fn(),
  startSpan: (options: unknown, callback: () => unknown) => mockStartSpan(options, callback),
  withActiveSpan: (span: unknown, callback: () => unknown) => mockWithActiveSpan(span, callback),
}));

jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0' } }));
jest.mock('@/lib/mobile-build-info', () => ({
  mobileSentryDist: () => undefined,
  mobileSentryTags: () => ({}),
}));
jest.mock('@/lib/mobile-global-error-reporting', () => ({
  reportUnhandledRejectionFromSentryEvent: jest.fn(),
}));

// test/jest-setup.js mocks '@/lib/sentry' globally; this suite tests the real module
// (jest.mock/unmock calls are hoisted above the import).
jest.unmock('@/lib/sentry');

const url = 'https://trymudkitchen.com/api/account/expo-push/register';

describe('withMobileApiSpan', () => {
  beforeEach(() => {
    mockStartSpan.mockClear();
    mockWithActiveSpan.mockClear();
    setMobileSentryInitializedForTests(true);
  });

  afterAll(() => {
    setMobileSentryInitializedForTests(false);
  });

  it('runs without spans when Sentry is not initialized', async () => {
    setMobileSentryInitializedForTests(false);
    const run = jest.fn(async () => 'ok');

    await expect(withMobileApiSpan(url, 'post', run, { background: true })).resolves.toBe('ok');

    expect(run).toHaveBeenCalledTimes(1);
    expect(mockStartSpan).not.toHaveBeenCalled();
    expect(mockWithActiveSpan).not.toHaveBeenCalled();
  });

  it('nests foreground calls under the active span', async () => {
    const run = jest.fn(async () => 'ok');

    await expect(withMobileApiSpan(url, 'get', run)).resolves.toBe('ok');

    expect(mockWithActiveSpan).not.toHaveBeenCalled();
    expect(mockStartSpan).toHaveBeenCalledTimes(1);
    expect(mockStartSpan).toHaveBeenCalledWith(
      {
        name: 'GET /api/account/expo-push/register',
        op: 'http.client',
        attributes: { 'http.request.method': 'GET' },
      },
      run,
    );
  });

  it('starts background calls as their own root span', async () => {
    const run = jest.fn(async () => 'ok');

    await expect(withMobileApiSpan(url, 'post', run, { background: true })).resolves.toBe('ok');

    expect(mockWithActiveSpan).toHaveBeenCalledTimes(1);
    expect(mockWithActiveSpan.mock.calls[0][0]).toBeNull();
    expect(mockStartSpan).toHaveBeenCalledTimes(1);
    expect(mockStartSpan).toHaveBeenCalledWith(
      {
        name: 'POST /api/account/expo-push/register',
        op: 'http.client',
        attributes: { 'http.request.method': 'POST', 'mobile.api.background': true },
      },
      run,
    );
    // The span must be started inside withActiveSpan(null, …), not before it.
    expect(mockWithActiveSpan.mock.invocationCallOrder[0]).toBeLessThan(
      mockStartSpan.mock.invocationCallOrder[0],
    );
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from background requests', async () => {
    const error = new Error('Network request failed');

    await expect(
      withMobileApiSpan(url, 'delete', async () => Promise.reject(error), { background: true }),
    ).rejects.toBe(error);
  });
});

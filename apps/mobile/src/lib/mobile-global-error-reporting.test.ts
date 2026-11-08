import {
  installMobileUncaughtErrorHandler,
  reportMobileMediaLoadFailure,
  reportUnhandledRejectionFromSentryEvent,
  resetMobileGlobalErrorDedupeForTests,
  setMobileGlobalErrorReporter,
} from '@/lib/mobile-global-error-reporting';

type TestErrorUtils = {
  handler: (error: unknown, isFatal?: boolean) => void;
  getGlobalHandler: () => (error: unknown, isFatal?: boolean) => void;
  setGlobalHandler: (next: (error: unknown, isFatal?: boolean) => void) => void;
};

describe('mobile global error reporting', () => {
  const reporter = jest.fn();
  const originalErrorUtils = (globalThis as { ErrorUtils?: unknown }).ErrorUtils;

  beforeEach(() => {
    reporter.mockReset();
    resetMobileGlobalErrorDedupeForTests();
    setMobileGlobalErrorReporter(reporter);
  });

  afterEach(() => {
    setMobileGlobalErrorReporter(null);
    (globalThis as { ErrorUtils?: unknown }).ErrorUtils = originalErrorUtils;
  });

  function installFakeErrorUtils(previous: jest.Mock): TestErrorUtils {
    const utils: TestErrorUtils = {
      handler: previous,
      getGlobalHandler: () => utils.handler,
      setGlobalHandler: (next) => {
        utils.handler = next;
      },
    };
    (globalThis as { ErrorUtils?: unknown }).ErrorUtils = utils;
    return utils;
  }

  it('reports uncaught JS errors and still calls the previous handler', () => {
    const previous = jest.fn();
    const utils = installFakeErrorUtils(previous);
    const uninstall = installMobileUncaughtErrorHandler();

    const error = new Error('boom');
    utils.handler(error, true);

    expect(reporter).toHaveBeenCalledWith('uncaught_js_error', error, {
      metadata: { isFatal: true },
    });
    expect(previous).toHaveBeenCalledWith(error, true);

    uninstall();
    expect(utils.handler).toBe(previous);
  });

  it('suppresses duplicate reports of the same error', () => {
    const utils = installFakeErrorUtils(jest.fn());
    installMobileUncaughtErrorHandler();

    utils.handler(new Error('loop'), false);
    utils.handler(new Error('loop'), false);

    expect(reporter).toHaveBeenCalledTimes(1);
  });

  it('never breaks the previous handler when reporting throws', () => {
    const previous = jest.fn();
    const utils = installFakeErrorUtils(previous);
    reporter.mockImplementation(() => {
      throw new Error('report failed');
    });
    installMobileUncaughtErrorHandler();

    expect(() => utils.handler(new Error('x'), false)).not.toThrow();
    expect(previous).toHaveBeenCalled();
  });

  it('forwards unhandled rejections from Sentry events only', () => {
    reportUnhandledRejectionFromSentryEvent({
      exception: {
        values: [{ type: 'Error', value: 'handled one', mechanism: { type: 'generic' } }],
      },
    });
    expect(reporter).not.toHaveBeenCalled();

    reportUnhandledRejectionFromSentryEvent({
      exception: {
        values: [
          { type: 'TypeError', value: 'bad promise', mechanism: { type: 'onunhandledrejection' } },
        ],
      },
    });
    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter.mock.calls[0]?.[0]).toBe('unhandled_promise_rejection');
    expect((reporter.mock.calls[0]?.[1] as Error).message).toBe('bad promise');
  });

  it('throttles media load failures per kind and host', () => {
    reportMobileMediaLoadFailure('gallery_photo', 'https://cdn.example.com/a.jpg');
    reportMobileMediaLoadFailure('gallery_photo', 'https://cdn.example.com/b.jpg');
    reportMobileMediaLoadFailure('gallery_photo', 'https://other.example.com/c.jpg');

    expect(reporter).toHaveBeenCalledTimes(2);
  });
});

import { act } from 'react';
import { Text } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { MobileGlobalErrorReportingBridge } from '@/components/mobile-global-error-reporting-bridge';
import { MobileOperationalErrorBoundary } from '@/components/mobile-operational-error-boundary';
import { MobileOperationalRouteErrorBoundary } from '@/components/mobile-operational-route-error-boundary';
import {
  reportMobileGlobalOperationalError,
  setMobileGlobalErrorReporter,
} from '@/lib/mobile-global-error-reporting';

const mockReportError = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn(() => true);

jest.mock('@/lib/e2e', () => ({
  isMobileE2e: false,
}));

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    portalType: null,
    selectedSchool: null,
  }),
}));

jest.mock('@/lib/mobile-error-reporter', () => ({
  createMobileErrorReporter: () => mockReportError,
}));

jest.mock('expo-router', () => ({
  usePathname: () => '/parent/demo/more/photos',
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    canGoBack: mockCanGoBack,
  }),
}));

function ThrowOnMount(): null {
  throw new Error('initial mount render failure');
}

describe('MobileOperationalErrorBoundary', () => {
  beforeEach(() => {
    mockReportError.mockReset();
    mockBack.mockReset();
    mockReplace.mockReset();
    mockCanGoBack.mockReset();
    mockCanGoBack.mockReturnValue(true);
    setMobileGlobalErrorReporter(mockReportError);
  });

  it('registers the global reporter during bridge render before siblings mount', () => {
    setMobileGlobalErrorReporter(null);
    act(() => {
      TestRenderer.create(<MobileGlobalErrorReportingBridge />);
    });

    reportMobileGlobalOperationalError('react_render_error', new Error('probe'));
    expect(mockReportError).toHaveBeenCalledWith(
      'react_render_error',
      expect.objectContaining({ message: 'probe' }),
      undefined,
    );
  });

  it('reports react_render_error when a sibling throws on initial mount', () => {
    act(() => {
      TestRenderer.create(
        <MobileOperationalErrorBoundary>
          <MobileGlobalErrorReportingBridge />
          <ThrowOnMount />
        </MobileOperationalErrorBoundary>,
      );
    });

    expect(mockReportError).toHaveBeenCalledTimes(1);
    expect(mockReportError).toHaveBeenCalledWith(
      'react_render_error',
      expect.objectContaining({ message: 'initial mount render failure' }),
      expect.objectContaining({
        details: expect.any(String),
        metadata: undefined,
      }),
    );
  });

  it('includes pathname metadata when provided', () => {
    act(() => {
      TestRenderer.create(
        <>
          <MobileGlobalErrorReportingBridge />
          <MobileOperationalErrorBoundary pathname="/parent/demo/more/photos">
            <ThrowOnMount />
          </MobileOperationalErrorBoundary>
        </>,
      );
    });

    expect(mockReportError).toHaveBeenCalledWith(
      'react_render_error',
      expect.objectContaining({ message: 'initial mount render failure' }),
      expect.objectContaining({
        metadata: { pathname: '/parent/demo/more/photos' },
      }),
    );
  });

  it('reports react_render_error when the boundary child throws after the bridge is a sibling', () => {
    act(() => {
      TestRenderer.create(
        <>
          <MobileGlobalErrorReportingBridge />
          <MobileOperationalErrorBoundary>
            <ThrowOnMount />
          </MobileOperationalErrorBoundary>
        </>,
      );
    });

    expect(mockReportError).toHaveBeenCalledTimes(1);
    expect(mockReportError).toHaveBeenCalledWith(
      'react_render_error',
      expect.objectContaining({ message: 'initial mount render failure' }),
      expect.any(Object),
    );
  });

  it('clears hasError when pathname changes so a new screen can render', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <MobileOperationalErrorBoundary pathname="/parent/demo/a">
          <ThrowOnMount />
        </MobileOperationalErrorBoundary>,
      );
    });

    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === 'Something went wrong')).toBe(
      true,
    );

    act(() => {
      renderer!.update(
        <MobileOperationalErrorBoundary pathname="/parent/demo/b">
          <Text>Recovered screen</Text>
        </MobileOperationalErrorBoundary>,
      );
    });

    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === 'Recovered screen')).toBe(
      true,
    );
  });
});

describe('MobileOperationalRouteErrorBoundary', () => {
  beforeEach(() => {
    mockReportError.mockReset();
    mockBack.mockReset();
    mockReplace.mockReset();
    mockCanGoBack.mockReset();
    mockCanGoBack.mockReturnValue(true);
    setMobileGlobalErrorReporter(mockReportError);
  });

  it('reports react_render_error with pathname metadata when rendered for a route error', () => {
    act(() => {
      TestRenderer.create(
        <>
          <MobileGlobalErrorReportingBridge />
          <MobileOperationalRouteErrorBoundary
            error={new Error('route render failure')}
            retry={async () => {}}
          />
        </>,
      );
    });

    expect(mockReportError).toHaveBeenCalledWith(
      'react_render_error',
      expect.objectContaining({ message: 'route render failure' }),
      expect.objectContaining({
        metadata: { pathname: '/parent/demo/more/photos' },
      }),
    );
  });

  it('Go back calls router.back when the stack can go back', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <MobileOperationalRouteErrorBoundary
          error={new Error('route render failure')}
          retry={async () => {}}
        />,
      );
    });

    const goBackButton = renderer!.root.findByProps({ accessibilityRole: 'button' });

    act(() => {
      goBackButton.props.onPress();
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('Go back replaces to portal when the stack cannot go back', () => {
    mockCanGoBack.mockReturnValue(false);
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <MobileOperationalRouteErrorBoundary
          error={new Error('route render failure')}
          retry={async () => {}}
        />,
      );
    });

    const goBackButton = renderer!.root.findByProps({ accessibilityRole: 'button' });

    act(() => {
      goBackButton.props.onPress();
    });

    expect(mockReplace).toHaveBeenCalledWith('/portal');
    expect(mockBack).not.toHaveBeenCalled();
  });
});

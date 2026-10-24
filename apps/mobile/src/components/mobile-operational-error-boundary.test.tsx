import { act } from 'react';
import TestRenderer from 'react-test-renderer';

import { MobileGlobalErrorReportingBridge } from '@/components/mobile-global-error-reporting-bridge';
import { MobileOperationalErrorBoundary } from '@/components/mobile-operational-error-boundary';
import {
  reportMobileGlobalOperationalError,
  setMobileGlobalErrorReporter,
} from '@/lib/mobile-global-error-reporting';

const mockReportError = jest.fn();

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

function ThrowOnMount(): null {
  throw new Error('initial mount render failure');
}

describe('MobileOperationalErrorBoundary', () => {
  beforeEach(() => {
    mockReportError.mockReset();
    setMobileGlobalErrorReporter(null);
  });

  it('registers the global reporter during bridge render before siblings mount', () => {
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
});

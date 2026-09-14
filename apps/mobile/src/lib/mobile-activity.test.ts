import {
  mobileClientMetadata,
  parseMobileOperationalError,
  portalTypeToMobileSurface,
  shouldReportMobileOperationalError,
} from '@/lib/mobile-activity';

describe('parseMobileOperationalError', () => {
  it('extracts message from Error instances', () => {
    expect(parseMobileOperationalError(new Error('Load failed'))).toEqual({
      message: 'Load failed',
    });
  });

  it('falls back to unknown error', () => {
    expect(parseMobileOperationalError(null)).toEqual({ message: 'Unknown error' });
  });
});

describe('shouldReportMobileOperationalError', () => {
  it('skips expected 4xx responses', () => {
    expect(shouldReportMobileOperationalError(new Error('Bad request'), 400)).toBe(false);
  });

  it('reports unexpected server failures', () => {
    expect(shouldReportMobileOperationalError(new Error('Server error'), 500)).toBe(true);
  });
});

describe('portalTypeToMobileSurface', () => {
  it('maps supported portal types', () => {
    expect(portalTypeToMobileSurface('parent')).toBe('parent_portal');
    expect(portalTypeToMobileSurface('school_admin')).toBe('school_admin');
    expect(portalTypeToMobileSurface('platform_admin')).toBeNull();
  });
});

describe('mobileClientMetadata', () => {
  it('includes mobile client marker', () => {
    expect(mobileClientMetadata()).toMatchObject({ client: 'mobile' });
  });
});

import {
  adminApplicationStatusLabel,
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from '@/lib/admissions/application-status-ui';

describe('applicationStatusLabel', () => {
  it('returns known labels', () => {
    expect(applicationStatusLabel('submitted')).toBe('Submitted');
    expect(applicationStatusLabel('under_review')).toBe('Under review');
  });

  it('falls back to the raw status', () => {
    expect(applicationStatusLabel('custom_status')).toBe('custom_status');
  });
});

describe('adminApplicationStatusLabel', () => {
  it('maps draft to Applying', () => {
    expect(adminApplicationStatusLabel('draft')).toBe('Applying');
  });
});

describe('applicationStatusBadgeStyle', () => {
  it('uses success colors for accepted statuses', () => {
    expect(applicationStatusBadgeStyle('accepted')).toEqual({
      backgroundColor: '#E2EDD9',
      color: '#4A6B52',
    });
  });
});

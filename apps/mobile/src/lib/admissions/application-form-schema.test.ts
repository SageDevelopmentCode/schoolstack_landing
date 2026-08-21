import {
  formatFeeAmount,
  parseApplicationFormFeeConfig,
  parseApplicationFormPostSubmitConfig,
  parseApplicationFormSchema,
} from '@/lib/admissions/application-form-schema';

describe('parseApplicationFormSchema', () => {
  it('returns empty schema for invalid input', () => {
    expect(parseApplicationFormSchema(null)).toEqual({
      sections: [],
      acknowledgments: [],
    });
  });

  it('parses sections and acknowledgments', () => {
    const schema = parseApplicationFormSchema({
      sections: [{ id: 'student', title: 'Student info', fields: [] }],
      acknowledgments: [{ id: 'ack-1', label: 'I agree' }],
    });

    expect(schema.sections).toEqual([{ id: 'student', title: 'Student info' }]);
    expect(schema.acknowledgments).toEqual([{ id: 'ack-1', label: 'I agree' }]);
  });
});

describe('parseApplicationFormFeeConfig', () => {
  it('returns defaults for invalid input', () => {
    expect(parseApplicationFormFeeConfig(null)).toEqual({
      enabled: false,
      label: 'Application fee',
    });
  });

  it('parses fee config fields', () => {
    expect(
      parseApplicationFormFeeConfig({
        enabled: true,
        label: 'Enrollment fee',
        amount_cents: 12500,
      }),
    ).toEqual({
      enabled: true,
      label: 'Enrollment fee',
      amount_cents: 12500,
    });
  });
});

describe('parseApplicationFormPostSubmitConfig', () => {
  it('parses enabled post-submit actions', () => {
    const config = parseApplicationFormPostSubmitConfig({
      actions: [
        { id: 'visit', type: 'school_visit', label: 'Visit campus' },
        { id: 'disabled', type: 'interview', enabled: false },
      ],
    });

    expect(config.actions).toEqual([
      {
        id: 'visit',
        type: 'school_visit',
        enabled: true,
        required: true,
        label: 'Visit campus',
      },
      {
        id: 'disabled',
        type: 'interview',
        enabled: false,
        required: true,
        label: undefined,
      },
    ]);
  });
});

describe('formatFeeAmount', () => {
  it('formats cents as USD currency', () => {
    expect(formatFeeAmount(12500)).toBe('$125.00');
  });
});

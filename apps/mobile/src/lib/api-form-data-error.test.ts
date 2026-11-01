import {
  messageForFailedFormDataResponse,
  MobileApiFormDataError,
  throwMobileApiFormDataError,
} from '@/lib/api-form-data-error';

describe('messageForFailedFormDataResponse', () => {
  it('prefers API error text', () => {
    expect(messageForFailedFormDataResponse(400, { error: 'Choose at least one photo.' }, '')).toBe(
      'Choose at least one photo.',
    );
  });

  it('maps 413 to upload guidance', () => {
    expect(messageForFailedFormDataResponse(413, {}, '<html>')).toContain('Too many photos');
  });
});

describe('throwMobileApiFormDataError', () => {
  it('includes status and response preview', () => {
    expect(() => throwMobileApiFormDataError(502, {}, 'Bad Gateway')).toThrow(
      MobileApiFormDataError,
    );

    try {
      throwMobileApiFormDataError(502, {}, 'Bad Gateway');
    } catch (error) {
      expect(error).toBeInstanceOf(MobileApiFormDataError);
      const err = error as MobileApiFormDataError;
      expect(err.status).toBe(502);
      expect(err.responsePreview).toBe('Bad Gateway');
    }
  });
});

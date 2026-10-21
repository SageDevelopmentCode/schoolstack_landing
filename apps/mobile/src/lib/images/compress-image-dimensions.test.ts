import {
  computeScaledDimensions,
  shouldSkipImageCompression,
} from '@/lib/images/compress-image-dimensions';

describe('computeScaledDimensions', () => {
  it('returns original size when within bounds', () => {
    expect(computeScaledDimensions(800, 600, 2048, 2048)).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('scales down preserving aspect ratio', () => {
    expect(computeScaledDimensions(4000, 2000, 2048, 2048)).toEqual({
      width: 2048,
      height: 1024,
    });
  });

  it('never returns zero dimensions', () => {
    expect(computeScaledDimensions(1, 5000, 2048, 2048)).toEqual({
      width: 1,
      height: 2048,
    });
  });
});

describe('shouldSkipImageCompression', () => {
  it('skips when file is at or below threshold', () => {
    expect(shouldSkipImageCompression(300 * 1024, 300 * 1024)).toBe(true);
    expect(shouldSkipImageCompression(100 * 1024, 300 * 1024)).toBe(true);
  });

  it('compresses when file is above threshold', () => {
    expect(shouldSkipImageCompression(301 * 1024, 300 * 1024)).toBe(false);
  });

  it('does not skip when size is unknown', () => {
    expect(shouldSkipImageCompression(null, 300 * 1024)).toBe(false);
  });
});

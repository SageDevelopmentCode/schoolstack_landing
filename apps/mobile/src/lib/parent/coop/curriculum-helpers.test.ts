import { curriculumGuideLabel, formatGuideFileSize } from '@/lib/parent/coop/curriculum-helpers';

describe('curriculum-helpers', () => {
  it('prefers the display name', () => {
    expect(curriculumGuideLabel({ displayName: ' Autumn guide ', fileName: 'x.pdf' })).toBe('Autumn guide');
  });

  it('tidies raw file names', () => {
    expect(curriculumGuideLabel({ displayName: null, fileName: 'Math 6 Book 1_1.2_compressed.pdf' })).toBe(
      'Math 6 Book 1 1.2',
    );
    expect(curriculumGuideLabel({ displayName: '', fileName: 'CompressedAutumn Curriculum.pdf' })).toBe(
      'Autumn Curriculum',
    );
  });

  it('formats file sizes', () => {
    expect(formatGuideFileSize(null)).toBeNull();
    expect(formatGuideFileSize(64 * 1024 * 1024)).toBe('64 MB');
    expect(formatGuideFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    expect(formatGuideFileSize(820 * 1024)).toBe('820 KB');
  });
});

import { parseChooseSchoolSlugsParam } from '@/lib/auth/parse-choose-school-slugs-param';

describe('parseChooseSchoolSlugsParam', () => {
  it('returns null for missing or blank input', () => {
    expect(parseChooseSchoolSlugsParam(undefined)).toBeNull();
    expect(parseChooseSchoolSlugsParam('')).toBeNull();
    expect(parseChooseSchoolSlugsParam('   ')).toBeNull();
  });

  it('parses comma-separated slugs', () => {
    expect(parseChooseSchoolSlugsParam('school-a,school-b')).toEqual([
      'school-a',
      'school-b',
    ]);
    expect(parseChooseSchoolSlugsParam(' school-a , school-b ')).toEqual([
      'school-a',
      'school-b',
    ]);
  });

  it('uses the first element when param is an array', () => {
    expect(parseChooseSchoolSlugsParam(['a,b', 'ignored'])).toEqual(['a', 'b']);
  });
});

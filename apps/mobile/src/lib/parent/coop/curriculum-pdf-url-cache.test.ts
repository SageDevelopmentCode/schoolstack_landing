import {
  clearCurriculumPdfUrlCache,
  getCachedCurriculumPdfUrl,
  setCachedCurriculumPdfUrl,
} from '@/lib/parent/coop/curriculum-pdf-url-cache';

const payload = (expiresInSeconds: number) => ({
  url: 'https://storage.example/book.pdf?token=1',
  fileName: 'book.pdf',
  fileSizeBytes: 1024,
  expiresInSeconds,
});

describe('curriculum-pdf-url-cache', () => {
  beforeEach(() => clearCurriculumPdfUrlCache());

  it('reuses a URL until a minute before it expires', () => {
    setCachedCurriculumPdfUrl('p', 'c', payload(600), 0);
    expect(getCachedCurriculumPdfUrl('p', 'c', 500_000)?.url).toContain('book.pdf');
    expect(getCachedCurriculumPdfUrl('p', 'c', 541_000)).toBeNull();
  });

  it('keys by program and curriculum', () => {
    setCachedCurriculumPdfUrl('p', 'c', payload(600), 0);
    expect(getCachedCurriculumPdfUrl('p', 'other', 1)).toBeNull();
    expect(getCachedCurriculumPdfUrl('other', 'c', 1)).toBeNull();
  });

  it('skips URLs that are about to expire', () => {
    setCachedCurriculumPdfUrl('p', 'c', payload(30), 0);
    expect(getCachedCurriculumPdfUrl('p', 'c', 1)).toBeNull();
  });
});

import {
  appendLocalFileToFormData,
  LocalFileReadError,
} from '@/lib/upload/append-local-file-to-form-data';

describe('appendLocalFileToFormData', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appends a Blob with filename when fetch succeeds', async () => {
    const blob = new Blob(['photo-bytes'], { type: 'image/jpeg' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    }) as typeof fetch;

    const formData = new FormData();
    await appendLocalFileToFormData(formData, 'file', {
      uri: 'file:///tmp/photo.jpg',
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const parts = formData.getAll('file');
    expect(parts).toHaveLength(1);
    expect(parts[0]).toBeInstanceOf(Blob);
    expect(global.fetch).toHaveBeenCalledWith('file:///tmp/photo.jpg');
  });

  it('throws LocalFileReadError when fetch is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      blob: () => Promise.resolve(new Blob()),
    }) as typeof fetch;

    const formData = new FormData();
    await expect(
      appendLocalFileToFormData(formData, 'file', {
        uri: 'file:///missing.jpg',
        name: 'missing.jpg',
        type: 'image/jpeg',
      }),
    ).rejects.toBeInstanceOf(LocalFileReadError);
  });
});

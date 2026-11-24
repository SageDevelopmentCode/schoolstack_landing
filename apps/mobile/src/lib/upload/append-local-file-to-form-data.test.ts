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
  it.each(['content://media/external/images/media/1', 'file:///data/user/0/app/cache/a.png'])(
    'reads %s through fetch and appends a Blob, never a { uri } part',
    async (uri) => {
      const blob = new Blob(['bytes'], { type: 'image/png' });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob),
      }) as typeof fetch;

      const formData = new FormData();
      await appendLocalFileToFormData(formData, 'attachments', {
        uri,
        name: 'a.png',
        type: 'image/png',
      });

      const part = formData.getAll('attachments')[0];
      expect(part).toBeInstanceOf(Blob);
      expect(part).not.toHaveProperty('uri');
      expect(global.fetch).toHaveBeenCalledWith(uri);
    },
  );

  it.each(['application/octet-stream', ''])(
    'uses the picker type when the fetched blob type is %p (Android)',
    async (blobType) => {
      const blob = new Blob(['jpeg-bytes'], { type: blobType });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob),
      }) as typeof fetch;

      const formData = new FormData();
      await appendLocalFileToFormData(formData, 'files', {
        uri: 'content://media/picker/0/1000047910',
        name: '1000047910.jpg',
        type: 'image/jpeg',
      });

      const part = formData.getAll('files')[0] as Blob;
      expect(part.type).toBe('image/jpeg');
      expect(part.size).toBe(blob.size);
    },
  );

  it('keeps a specific blob type even if the picker type differs', async () => {
    const blob = new Blob(['png-bytes'], { type: 'image/png' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    }) as typeof fetch;

    const formData = new FormData();
    await appendLocalFileToFormData(formData, 'files', {
      uri: 'file:///tmp/a.png',
      name: 'a.png',
      type: 'application/octet-stream',
    });

    expect((formData.getAll('files')[0] as Blob).type).toBe('image/png');
  });
});

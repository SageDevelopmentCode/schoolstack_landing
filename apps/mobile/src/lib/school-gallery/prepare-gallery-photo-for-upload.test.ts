const mockRequireOptionalNativeModule = jest.fn();

jest.mock('expo', () => ({
  requireOptionalNativeModule: (name: string) => mockRequireOptionalNativeModule(name),
}));

jest.mock('expo-image-manipulator', () => {
  throw new Error("Cannot find native module 'ExpoImageManipulator'");
});

import { prepareGalleryPhotoForUpload } from '@/lib/school-gallery/prepare-gallery-photo-for-upload';

describe('prepareGalleryPhotoForUpload', () => {
  beforeEach(() => {
    mockRequireOptionalNativeModule.mockReturnValue(null);
  });

  it('prepares a large photo without native compression instead of throwing compression_unavailable', async () => {
    const asset = {
      uri: 'file:///large.jpg',
      width: 4032,
      height: 3024,
      fileSize: 5_000_000,
      mimeType: 'image/jpeg',
      fileName: 'hike.jpg',
    };

    const prepared = await prepareGalleryPhotoForUpload(asset, 0);

    expect(prepared).toEqual({
      uri: asset.uri,
      name: 'hike.jpg',
      type: 'image/jpeg',
    });
  });

  it('still rejects files over the gallery size limit', async () => {
    const asset = {
      uri: 'file:///huge.jpg',
      fileSize: 11 * 1024 * 1024,
      mimeType: 'image/jpeg',
      fileName: 'huge.jpg',
    };

    await expect(prepareGalleryPhotoForUpload(asset, 0)).rejects.toMatchObject({
      code: 'too_large',
    });
  });
});

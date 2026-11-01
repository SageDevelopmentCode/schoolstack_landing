const mockRequireOptionalNativeModule = jest.fn();
const mockManipulateAsync = jest.fn();
let mockManipulatorLoadCount = 0;

jest.mock('expo', () => ({
  requireOptionalNativeModule: (name: string) => mockRequireOptionalNativeModule(name),
}));

jest.mock('expo-image-manipulator', () => {
  mockManipulatorLoadCount += 1;
  return {
    manipulateAsync: (...args: unknown[]) => mockManipulateAsync(...args),
    SaveFormat: { JPEG: 'jpeg' },
  };
});

import { compressImageForUpload } from '@/lib/images/compress-image-for-upload';

const options = { maxWidth: 1000, maxHeight: 1000, quality: 0.8 };

const asset = {
  uri: 'file:///photo.png',
  width: 4000,
  height: 3000,
  fileSize: 5_000_000,
  mimeType: 'image/png',
  fileName: 'photo.png',
};

describe('compressImageForUpload', () => {
  beforeEach(() => {
    mockRequireOptionalNativeModule.mockReset();
    mockManipulateAsync.mockReset();
    mockManipulatorLoadCount = 0;
  });

  it('returns the original asset without loading expo-image-manipulator when the native module is missing', async () => {
    mockRequireOptionalNativeModule.mockReturnValue(null);

    const result = await compressImageForUpload(asset, options);

    expect(mockRequireOptionalNativeModule).toHaveBeenCalledWith('ExpoImageManipulator');
    expect(mockManipulatorLoadCount).toBe(0);
    expect(mockManipulateAsync).not.toHaveBeenCalled();
    expect(result).toEqual({
      uri: asset.uri,
      width: 4000,
      height: 3000,
      mimeType: 'image/png',
      fileName: 'photo.png',
    });
  });

  it('compresses with expo-image-manipulator when the native module is available', async () => {
    mockRequireOptionalNativeModule.mockReturnValue({});
    mockManipulateAsync.mockResolvedValue({ uri: 'file:///out.jpg', width: 1000, height: 750 });

    const result = await compressImageForUpload(asset, options);

    expect(mockManipulateAsync).toHaveBeenCalledWith(
      asset.uri,
      [{ resize: { width: 1000, height: 750 } }],
      { compress: 0.8, format: 'jpeg' },
    );
    expect(result).toEqual({
      uri: 'file:///out.jpg',
      width: 1000,
      height: 750,
      mimeType: 'image/jpeg',
      fileName: 'photo.jpg',
    });
  });
});

const mockConstants: {
  expoConfig: { version?: string } | null;
  nativeAppVersion: string | null;
  nativeBuildVersion: string | null;
} = {
  expoConfig: { version: '1.0.0' },
  nativeAppVersion: '1.0.0',
  nativeBuildVersion: '42',
};

const mockUpdates: Record<string, unknown> = {
  updateId: 'update-abc',
  channel: 'production',
  runtimeVersion: '1.0.0',
  isEmbeddedLaunch: false,
};

const mockDevice: Record<string, unknown> = {
  osVersion: '14',
  modelName: 'Pixel 7',
};

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    {
      get: (_target, key: string) => (mockConstants as Record<string, unknown>)[key],
    },
  ),
}));

jest.mock('expo-updates', () => ({
  get updateId() {
    return mockUpdates.updateId;
  },
  get channel() {
    return mockUpdates.channel;
  },
  get runtimeVersion() {
    return mockUpdates.runtimeVersion;
  },
  get isEmbeddedLaunch() {
    return mockUpdates.isEmbeddedLaunch;
  },
}));

jest.mock('expo-device', () => ({
  get osVersion() {
    return mockDevice.osVersion;
  },
  get modelName() {
    return mockDevice.modelName;
  },
}));

import {
  getMobileBuildInfo,
  mobileSentryDist,
  mobileSentryTags,
} from '@/lib/mobile-build-info';

describe('getMobileBuildInfo', () => {
  beforeEach(() => {
    mockConstants.expoConfig = { version: '1.0.0' };
    mockConstants.nativeAppVersion = '1.0.0';
    mockConstants.nativeBuildVersion = '42';
    mockUpdates.updateId = 'update-abc';
    mockUpdates.channel = 'production';
    mockUpdates.runtimeVersion = '1.0.0';
    mockUpdates.isEmbeddedLaunch = false;
    mockDevice.osVersion = '14';
    mockDevice.modelName = 'Pixel 7';
  });

  it('reports the binary, OTA update, and device', () => {
    expect(getMobileBuildInfo()).toEqual({
      appVersion: '1.0.0',
      buildNumber: '42',
      updateId: 'update-abc',
      updateChannel: 'production',
      runtimeVersion: '1.0.0',
      isEmbeddedLaunch: false,
      osVersion: '14',
      deviceModel: 'Pixel 7',
    });
  });

  it('omits the update id on an embedded launch and ignores blank values', () => {
    mockUpdates.updateId = null;
    mockUpdates.channel = '  ';
    mockUpdates.isEmbeddedLaunch = true;
    mockConstants.nativeBuildVersion = null;

    const info = getMobileBuildInfo();
    expect(info.updateId).toBeUndefined();
    expect(info.updateChannel).toBeUndefined();
    expect(info.buildNumber).toBeUndefined();
    expect(info.isEmbeddedLaunch).toBe(true);
  });

  it('falls back to the native app version when expo config has none', () => {
    mockConstants.expoConfig = null;
    mockConstants.nativeAppVersion = '2.0.0';
    expect(getMobileBuildInfo().appVersion).toBe('2.0.0');
  });
});

describe('Sentry helpers', () => {
  it('uses the build number as dist and the update fields as tags', () => {
    expect(mobileSentryDist()).toBe('42');
    expect(mobileSentryTags()).toEqual({
      update_id: 'update-abc',
      update_channel: 'production',
      runtime_version: '1.0.0',
      embedded_launch: 'false',
    });
  });
});

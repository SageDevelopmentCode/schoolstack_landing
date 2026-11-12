import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Updates from 'expo-updates';

/**
 * Which binary / OTA update a phone is running. Attached to mobile activity + operational error
 * metadata (and Sentry release/dist) so support can answer "what build is this parent on?" from
 * `activity_events` without asking the parent.
 *
 * Every field is optional and every read is guarded: telemetry must never crash the app, and
 * older binaries / Expo Go / Jest simply omit what they cannot read.
 */
export type MobileBuildInfo = {
  appVersion?: string;
  /** iOS CFBundleVersion / Android versionCode. Changes with every store binary. */
  buildNumber?: string;
  /** Active OTA update id, absent when the app launched the embedded (store) bundle. */
  updateId?: string;
  updateChannel?: string;
  runtimeVersion?: string;
  /** True when running the bundle shipped inside the store binary (no OTA applied). */
  isEmbeddedLaunch?: boolean;
  osVersion?: string;
  deviceModel?: string;
};

function clean(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function safe<T>(read: () => T): T | undefined {
  try {
    return read();
  } catch {
    return undefined;
  }
}

export function mobileAppVersion(): string | undefined {
  return clean(Constants.expoConfig?.version) ?? clean(Constants.nativeAppVersion);
}

export function mobileNativeBuildVersion(): string | undefined {
  return clean(Constants.nativeBuildVersion);
}

export function getMobileBuildInfo(): MobileBuildInfo {
  const info: MobileBuildInfo = {};

  const appVersion = mobileAppVersion();
  if (appVersion) info.appVersion = appVersion;

  const buildNumber = mobileNativeBuildVersion();
  if (buildNumber) info.buildNumber = buildNumber;

  const updateId = safe(() => clean(Updates.updateId));
  if (updateId) info.updateId = updateId;

  const updateChannel = safe(() => clean(Updates.channel));
  if (updateChannel) info.updateChannel = updateChannel;

  const runtimeVersion = safe(() => clean(Updates.runtimeVersion));
  if (runtimeVersion) info.runtimeVersion = runtimeVersion;

  const isEmbeddedLaunch = safe(() => Updates.isEmbeddedLaunch);
  if (typeof isEmbeddedLaunch === 'boolean') info.isEmbeddedLaunch = isEmbeddedLaunch;

  const osVersion = safe(() => clean(Device.osVersion));
  if (osVersion) info.osVersion = osVersion;

  const deviceModel = safe(() => clean(Device.modelName));
  if (deviceModel) info.deviceModel = deviceModel;

  return info;
}

/** Sentry `dist`: the store build number, so events from different binaries of one version split. */
export function mobileSentryDist(): string | undefined {
  return mobileNativeBuildVersion();
}

/** Sentry release stays per app version; the OTA update id is attached as a tag instead. */
export function mobileSentryTags(): Record<string, string> {
  const info = getMobileBuildInfo();
  const tags: Record<string, string> = {};
  if (info.updateId) tags.update_id = info.updateId;
  if (info.updateChannel) tags.update_channel = info.updateChannel;
  if (info.runtimeVersion) tags.runtime_version = info.runtimeVersion;
  if (typeof info.isEmbeddedLaunch === 'boolean') {
    tags.embedded_launch = String(info.isEmbeddedLaunch);
  }
  return tags;
}

/**
 * Mobile profile photo uploads are disabled because Expo 57 Winter `fetch`
 * cannot serialize React Native FormData file parts (`{ uri, name, type }`).
 * Users still see their photo; changing it is hidden until a store build (or OTA)
 * includes the Blob conversion in `append-local-file-to-form-data.ts`.
 *
 * Re-enable: set to `true` after that fix is deployed.
 */
export const MOBILE_PROFILE_PHOTO_UPLOAD_ENABLED = false;

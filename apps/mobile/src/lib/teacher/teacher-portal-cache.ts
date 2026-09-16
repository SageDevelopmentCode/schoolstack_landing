export {
  DEFAULT_PORTAL_CACHE_TTL_MS as DEFAULT_TEACHER_PORTAL_CACHE_TTL_MS,
  clearAllPersistedPortalCaches as clearAllPersistedTeacherPortalCaches,
  createPortalCache as createTeacherPortalCache,
  registerPortalMemoryClear as registerTeacherPortalMemoryClear,
  resolvePortalProviderInit as resolveTeacherPortalProviderInit,
  unregisterPortalMemoryClear as unregisterTeacherPortalMemoryClear,
  type PortalCache as TeacherPortalCache,
  type PortalProviderInitResult as TeacherPortalProviderInitResult,
} from '@/lib/portal-cache';

export {
  DEFAULT_PORTAL_CACHE_TTL_MS as DEFAULT_PARENT_PORTAL_CACHE_TTL_MS,
  clearAllPersistedPortalCaches as clearAllPersistedParentPortalCaches,
  createPortalCache as createParentPortalCache,
  registerPortalMemoryClear as registerParentPortalMemoryClear,
  resolvePortalProviderInit as resolveParentPortalProviderInit,
  unregisterPortalMemoryClear as unregisterParentPortalMemoryClear,
  type PortalCache as ParentPortalCache,
  type PortalProviderInitResult as ParentPortalProviderInitResult,
} from '@/lib/portal-cache';

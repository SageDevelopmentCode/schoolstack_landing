type FeaturesWithAdmin = {
  admin?: Record<string, boolean>;
};

export function isSchoolGalleryEnabled(features: FeaturesWithAdmin | null | undefined): boolean {
  return Boolean(features?.admin?.photos);
}

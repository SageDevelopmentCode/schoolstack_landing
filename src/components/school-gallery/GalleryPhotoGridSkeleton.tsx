type GalleryPhotoGridSkeletonProps = {
  count?: number;
};

const GRID_CLASS =
  "grid grid-cols-3 gap-0 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";

export default function GalleryPhotoGridSkeleton({
  count = 12,
}: GalleryPhotoGridSkeletonProps) {
  return (
    <div className={GRID_CLASS} aria-busy="true" aria-label="Loading photos">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="aspect-square animate-pulse rounded-none bg-[#E8ECEE]"
        />
      ))}
    </div>
  );
}

export { GRID_CLASS as galleryPhotoGridClassName };

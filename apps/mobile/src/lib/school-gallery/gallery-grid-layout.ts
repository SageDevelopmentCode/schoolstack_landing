export const GALLERY_GRID_COLUMNS = 3;

export function galleryTileSize(windowWidth: number): number {
  return Math.floor(windowWidth / GALLERY_GRID_COLUMNS);
}

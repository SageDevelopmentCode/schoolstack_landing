/** Image pools for the Garden home options. Copy lives in home-copy.ts. */

export type Photo = { src: string; alt: string; w: number; h: number };

/** Real photos from Sage Field, the microschool MudKitchen was built inside. */
export const SAGEFIELD_PHOTOS = {
  classroom: { src: "/images/sagefield/classroom-main.jpg", alt: "Sage Field's main classroom with wooden tables and open shelves", w: 768, h: 1024 },
  primary: { src: "/images/sagefield/classroom-primary.jpg", alt: "Sage Field's primary classroom", w: 682, h: 1024 },
  entrance: { src: "/images/sagefield/entrance.jpg", alt: "The front porch and flower beds at Sage Field", w: 768, h: 1024 },
  garden: { src: "/images/sagefield/garden.jpg", alt: "Raised garden beds under the trees at Sage Field", w: 768, h: 1024 },
  running: { src: "/images/sagefield/kids-running.jpg", alt: "Kids running across the grass at Sage Field", w: 1024, h: 682 },
  mudKitchen: { src: "/images/sagefield/mud-kitchen.jpg", alt: "Kids playing at the outdoor mud kitchen at Sage Field", w: 576, h: 1024 },
} satisfies Record<string, Photo>;

/** Stock photos (not Sage Field). Used where the page asks for generic school-life imagery. */
export const STOCK_PHOTOS = {
  family: { src: "/images/stock/ImageTen.webp", alt: "Three kids with backpacks walking hand in hand", w: 1600, h: 1067 },
  admin: { src: "/images/stock/Homeschool.webp", alt: "A woman working on a laptop at a kitchen table", w: 1600, h: 1066 },
  teacher: { src: "/images/stock/Homeschool3.webp", alt: "An adult reading with a child at a table", w: 1600, h: 900 },
} satisfies Record<string, Photo>;

export const SAGEFIELD_LIST: Photo[] = Object.values(SAGEFIELD_PHOTOS);

export const SAGEFIELD_LOGO = "/images/SageFieldLogo.png";
export const MUDKITCHEN_LOGO = "/images/Logo.webp";

/** Tape colors cycled across polaroids and notes. */
export const TAPES = ["var(--sf-butter)", "var(--sf-mint)", "var(--sf-sky)", "var(--sf-lav)", "var(--sf-peach)"];

/** Pastel note backgrounds, cycled. */
export const NOTE_TINTS = [
  "bg-[var(--sf-butter)]",
  "bg-[var(--sf-mint)]",
  "bg-[var(--sf-sky)]",
  "bg-[var(--sf-lav)]",
  "bg-[var(--sf-peach)]",
];

/** Transparent cut-out illustrations. */
export const ILLUSTRATIONS = {
  folder: "/images/illustrations/FolderWithLeaf.webp",
  backpack: "/images/illustrations/Backpack.webp",
  notebook: "/images/illustrations/Notebook.webp",
  plant: "/images/illustrations/Plant.webp",
  acorns: "/images/illustrations/Acorns.webp",
  basket: "/images/illustrations/Basket.webp",
  letters: "/images/illustrations/Letters.webp",
  counting: "/images/illustrations/Counting.webp",
  drawing: "/images/illustrations/Drawing.webp",
  tray: "/images/illustrations/Tray.webp",
  beads: "/images/illustrations/Beads.webp",
  pastel: "/images/illustrations/Pastel.webp",
} as const;

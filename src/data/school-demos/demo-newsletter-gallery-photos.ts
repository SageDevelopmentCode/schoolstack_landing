export type DemoNewsletterGalleryPhoto = {
  id: string;
  src: string;
  alt: string;
};

const STOCK = "/images/stock";

export const DEMO_NEWSLETTER_STOCK_GALLERY_PHOTOS: DemoNewsletterGalleryPhoto[] = [
  { id: "stock-1", src: `${STOCK}/ImageOne.webp`, alt: "Students learning together at a table" },
  { id: "stock-2", src: `${STOCK}/ImageTwo.webp`, alt: "Outdoor exploration on the school grounds" },
  { id: "stock-3", src: `${STOCK}/ImageThree.webp`, alt: "Hands-on classroom activity" },
  { id: "stock-4", src: `${STOCK}/ImageFour.webp`, alt: "Small group discussion" },
  { id: "stock-5", src: `${STOCK}/ImageFive.webp`, alt: "Art and creative project" },
  { id: "stock-6", src: `${STOCK}/ImageSix.webp`, alt: "Reading corner in the classroom" },
  { id: "stock-7", src: `${STOCK}/ImageSeven.webp`, alt: "Science experiment at a microschool" },
  { id: "stock-8", src: `${STOCK}/ImageEight.webp`, alt: "Play and movement outdoors" },
  { id: "stock-9", src: `${STOCK}/ImageNine.webp`, alt: "Collaborative building activity" },
  { id: "stock-10", src: `${STOCK}/ImageTen.webp`, alt: "Nature walk with students" },
  { id: "stock-11", src: `${STOCK}/Homeschool.webp`, alt: "Learning at home and school blend" },
  { id: "stock-12", src: `${STOCK}/Homeschool2.webp`, alt: "Family-style microschool moment" },
];

export type ParentNewsletterListItem = {
  id: string;
  title: string;
  week: string;
  weekEnd?: string;
  publishedAt?: string;
  coverImage?: string;
};

export type ParentNewslettersListBundle = {
  editions: ParentNewsletterListItem[];
};

export type ParentNewsletterDetailBundle = {
  htmlDocument: string;
  edition: {
    id: string;
    title: string;
    week: string;
    weekEnd?: string;
  };
};

export class GalleryError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "GalleryError";
    this.code = code;
    this.status = status;
  }
}

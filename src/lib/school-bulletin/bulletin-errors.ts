export class BulletinError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "BulletinError";
    this.code = code;
    this.status = status;
  }
}

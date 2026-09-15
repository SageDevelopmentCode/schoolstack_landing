export class AdmissionsAvailabilityConflictError extends Error {
  status: number;
  code: string;

  constructor(
    message: string,
    options: { status?: number; code?: string } = {},
  ) {
    super(message);
    this.name = "AdmissionsAvailabilityConflictError";
    this.status = options.status ?? 409;
    this.code = options.code ?? "availability_conflict";
  }
}

export const OBSERVATION_SLOT_DUPLICATE_MESSAGE =
  "A slot with the same date, time, and grade group already exists.";

export const OBSERVATION_SLOT_BOOKED_MESSAGE =
  "This slot has a booked visit and can't be removed.";

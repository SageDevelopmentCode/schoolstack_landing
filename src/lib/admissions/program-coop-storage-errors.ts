export class ProgramCoopSignupConflictError extends Error {
  status = 409;
  code = "signup_conflict";

  constructor(message: string) {
    super(message);
    this.name = "ProgramCoopSignupConflictError";
  }
}

export function stringArraysEqual(
  a: ReadonlyArray<string>,
  b: ReadonlyArray<string>,
): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function mergeAssignedFamiliesOnAdminSave(
  serverFamilies: ReadonlyArray<string>,
  savedBaselineFamilies: ReadonlyArray<string>,
  draftFamilies: ReadonlyArray<string>,
): string[] {
  const adminEditedFamilies = !stringArraysEqual(savedBaselineFamilies, draftFamilies);
  return adminEditedFamilies ? [...draftFamilies] : [...serverFamilies];
}

export class ProgramCoopStorageConflictError extends Error {
  status = 409;
  code = "conflict";

  constructor(
    message = "This record was updated elsewhere. Refresh and try again.",
  ) {
    super(message);
    this.name = "ProgramCoopStorageConflictError";
  }
}

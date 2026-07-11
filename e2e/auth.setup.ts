import { test as setup } from "@playwright/test";
import { createAuthStorageStates } from "./fixtures/auth";

setup.setTimeout(60_000);

setup("authenticate test users", async () => {
  await createAuthStorageStates();
});

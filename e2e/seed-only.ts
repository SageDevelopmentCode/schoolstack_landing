import fs from 'node:fs';
import dotenv from 'dotenv';
import { seedE2eDatabase } from './fixtures/seed';

function loadE2eEnv(): void {
  if (fs.existsSync('.env.e2e.local')) {
    dotenv.config({ path: '.env.e2e.local', override: true });
    return;
  }

  if (process.env.CI || process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  dotenv.config({ path: '.env.e2e.example', override: false });
}

async function main(): Promise<void> {
  loadE2eEnv();
  await seedE2eDatabase();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

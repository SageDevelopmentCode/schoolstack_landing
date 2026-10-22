import { execSync } from "node:child_process";
import {
  buildE2eWebServerEnv,
  loadE2eDotenv,
  resolveE2eBaseUrl,
} from "../e2e/web-server-env";

loadE2eDotenv();

const baseURL = resolveE2eBaseUrl();
const webServerEnv = buildE2eWebServerEnv(baseURL);

execSync("npm run build", {
  stdio: "inherit",
  env: {
    ...process.env,
    ...webServerEnv,
  },
});

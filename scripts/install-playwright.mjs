import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["playwright", "install", "chromium", "--only-shell"];

const env = {
  ...process.env,
  PLAYWRIGHT_BROWSERS_PATH: "0",
  PLAYWRIGHT_SKIP_BROWSER_GC: "1",
};

const result = spawnSync(command, args, {
  stdio: "inherit",
  env,
});

if (result.error) {
  throw result.error;
}

if (typeof result.status === "number" && result.status !== 0) {
  process.exit(result.status);
}

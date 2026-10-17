import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const child = spawn(
  process.execPath,
  [
    require.resolve("@tauri-apps/cli/tauri.js"),
    "build",
    "--no-bundle",
    "--config",
    resolve("apps/tauri/tauri.personal.conf.json"),
    ...process.argv.slice(2),
    "--",
    "--no-default-features",
    "--locked",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CONNECT_AUTH_URL: "",
      CONNECT_AUTH_PUBLISHABLE_KEY: "",
    },
  },
);

child.on("error", (error) => {
  console.error(`Personal Finance build failed: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});

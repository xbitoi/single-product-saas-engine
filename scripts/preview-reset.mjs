// Preview DB reset: wipes the embedded PGlite directory and re-bootstraps it
// from prisma/pglite-init.sql, then seeds the demo product + orders.
// Use this after an abrupt dev-server kill that corrupted the data directory
// (symptom: "RuntimeError: Aborted()" / PGlite failed to initialize).
import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const dir = resolve(process.cwd(), process.env.PGLITE_DIR || "./.pglite");
rmSync(dir, { recursive: true, force: true });
console.log("Removed preview database at", dir);

const result = spawnSync(
  process.execPath,
  [resolve(process.cwd(), "scripts", "preview-db.mjs")],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);

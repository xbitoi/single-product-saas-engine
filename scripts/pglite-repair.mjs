// Repairs a PGlite data directory after the dev server was killed abruptly.
// A hard kill (Stop-Process -Force / taskkill) leaves a stale postmaster.pid
// behind, which makes the next PGlite open abort with "RuntimeError: Aborted()".
// Run this BEFORE starting the dev server. Safe when no server is running.
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), process.env.PGLITE_DIR || "./.pglite");
const pidFile = resolve(dir, "postmaster.pid");

if (!existsSync(dir)) {
  console.log("PGlite dir not found (nothing to repair):", dir);
  process.exit(0);
}

if (!existsSync(pidFile)) {
  console.log("No stale lock found. PGlite dir is clean:", dir);
  process.exit(0);
}

const raw = readFileSync(pidFile, "utf8").split("\n")[0]?.trim();
const pid = Number(raw);

let alive = false;
if (Number.isFinite(pid) && pid > 0) {
  try {
    process.kill(pid, 0);
    alive = true;
  } catch {
    alive = false;
  }
}

if (alive) {
  console.log(`PGlite lock is held by a live process (pid ${pid}). Leaving it.`);
  process.exit(0);
}

rmSync(pidFile, { force: true });
console.log(`Removed stale PGlite lock (dead pid ${raw || "?"}) from ${dir}`);

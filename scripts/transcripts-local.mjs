// Local runner for transcript fetching — run on your own PC (whose IP is NOT
// blocked by YouTube). Loads credentials from .env.local, uses the bundled
// bin/yt-dlp.exe if present, and drains the whole backlog.
//
//   npm run transcripts
//
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Load .env.local into process.env (without overriding anything already set)
const envPath = path.join(root, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// The fetch script expects SUPABASE_URL; .env.local stores it as NEXT_PUBLIC_SUPABASE_URL
process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

// Prefer the bundled Windows yt-dlp binary if it's there
const localYt = path.join(root, "bin", "yt-dlp.exe");
if (existsSync(localYt)) process.env.YTDLP_BIN = localYt;

// Local mode: keep going until the whole backlog is processed
process.env.TRANSCRIPT_LOOP = process.env.TRANSCRIPT_LOOP ?? "1";
process.env.TRANSCRIPT_BATCH = process.env.TRANSCRIPT_BATCH || "100";

await import("./fetch-transcripts.mjs");

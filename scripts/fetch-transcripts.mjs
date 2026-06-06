// Fetches Arabic auto-subtitles for videos that don't have a transcript yet,
// using yt-dlp, and stores the cleaned text in Supabase.
// Runs in a GitHub Action (see .github/workflows/transcripts.yml).
//
// Env:
//   SUPABASE_URL                 (= your NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY
//   TRANSCRIPT_BATCH             (optional, default 40)

import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { readFile, readdir, rm, mkdtemp } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const parsedBatch = parseInt(process.env.TRANSCRIPT_BATCH || "40", 10);
const BATCH = Number.isFinite(parsedBatch) && parsedBatch > 0 ? Math.min(parsedBatch, 200) : 40;

// How to invoke yt-dlp. On CI we run it as a python module to avoid PATH issues:
//   YTDLP_BIN=python  YTDLP_PRE="-m yt_dlp"
const YTDLP_BIN = process.env.YTDLP_BIN || "yt-dlp";
const YTDLP_PRE = (process.env.YTDLP_PRE || "").split(" ").filter(Boolean);
const COOKIES = existsSync("cookies.txt") ? ["--cookies", "cookies.txt"] : [];

if (!SUPABASE_URL || !KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
console.log(`yt-dlp via: ${YTDLP_BIN} ${YTDLP_PRE.join(" ")} | cookies: ${COOKIES.length ? "yes" : "no"}`);

const supabase = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });

/** Convert a YouTube .vtt subtitle file to clean, de-duplicated plain text. */
function vttToText(vtt) {
  const out = [];
  for (let line of vtt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("WEBVTT") || t.includes("-->") || /^\d+$/.test(t)) continue;
    if (/^(Kind|Language):/i.test(t)) continue;
    const clean = t.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!clean) continue;
    if (out.length && out[out.length - 1] === clean) continue; // drop consecutive duplicates
    out.push(clean);
  }
  // Drop "rolling" lines that are just a prefix of the next line (auto-caption artifact)
  const dedup = [];
  for (let i = 0; i < out.length; i++) {
    const cur = out[i], nxt = out[i + 1];
    if (nxt && nxt.startsWith(cur)) continue;
    dedup.push(cur);
  }
  return dedup.join(" ").replace(/\s+/g, " ").trim();
}

async function setStatus(id, fields) {
  await supabase.from("videos")
    .update({ ...fields, transcript_fetched_at: new Date().toISOString() })
    .eq("id", id);
}

/** Process one video; returns "ok" | "none" | "error". */
async function processVideo(v) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "sub-"));
  try {
    execFileSync(YTDLP_BIN, [
      ...YTDLP_PRE,
      "--skip-download", "--write-auto-subs", "--write-subs",
      "--sub-langs", "ar", "--sub-format", "vtt",
      ...COOKIES,
      "--no-warnings", "--no-progress", "--retries", "3", "--socket-timeout", "30",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "-o", path.join(dir, "v.%(ext)s"),
      `https://www.youtube.com/watch?v=${v.youtube_id}`,
    ], { stdio: ["ignore", "ignore", "pipe"], timeout: 120000 });

    const files = await readdir(dir);
    const vttFile = files.find((f) => f.endsWith(".vtt"));

    if (vttFile) {
      const text = vttToText(await readFile(path.join(dir, vttFile), "utf8"));
      if (text.length > 20) {
        await setStatus(v.id, { transcript: text, transcript_status: "ok" });
        console.log(`ok    ${v.youtube_id}  (${text.length} chars)`);
        return "ok";
      }
    }
    await setStatus(v.id, { transcript_status: "none" });
    console.log(`none  ${v.youtube_id}  (no subtitles)`);
    return "none";
  } catch (e) {
    const stderr = e && e.stderr ? e.stderr.toString() : "";
    const msg = stderr || (e && e.message) || "";
    const lines = msg.split("\n").map((l) => l.trim()).filter(Boolean);
    const reason = lines.find((l) => /^ERROR/i.test(l)) || lines[lines.length - 1] || "(no output)";
    if (/no subtitles|requested format is not available|members-only|unavailable|video is private/i.test(msg)) {
      await setStatus(v.id, { transcript_status: "none" });
      console.log(`none  ${v.youtube_id}  (${reason.slice(0, 90)})`);
      return "none";
    }
    await setStatus(v.id, { transcript_status: "error" });
    console.log(`ERROR ${v.youtube_id}  ${reason.slice(0, 160)}`);
    return "error";
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function main() {
  const loop = process.env.TRANSCRIPT_LOOP === "1"; // local mode: drain the whole backlog
  const attempted = new Set();
  const totals = { ok: 0, none: 0, error: 0 };

  while (true) {
    const { data: videos, error } = await supabase
      .from("videos")
      .select("id, youtube_id, title")
      .or("transcript_status.is.null,transcript_status.eq.error")
      .limit(BATCH);
    if (error) { console.error("Supabase query failed:", error.message); process.exit(1); }

    const fresh = (videos || []).filter((v) => !attempted.has(v.id));
    if (fresh.length === 0) break; // nothing new left to do

    for (const v of fresh) {
      attempted.add(v.id);
      const r = await processVideo(v);
      totals[r]++;
    }
    console.log(`-- progress: ok=${totals.ok} none=${totals.none} error=${totals.error} (attempted ${attempted.size}) --`);

    if (!loop) break; // CI mode: one batch per run
  }

  console.log(`\nDone. ok=${totals.ok} none=${totals.none} error=${totals.error}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

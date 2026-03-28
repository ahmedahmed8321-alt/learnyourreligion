import { NextResponse } from "next/server";
import { parseQuestion } from "@/lib/telegram";
import { getSupabaseAdmin } from "@/lib/supabase";

/** GET = register the webhook with Telegram */
export async function GET(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const url = new URL(req.url);
  const webhookUrl = `${url.origin}/api/telegram/webhook`;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: ["message", "channel_post"],
      }),
    }
  );
  const data = await res.json();
  return NextResponse.json({ webhookUrl, telegram: data });
}

export async function POST(req: Request) {
  // Verify Telegram webhook secret
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = await req.json();
    const parsed = parseQuestion(update);

    // Ignore non-message updates or empty messages
    if (!parsed) return NextResponse.json({ ok: true });

    const supabase = getSupabaseAdmin();

    // Parse Q&A from message text
    // Lines starting with س = question, lines starting with ج = answer
    const { question, answer } = splitQA(parsed.text);

    // Ignore if no question found
    if (!question) return NextResponse.json({ ok: true });

    const { error } = await supabase.from("qa").insert({
      question,
      answer: answer || null,
      source: "telegram",
      telegram_message_id: parsed.messageId,
      published: false, // Admin reviews before publishing
    });

    if (error) {
      console.error("Supabase insert error:", error);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Split a Telegram message into question and answer.
 * Question starts with س (or س: / س/ etc.)
 * Answer starts with ج (or ج: / ج/ etc.)
 * If no markers found, the whole text is treated as a question.
 */
function splitQA(text: string): { question: string; answer: string | null } {
  // Match lines/sections starting with س or ج (with optional : or - after)
  const qMatch = text.match(/^س[\s:\/\-]*(.+)/m);
  const aMatch = text.match(/^ج[\s:\/\-]*([\s\S]+)/m);

  if (qMatch && aMatch) {
    // Both Q and A found — extract each part
    const qIndex = text.indexOf(qMatch[0]);
    const aIndex = text.indexOf(aMatch[0]);

    let question: string;
    let answer: string;

    if (qIndex < aIndex) {
      // Q comes first, A comes after
      question = text.substring(qIndex, aIndex).replace(/^س[\s:\/\-]*/, "").trim();
      answer = text.substring(aIndex).replace(/^ج[\s:\/\-]*/, "").trim();
    } else {
      // A comes first (unusual but handle it)
      answer = text.substring(aIndex, qIndex).replace(/^ج[\s:\/\-]*/, "").trim();
      question = text.substring(qIndex).replace(/^س[\s:\/\-]*/, "").trim();
    }

    return { question, answer: answer || null };
  }

  if (qMatch) {
    // Only Q marker, no A
    return { question: qMatch[1].trim(), answer: null };
  }

  // No markers — treat the whole message as a question
  return { question: text.trim(), answer: null };
}

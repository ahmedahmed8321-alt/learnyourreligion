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

    // Save question — admin will answer it from the panel
    const { error } = await supabase.from("qa").insert({
      question: parsed.text,
      answer: null,
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

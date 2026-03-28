import { NextResponse } from "next/server";
import { parseMessage, downloadTelegramFile } from "@/lib/telegram";
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
    const parsed = parseMessage(update);

    // Ignore non-message updates
    if (!parsed) return NextResponse.json({ ok: true });

    const supabase = getSupabaseAdmin();

    // Upload voice file to Supabase Storage if present
    let audioUrl: string | null = null;
    if (parsed.voiceFileId) {
      audioUrl = await uploadVoice(parsed.voiceFileId, supabase);
    }

    // ── Reply to existing message ──────────────────────────────
    if (parsed.replyToMessageId) {
      const { data: existing } = await supabase
        .from("qa")
        .select("id, answer, audio_url")
        .eq("telegram_message_id", parsed.replyToMessageId)
        .single();

      if (existing) {
        const updateData: Record<string, any> = {};

        // Append text to answer
        if (parsed.text) {
          const newText = parsed.text.replace(/^ج[\s:\/\-]*/, "").trim();
          updateData.answer = existing.answer
            ? `${existing.answer}\n${newText}`
            : newText;
        }

        // Set audio URL (new audio replaces old)
        if (audioUrl) {
          updateData.audio_url = audioUrl;
        }

        if (Object.keys(updateData).length > 0) {
          await supabase.from("qa").update(updateData).eq("id", existing.id);
        }

        return NextResponse.json({ ok: true });
      }
    }

    // ── New message (not a reply) ──────────────────────────────
    if (parsed.text) {
      // Parse Q&A from message text
      const { question, answer } = splitQA(parsed.text);
      if (!question) return NextResponse.json({ ok: true });

      await supabase.from("qa").insert({
        question,
        answer: answer || null,
        audio_url: audioUrl,
        source: "telegram",
        telegram_message_id: parsed.messageId,
        published: false,
      });
    } else if (audioUrl) {
      // Voice-only message (no text) — save as a question placeholder
      await supabase.from("qa").insert({
        question: "(رسالة صوتية)",
        answer: null,
        audio_url: audioUrl,
        source: "telegram",
        telegram_message_id: parsed.messageId,
        published: false,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Upload a Telegram voice file to Supabase Storage */
async function uploadVoice(fileId: string, supabase: any): Promise<string | null> {
  try {
    const file = await downloadTelegramFile(fileId);
    if (!file) return null;

    const ext = file.mime === "audio/mpeg" ? "mp3" : file.mime === "audio/mp4" ? "m4a" : "ogg";
    const fileName = `voice-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("summaries")
      .upload(`voices/${fileName}`, file.buffer, {
        contentType: file.mime,
        upsert: false,
      });

    if (error) {
      console.error("Voice upload error:", error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("summaries")
      .getPublicUrl(`voices/${fileName}`);

    return publicUrl;
  } catch (err) {
    console.error("Voice download/upload error:", err);
    return null;
  }
}

/**
 * Split a Telegram message into question and answer.
 * Question starts with س, answer starts with ج.
 */
function splitQA(text: string): { question: string; answer: string | null } {
  const qMatch = text.match(/^س[\s:\/\-]*(.+)/m);
  const aMatch = text.match(/^ج[\s:\/\-]*([\s\S]+)/m);

  if (qMatch && aMatch) {
    const qIndex = text.indexOf(qMatch[0]);
    const aIndex = text.indexOf(aMatch[0]);

    let question: string;
    let answer: string;

    if (qIndex < aIndex) {
      question = text.substring(qIndex, aIndex).replace(/^س[\s:\/\-]*/, "").trim();
      answer = text.substring(aIndex).replace(/^ج[\s:\/\-]*/, "").trim();
    } else {
      answer = text.substring(aIndex, qIndex).replace(/^ج[\s:\/\-]*/, "").trim();
      question = text.substring(qIndex).replace(/^س[\s:\/\-]*/, "").trim();
    }

    return { question, answer: answer || null };
  }

  if (qMatch) {
    return { question: qMatch[1].trim(), answer: null };
  }

  return { question: text.trim(), answer: null };
}

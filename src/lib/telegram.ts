const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/** Register webhook URL with Telegram */
export async function setWebhook(webhookUrl: string, secret: string) {
  const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "channel_post"],
    }),
  });
  return res.json();
}

/** Send a message via the bot */
export async function sendMessage(chatId: number | string, text: string) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.json();
}

export interface ParsedMessage {
  messageId: number;
  chatId: number;
  text: string | null;
  voiceFileId: string | null;
  isChannelPost: boolean;
  replyToMessageId: number | null;
}

/** Parse an incoming Telegram update (text, voice, or channel post) */
export function parseMessage(update: any): ParsedMessage | null {
  const message = update?.message ?? update?.channel_post;
  if (!message) return null;

  const hasText = !!message.text;
  const hasVoice = !!(message.voice || message.audio);

  if (!hasText && !hasVoice) return null;

  return {
    messageId: message.message_id,
    chatId: message.chat.id,
    text: message.text ?? message.caption ?? null,
    voiceFileId: message.voice?.file_id ?? message.audio?.file_id ?? null,
    isChannelPost: !!update?.channel_post,
    replyToMessageId: message.reply_to_message?.message_id ?? null,
  };
}

/** Download a file from Telegram by file_id, returns the file as ArrayBuffer + mime type */
export async function downloadTelegramFile(fileId: string): Promise<{ buffer: ArrayBuffer; mime: string } | null> {
  // Step 1: get file path
  const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json();
  if (!fileData.ok || !fileData.result?.file_path) return null;

  const filePath = fileData.result.file_path as string;

  // Step 2: download the file
  const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
  const res = await fetch(downloadUrl);
  if (!res.ok) return null;

  const buffer = await res.arrayBuffer();
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "ogg";
  const mimeMap: Record<string, string> = {
    ogg: "audio/ogg",
    oga: "audio/ogg",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
  };

  return { buffer, mime: mimeMap[ext] ?? "audio/ogg" };
}

// Keep backward compatibility
export const parseQuestion = parseMessage;

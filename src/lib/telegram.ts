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
      allowed_updates: ["message"],
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

/** Parse an incoming Telegram update for a question */
export function parseQuestion(update: any): {
  messageId: number;
  chatId: number;
  text: string;
} | null {
  const message = update?.message;
  if (!message?.text) return null;
  return {
    messageId: message.message_id,
    chatId: message.chat.id,
    text: message.text,
  };
}

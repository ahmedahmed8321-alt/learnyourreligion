import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Target of the PWA share_target in manifest.json.
// WhatsApp (and other apps) POST the shared content here as multipart/form-data.
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;

  const session = await getServerSession(authOptions);
  if (!session) {
    // Not logged in as admin on this device — send to login, share is dropped.
    return NextResponse.redirect(`${origin}/admin/login`, 303);
  }

  try {
    const form = await req.formData();
    const title = (form.get("title") as string) || "";
    const text = (form.get("text") as string) || "";
    const url = (form.get("url") as string) || "";
    const file = form.get("file");

    let audioUrl: string | null = null;
    let imageUrl: string | null = null;

    if (file && typeof file !== "string" && file.size > 0) {
      const supabase = getSupabaseAdmin();
      const isAudio = file.type.startsWith("audio/");
      const isImage = file.type.startsWith("image/");
      const safeName = (file.name || "shared").replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `qa/shared/${Date.now()}-${safeName}`;
      const bytes = await file.arrayBuffer();

      const { error } = await supabase.storage
        .from("summaries")
        .upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false });
      if (!error) {
        const publicUrl = supabase.storage.from("summaries").getPublicUrl(path).data.publicUrl;
        if (isAudio) audioUrl = publicUrl;
        else if (isImage) imageUrl = publicUrl;
        else audioUrl = publicUrl; // unknown type from a voice note → treat as audio
      }
    }

    const sharedText = [title, text, url].filter(Boolean).join(" ").trim();

    const params = new URLSearchParams();
    if (sharedText) params.set("text", sharedText);
    if (audioUrl) params.set("audio", audioUrl);
    if (imageUrl) params.set("image", imageUrl);

    return NextResponse.redirect(`${origin}/admin/share?${params.toString()}`, 303);
  } catch (err) {
    console.error("Share target error:", err);
    return NextResponse.redirect(`${origin}/admin/share?error=1`, 303);
  }
}

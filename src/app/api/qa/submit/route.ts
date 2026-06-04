import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const question = ((form.get("question") as string) ?? "").trim();
    const submitter_name = (form.get("submitter_name") as string) || null;
    const submitter_email = (form.get("submitter_email") as string) || null;
    const user_id = (form.get("user_id") as string) || null;
    const is_private = form.get("is_private") === "true";
    const image = form.get("image") as File | null;

    // A question must have text or an image (or both)
    if (!question && !(image && image.size > 0)) {
      return NextResponse.json({ error: "اكتب سؤالك أو أرفق صورة" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Upload the question image (if any) to the public "summaries" bucket
    let image_url: string | null = null;
    if (image && image.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        return NextResponse.json({ error: "نوع الصورة غير مدعوم (JPG, PNG, GIF, WEBP)" }, { status: 400 });
      }
      if (image.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: "حجم الصورة يتجاوز 10 ميجابايت" }, { status: 400 });
      }

      const safeName = image.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `qa/${Date.now()}-${safeName}`;
      const bytes = await image.arrayBuffer();

      const { error: uploadErr } = await supabase.storage
        .from("summaries")
        .upload(path, bytes, { contentType: image.type, upsert: false });
      if (uploadErr) throw uploadErr;

      image_url = supabase.storage.from("summaries").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("qa").insert({
      question: question || "(سؤال بصورة)",
      submitter_name,
      submitter_email,
      user_id,
      is_private,
      image_url,
      source: "website",
      answer: null,
      published: false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("QA submit error:", err);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}

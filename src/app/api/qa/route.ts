import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("qa")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadQAImage(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  file: File,
  prefix: string,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("نوع الصورة غير مدعوم (JPG, PNG, GIF, WEBP)");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("حجم الصورة يتجاوز 10 ميجابايت");
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `qa/${prefix}/${Date.now()}-${safeName}`;
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("summaries")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("summaries").getPublicUrl(path).data.publicUrl;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const question = ((form.get("question") as string) ?? "").trim();
    const answer = ((form.get("answer") as string) ?? "").trim();
    const section_id = (form.get("section_id") as string) || null;
    const published = form.get("published") === "true";
    const image = form.get("image") as File | null;
    const answerImage = form.get("answer_image") as File | null;

    // A question must have text or an image (or both)
    if (!question && !(image && image.size > 0)) {
      return NextResponse.json({ error: "اكتب السؤال أو أرفق صورة" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    let image_url: string | null = null;
    if (image && image.size > 0) image_url = await uploadQAImage(supabase, image, "manual");

    let answer_image_url: string | null = null;
    if (answerImage && answerImage.size > 0) {
      answer_image_url = await uploadQAImage(supabase, answerImage, "answers");
    }

    const { data, error } = await supabase.from("qa").insert({
      question: question || "(سؤال بصورة)",
      answer: answer || null,
      section_id,
      image_url,
      answer_image_url,
      source: "manual",
      published,
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("QA create error:", err);
    return NextResponse.json({ error: err.message ?? "حدث خطأ" }, { status: 500 });
  }
}

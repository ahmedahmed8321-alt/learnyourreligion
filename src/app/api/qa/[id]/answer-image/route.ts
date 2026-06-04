import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

interface Props { params: { id: string } }

export async function POST(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const image = form.get("image") as File | null;

    if (!image || image.size === 0) {
      return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json({ error: "نوع الصورة غير مدعوم (JPG, PNG, GIF, WEBP)" }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "حجم الصورة يتجاوز 10 ميجابايت" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const safeName = image.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `qa/answers/${Date.now()}-${safeName}`;
    const bytes = await image.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from("summaries")
      .upload(path, bytes, { contentType: image.type, upsert: false });
    if (uploadErr) throw uploadErr;

    const answer_image_url = supabase.storage.from("summaries").getPublicUrl(path).data.publicUrl;

    const { data, error } = await supabase
      .from("qa")
      .update({ answer_image_url })
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("QA answer image upload error:", err);
    return NextResponse.json({ error: err.message ?? "حدث خطأ" }, { status: 500 });
  }
}

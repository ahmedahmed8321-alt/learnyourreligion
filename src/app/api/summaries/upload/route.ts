import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;

    if (!file || !title) {
      return NextResponse.json({ error: "الملف والعنوان مطلوبان" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم. الأنواع المسموحة: PDF, TXT, DOC, DOCX, JPG, PNG, GIF, WEBP" }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يتجاوز 20 ميجابايت" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const bytes = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("summaries")
      .upload(fileName, bytes, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("summaries")
      .getPublicUrl(fileName);

    // Save metadata to DB
    const { data, error } = await supabase.from("summaries").insert({
      title,
      description: description || null,
      category: category || null,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      published: true,
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message ?? "حدث خطأ أثناء الرفع" }, { status: 500 });
  }
}

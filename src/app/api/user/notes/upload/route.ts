import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();

  // Verify user from Authorization header
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const noteId = formData.get("note_id") as string;

    if (!file || !noteId) {
      return NextResponse.json({ error: "file and note_id are required" }, { status: 400 });
    }

    // Verify note belongs to user
    const { data: note } = await supabase
      .from("user_notes")
      .select("id")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf", "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يتجاوز 10 ميجابايت" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `user-notes/${user.id}/${Date.now()}-${safeName}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from("summaries")
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabase.storage
      .from("summaries")
      .getPublicUrl(path);

    const { data: attachment, error: dbErr } = await supabase
      .from("user_attachments")
      .insert({
        user_id: user.id,
        note_id: noteId,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single();

    if (dbErr) throw dbErr;
    return NextResponse.json(attachment, { status: 201 });
  } catch (err: any) {
    console.error("Note upload error:", err);
    return NextResponse.json({ error: err.message ?? "حدث خطأ" }, { status: 500 });
  }
}

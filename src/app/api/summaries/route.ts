import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("summaries").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { oldCategory, newCategory } = await req.json();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("summaries")
    .update({ category: newCategory || null })
    .eq("category", oldCategory);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, file_url } = await req.json();
  const supabase = getSupabaseAdmin();

  // Extract filename from URL and delete from storage
  const fileName = file_url.split("/").pop();
  if (fileName) {
    await supabase.storage.from("summaries").remove([fileName]);
  }

  const { error } = await supabase.from("summaries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

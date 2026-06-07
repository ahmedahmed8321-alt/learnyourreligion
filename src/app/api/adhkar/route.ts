import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("adhkar")
    .select("*")
    .order("category", { ascending: true })
    .order("order_index", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { text, category = "عام", reference = null, virtue = null, repeat_count = 1, order_index = 0, published = true } = body;
  if (!text?.trim()) return NextResponse.json({ error: "نص الذكر مطلوب" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("adhkar").insert({
    text: text.trim(), category, reference, virtue, repeat_count, order_index, published,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

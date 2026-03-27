import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, submitter_name, submitter_email, user_id, is_private } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "السؤال مطلوب" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("qa").insert({
      question: question.trim(),
      submitter_name: submitter_name ?? null,
      submitter_email: submitter_email ?? null,
      user_id: user_id ?? null,
      is_private: is_private ?? false,
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

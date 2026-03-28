"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { UserNote, UserAttachment } from "@/lib/supabase";

type Filter = "all" | "general" | "video";

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // New note form
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // File upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingNoteId, setUploadingNoteId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);

      const res = await fetch("/api/user/notes", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  /** Extract YouTube video ID from URL */
  function extractYoutubeId(url: string): string | null {
    if (!url.trim()) return null;
    const m = url.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);
    return m?.[1] ?? null;
  }

  /** Create a new note */
  async function addNote() {
    if (!content.trim()) return;
    setSaving(true);
    const ytId = extractYoutubeId(videoUrl);

    const res = await fetch("/api/user/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        content,
        video_youtube_id: ytId,
        video_title: ytId ? videoUrl.trim() : null,
      }),
    });

    if (res.ok) {
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setContent("");
      setVideoUrl("");
    }
    setSaving(false);
  }

  /** Update a note */
  async function updateNote(id: string) {
    if (!editContent.trim()) return;
    const res = await fetch(`/api/user/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: editContent }),
    });
    if (res.ok) {
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setEditId(null);
    }
  }

  /** Delete a note */
  async function deleteNote(id: string) {
    if (!confirm("حذف هذه الملاحظة؟")) return;
    const res = await fetch(`/api/user/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  /** Upload a file to a note */
  async function uploadFile(noteId: string, file: File) {
    setUploadingNoteId(noteId);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("note_id", noteId);

    const res = await fetch("/api/user/notes/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (res.ok) {
      const attachment: UserAttachment = await res.json();
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, attachments: [...(n.attachments ?? []), attachment] }
            : n
        )
      );
    }
    setUploadingNoteId(null);
  }

  const filtered = notes.filter((n) => {
    if (filter === "general") return !n.video_youtube_id;
    if (filter === "video") return !!n.video_youtube_id;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        <div className="animate-pulse text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">ملاحظاتي ومتابعة التعلم</h1>
        <Link href="/profile" className="text-sm text-green-600 hover:underline">← حسابي</Link>
      </div>

      {/* Add note form */}
      <div className="bg-white rounded-2xl shadow p-5 mb-8">
        <h2 className="font-semibold text-green-800 mb-3">إضافة ملاحظة جديدة</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="اكتب ملاحظتك هنا..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 resize-none"
        />
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="رابط فيديو يوتيوب (اختياري)"
            dir="ltr"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
          />
          <button
            onClick={addNote}
            disabled={saving || !content.trim()}
            className="bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors shrink-0"
          >
            {saving ? "جاري الحفظ..." : "حفظ الملاحظة"}
          </button>
        </div>
        {videoUrl && extractYoutubeId(videoUrl) && (
          <p className="text-xs text-green-600 mt-2">سيتم ربط الملاحظة بالفيديو</p>
        )}
      </div>

      {/* Filter tabs */}
      {notes.length > 0 && (
        <div className="flex gap-2 mb-5">
          {([
            ["all", "الكل"],
            ["general", "ملاحظات عامة"],
            ["video", "مرتبطة بفيديو"],
          ] as [Filter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                filter === key
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-500 font-medium">
            {notes.length === 0 ? "لم تضف أي ملاحظات بعد" : "لا توجد ملاحظات في هذا التصنيف"}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            أضف ملاحظاتك أثناء تعلمك لتتابع تقدمك
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((note) => (
            <div key={note.id} className={`bg-white rounded-xl shadow p-5 border-r-4 ${note.video_youtube_id ? "border-blue-500" : "border-green-500"}`}>
              {/* Video badge */}
              {note.video_youtube_id && (
                <div className="flex items-center gap-2 mb-3 bg-blue-50 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8z"/>
                    <path d="M9.6 15.6V8.4l6.4 3.6-6.4 3.6z" fill="white"/>
                  </svg>
                  <a
                    href={`https://www.youtube.com/watch?v=${note.video_youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 hover:underline truncate"
                    dir="ltr"
                  >
                    {note.video_title || note.video_youtube_id}
                  </a>
                </div>
              )}

              {/* Note content */}
              {editId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateNote(note.id)} className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-600">حفظ</button>
                    <button onClick={() => setEditId(null)} className="text-gray-500 text-sm hover:text-gray-700">إلغاء</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-loose whitespace-pre-line">{note.content}</p>
              )}

              {/* Attachments */}
              {note.attachments && note.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {note.attachments.map((att) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_name);
                    return (
                      <a
                        key={att.id}
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                      >
                        {isImage ? (
                          <img
                            src={att.file_url}
                            alt={att.file_name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 group-hover:ring-2 group-hover:ring-green-500 transition"
                          />
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 group-hover:border-green-500 transition text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="text-gray-600 truncate max-w-[120px]">{att.file_name}</span>
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-gray-300 text-xs">
                  {new Date(note.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <div className="flex items-center gap-3">
                  {/* Upload file button */}
                  <button
                    onClick={() => {
                      fileRef.current?.setAttribute("data-note-id", note.id);
                      fileRef.current?.click();
                    }}
                    disabled={uploadingNoteId === note.id}
                    className="text-gray-400 hover:text-green-600 text-xs flex items-center gap-1 transition-colors"
                  >
                    {uploadingNoteId === note.id ? (
                      <span className="animate-pulse">جاري الرفع...</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        إرفاق ملف
                      </>
                    )}
                  </button>
                  {editId !== note.id && (
                    <button
                      onClick={() => { setEditId(note.id); setEditContent(note.content); }}
                      className="text-gray-400 hover:text-green-600 text-xs transition-colors"
                    >
                      تعديل
                    </button>
                  )}
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf,.txt,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const noteId = fileRef.current?.getAttribute("data-note-id");
          if (file && noteId) uploadFile(noteId, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Video, Article, QA } from "@/lib/supabase";

async function getContent() {
  const [videosRes, articlesRes, qaRes, vcRes, acRes, qcRes] = await Promise.all([
    supabase.from("videos").select("*").order("published_at", { ascending: false }).limit(6),
    supabase.from("articles").select("*").eq("published", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("qa").select("*").eq("published", true).not("answer", "is", null).order("created_at", { ascending: false }).limit(4),
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("qa").select("*", { count: "exact", head: true }).eq("published", true).not("answer", "is", null),
  ]);
  return {
    videos: (videosRes.data ?? []) as Video[],
    articles: (articlesRes.data ?? []) as Article[],
    qa: (qaRes.data ?? []) as QA[],
    videoCount: vcRes.count ?? 0,
    articleCount: acRes.count ?? 0,
    qaCount: qcRes.count ?? 0,
  };
}

export const revalidate = 3600;

export default async function HomePage() {
  const { videos, articles, qa, videoCount, articleCount, qaCount } = await getContent();

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-green-950 via-green-900 to-green-800 text-white overflow-hidden">
        {/* Islamic pattern overlay */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-20" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-radial-gradient from-green-700/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl scale-110" />
            <Image src="/logo.png" alt="الشيخ محمود لاشين"
              width={120} height={120}
              className="relative rounded-full border-4 border-yellow-400 shadow-2xl object-cover" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-3 leading-tight"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
            تعلم دينك لتنجو وتسعد
          </h1>
          <p className="text-green-200 text-lg font-medium mb-2">الشيخ / محمود لاشين</p>
          <p className="text-green-300 text-base max-w-2xl mx-auto leading-relaxed mt-3">
            موقع يهدف إلى نشر العلم الشرعي النافع من خلال مقاطع ومقالات وفتاوى مبنية على الكتاب والسنة
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/videos"
              className="btn-gold text-base px-8 py-3">
              شاهد المقاطع
            </Link>
            <Link href="/qa"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3 rounded-xl text-base transition-all">
              الأسئلة والأجوبة
            </Link>
            <a href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78"
              target="_blank" rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-xl text-base font-semibold transition-all flex items-center gap-2">
              <WhatsAppIcon className="w-5 h-5" /> انضم للقناة
            </a>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L720 0L1440 40H0Z" fill="#f5f5f5" />
          </svg>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center">
          <StatItem icon="🎬" count={videoCount} label="مقطع مرئي" />
          <StatItem icon="📝" count={articleCount} label="مقال إسلامي" />
          <StatItem icon="💬" count={qaCount} label="سؤال وجواب" />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-20">

        {/* Latest Videos */}
        <section>
          <SectionHeader title="أحدث المقاطع" href="/videos" linkLabel="عرض كل المقاطع" />
          {videos.length === 0 ? (
            <EmptyState message="لا توجد مقاطع بعد — سيتم مزامنتها تلقائياً من قناة اليوتيوب" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          )}
        </section>

        {/* Latest Articles */}
        <section className="bg-green-50/50 rounded-3xl p-6 md:p-10 -mx-4 md:mx-0">
          <SectionHeader title="أحدث المقالات" href="/articles" linkLabel="عرض كل المقالات" />
          {articles.length === 0 ? (
            <EmptyState message="لا توجد مقالات بعد — يمكن للشيخ إضافتها من لوحة التحكم" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </section>

        {/* Latest Q&A */}
        <section>
          <SectionHeader title="أحدث الأسئلة والأجوبة" href="/qa" linkLabel="عرض كل الأسئلة" />
          {qa.length === 0 ? (
            <EmptyState message="لا توجد أسئلة بعد — ستتزامن من بوت التيليغرام تلقائياً" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qa.map((q) => <QACard key={q.id} item={q} />)}
            </div>
          )}
        </section>

        {/* WhatsApp CTA */}
        <div className="relative overflow-hidden bg-gradient-to-l from-green-800 to-green-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
          <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">📲</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">انضم إلى قناة الواتساب</h2>
            <p className="text-green-200 mb-6 max-w-lg mx-auto">
              احصل على أحدث الدروس والمحاضرات والفتاوى مباشرة على هاتفك
            </p>
            <a href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-green-800 font-bold px-8 py-3.5 rounded-full text-lg hover:bg-green-50 transition-colors shadow-lg">
              <WhatsAppIcon className="w-6 h-6 text-green-600" />
              انضم الآن
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Shared components ─────────────────────────────────────────────────────── */

function StatItem({ icon, count, label }: { icon: string; count: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-yellow-600 font-bold text-2xl md:text-3xl">
        {count > 0 ? `+${count.toLocaleString("ar-EG")}` : "—"}
      </span>
      <span className="text-gray-500 text-xs md:text-sm">{label}</span>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-7">
      <h2 className="section-title">{title}</h2>
      <Link href={href}
        className="text-green-700 hover:text-green-600 text-sm font-medium flex items-center gap-1 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition-colors shrink-0">
        {linkLabel}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm">
      {message}
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <a href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
      target="_blank" rel="noopener noreferrer"
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <Image src={video.thumbnail_url} alt={video.title}
          width={480} height={270}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="bg-red-600 text-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </span>
        </div>
        {/* YouTube badge */}
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">
          YouTube
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-relaxed group-hover:text-green-700 transition-colors">
          {video.title}
        </h3>
        <p className="text-gray-400 text-xs mt-2">
          {new Date(video.published_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </a>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Top color bar */}
      <div className="h-1 bg-gradient-to-l from-yellow-400 to-green-600" />
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-green-700 transition-colors leading-relaxed">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed flex-1">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <p className="text-gray-400 text-xs">
            {new Date(article.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <span className="text-green-600 group-hover:text-yellow-600 transition-colors text-sm font-medium">
            اقرأ المزيد ←
          </span>
        </div>
      </div>
    </Link>
  );
}

function QACard({ item }: { item: QA }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 border-r-4 border-yellow-400">
      <div className="flex items-start gap-3 mb-3">
        <span className="shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">س</span>
        <p className="font-semibold text-green-900 text-sm leading-relaxed">{item.question}</p>
      </div>
      {item.answer && (
        <div className="flex items-start gap-3 mr-0">
          <span className="shrink-0 w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-sm font-bold">ج</span>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "w-5 h-5"} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

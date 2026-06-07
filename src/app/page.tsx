import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Video } from "@/lib/supabase";
import VideoEmbedCard from "@/components/VideoEmbedCard";

async function getContent() {
  const [videosRes, vc, ac, qc, dc] = await Promise.all([
    supabase.from("videos").select("*").order("published_at", { ascending: false }).limit(6),
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("qa").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("adhkar").select("*", { count: "exact", head: true }).eq("published", true),
  ]);
  return {
    videos: (videosRes.data ?? []) as Video[],
    videoCount: vc.count ?? 0,
    articleCount: ac.count ?? 0,
    qaCount: qc.count ?? 0,
    adhkarCount: dc.count ?? 0,
  };
}

export const revalidate = 3600;

const FEATURES = [
  { href: "/adhkar", icon: "📿", title: "الأذكار والفوائد", desc: "أذكار يومية وفوائد إيمانية متنوعة" },
  { href: "/qa", icon: "❓", title: "الأسئلة والأجوبة", desc: "إجابات مختصرة على الأسئلة المتكررة" },
  { href: "/articles", icon: "📖", title: "المقالات الشرعية", desc: "مقالات علمية مبنية على الكتاب والسنة" },
  { href: "/videos", icon: "🎬", title: "المقاطع الدعوية", desc: "مقاطع قصيرة في العقيدة والفقه والتزكية" },
];

const TOPICS = ["العقيدة", "الصلاة", "الصيام", "الحجاب", "تربية الأبناء", "الرقية الشرعية"];

const TESTIMONIALS = [
  { name: "أبو محمد", text: "وجدت إجابات لأسئلة كنت أبحث عنها منذ فترة، جزاكم الله خيراً." },
  { name: "محمد أحمد", text: "الموقع منظم جداً والمقاطع مختصرة ومفيدة، بارك الله فيكم." },
  { name: "أحمد علي", text: "استفدت كثيراً من المقاطع المختصرة والمقالات القيمة." },
];

export default async function HomePage() {
  const { videos, videoCount, articleCount, qaCount, adhkarCount } = await getContent();
  const ar = (n: number) => n.toLocaleString("ar-EG");

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-green-950 via-green-900 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-islamic-pattern opacity-20" />
        <div className="absolute inset-0 bg-radial-gradient from-green-700/30 to-transparent" />

        {/* Decorative layer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[340px] bg-yellow-400/10 blur-[110px] rounded-full pointer-events-none" />
        <MihrabArch className="absolute top-5 left-1/2 -translate-x-1/2 w-[470px] max-w-[92%] h-auto opacity-70 pointer-events-none hidden sm:block" />
        <Lantern className="absolute -top-1 right-5 md:right-20 w-9 md:w-12 h-auto pointer-events-none hidden sm:block" style={{ filter: "drop-shadow(0 0 14px rgba(245,158,11,0.55))" }} />
        <Lantern className="absolute -top-1 left-5 md:left-20 w-9 md:w-12 h-auto pointer-events-none hidden sm:block" style={{ filter: "drop-shadow(0 0 14px rgba(245,158,11,0.55))" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl scale-110" />
            <Image src="/logo.png" alt="الشيخ محمود لاشين" width={120} height={120}
              className="relative rounded-full border-4 border-yellow-400 shadow-2xl object-cover" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-3 leading-tight"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
            تعلم دينك لتنجو وتسعد
          </h1>
          <p className="text-green-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            تعلم الإسلام الصحيح من الكتاب والسنة بفهم السلف الصالح
          </p>

          {/* Tag line */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-yellow-200/80 text-xs sm:text-sm mt-4">
            <span>مقاطع دعوية مختصرة</span><span className="text-yellow-500">•</span>
            <span>فتاوى موثقة</span><span className="text-yellow-500">•</span>
            <span>مقالات نافعة</span><span className="text-yellow-500">•</span>
            <span>إجابات على الأسئلة الشرعية</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/videos" className="btn-gold text-base px-8 py-3">شاهد المقاطع</Link>
            <Link href="/qa" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3 rounded-xl text-base transition-all">اسأل سؤالاً</Link>
            <a href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78" target="_blank" rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-xl text-base font-semibold transition-all flex items-center gap-2">
              <WhatsAppIcon className="w-5 h-5" /> انضم لقناة الواتساب
            </a>
          </div>

          {/* Search */}
          <form action="/search" method="GET" className="relative max-w-xl mx-auto mt-8">
            <input name="q" type="text" placeholder="ابحث في المقاطع، قوائم التشغيل، ونصوص الدروس..."
              className="w-full rounded-full px-6 py-3.5 pl-14 text-gray-800 text-base focus:outline-none focus:ring-4 focus:ring-yellow-400/40 shadow-lg" />
            <button type="submit" aria-label="بحث"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-green-700 text-white rounded-full p-2.5 hover:bg-green-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L720 0L1440 40H0Z" fill="#f5f5f5" />
          </svg>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-2xl">✅</span>
            <span className="text-green-800 font-bold text-sm md:text-base leading-tight">محتوى موثق</span>
            <span className="text-gray-500 text-xs">بالكتاب والسنة</span>
          </div>
          <StatItem icon="🎬" count={videoCount} label="مقطع دعوي" />
          <StatItem icon="📝" count={articleCount + qaCount} label="مقال وفتوى" />
          <StatItem icon="📿" count={adhkarCount} label="ذكر وفائدة" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* ── Features ───────────────────────────────────────────────────────── */}
        <section>
          <SectionTitle title="ماذا ستجد في الموقع؟" center />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {FEATURES.map((f) => (
              <Link key={f.href} href={f.href}
                className="group bg-white rounded-2xl p-5 md:p-6 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all border border-gray-100">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-green-800 text-2xl mb-3 group-hover:scale-110 transition-transform">
                  {f.icon}
                </span>
                <h3 className="font-bold text-green-900 text-sm md:text-base">{f.title}</h3>
                <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Latest videos ──────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-7">
            <h2 className="section-title mb-0">أحدث المقاطع</h2>
            <Link href="/videos/all"
              className="text-green-700 hover:text-green-600 text-sm font-medium flex items-center gap-1 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition-colors shrink-0">
              عرض جميع المقاطع
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
          </div>
          {videos.length === 0 ? (
            <EmptyState message="لا توجد مقاطع بعد — سيتم مزامنتها تلقائياً" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((v) => <VideoEmbedCard key={v.id} video={v} variant="home" />)}
            </div>
          )}
        </section>
      </div>

      {/* ── About the Sheikh ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-l from-green-900 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-14">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-lg scale-110" />
              <Image src="/logo.png" alt="الشيخ محمود لاشين" width={150} height={150}
                className="relative rounded-full border-4 border-yellow-400 object-cover shadow-xl" />
            </div>
            <div className="flex-1 text-center md:text-right">
              <p className="text-yellow-400 text-sm mb-1">نبذة عن الشيخ</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">الشيخ / محمود لاشين</h2>
              <p className="text-green-200 leading-loose max-w-2xl">
                داعية وباحث شرعي، يَعنى بنشر العلم النافع المستمد من الكتاب والسنة بفهم السلف الصالح،
                بأسلوب مبسّط يناسب جميع المسلمين. نسأل الله أن يجعل ما يقدّمه خالصاً لوجهه الكريم وأن ينفع به.
              </p>
              <Link href="/about" className="inline-block mt-5 btn-gold text-sm px-6 py-2.5">اقرأ المزيد</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">
        {/* ── Most searched topics ───────────────────────────────────────────── */}
        <section>
          <SectionTitle title="أكثر المواضيع بحثاً" center />
          <div className="flex flex-wrap justify-center gap-3">
            {TOPICS.map((t) => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
                className="bg-white border border-green-200 text-green-800 hover:bg-green-700 hover:text-white hover:border-green-700 px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                <span className="text-yellow-500">◆</span> {t}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────────────────────── */}
        <section>
          <SectionTitle title="آراء الزوار" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl shadow-card p-6 text-center">
                <div className="text-yellow-400 mb-3">★★★★★</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">👤</span>
                  {t.name}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Community CTA ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden bg-gradient-to-l from-green-800 to-green-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
          <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">📲</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">انضم إلى مجتمع تعلم دينك</h2>
            <p className="text-green-200 mb-6 max-w-lg mx-auto">
              لا يفوتك جديد المقاطع والفوائد الدعوية — اشترك الآن ليصلك كل جديد
            </p>
            <a href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-green-800 font-bold px-8 py-3.5 rounded-full text-lg hover:bg-green-50 transition-colors shadow-lg">
              <WhatsAppIcon className="w-6 h-6 text-green-600" /> انضم الآن
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared ────────────────────────────────────────────────────────────────── */

function StatItem({ icon, count, label }: { icon: string; count: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-yellow-600 font-bold text-2xl md:text-3xl">
        {count > 0 ? `+${count.toLocaleString("ar-EG")}` : "—"}
      </span>
      <span className="text-gray-500 text-xs md:text-sm">{label}</span>
    </div>
  );
}

function SectionTitle({ title, center }: { title: string; center?: boolean }) {
  return (
    <div className={`mb-7 ${center ? "text-center" : ""}`}>
      <h2 className="text-2xl font-bold text-green-900 inline-flex items-center gap-3">
        <span className="w-8 h-px bg-gradient-to-l from-yellow-500 to-transparent hidden sm:inline-block" />
        {title}
        <span className="w-8 h-px bg-gradient-to-r from-yellow-500 to-transparent hidden sm:inline-block" />
      </h2>
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

function MihrabArch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 440" className={className} fill="none" preserveAspectRatio="xMidYMin meet" aria-hidden>
      <defs>
        <linearGradient id="archG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="0.75" stopColor="#fbbf24" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Pointed (ogee) mihrab arch */}
      <path d="M40 440 V165 C40 60 200 70 200 18 C200 70 360 60 360 165 V440" stroke="url(#archG)" strokeWidth="2" />
      <path d="M72 440 V175 C72 80 200 90 200 46 C200 90 328 80 328 175 V440" stroke="url(#archG)" strokeWidth="1" opacity="0.6" />
      {/* small finial at apex */}
      <circle cx="200" cy="14" r="3" fill="#fbbf24" opacity="0.6" />
    </svg>
  );
}

function Lantern({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 150" className={className} style={style} fill="none" aria-hidden>
      <defs>
        <linearGradient id="goldL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <radialGradient id="glowL" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#fffbeb" stopOpacity="0.95" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* chain */}
      <line x1="30" y1="0" x2="30" y2="26" stroke="url(#goldL)" strokeWidth="2" />
      <path d="M22 30 h16 l-3 -5 h-10 z" fill="url(#goldL)" />
      {/* body */}
      <path d="M18 34 q12 -7 24 0 v46 q-12 11 -24 0 z" fill="url(#goldL)" />
      {/* inner glow / candle */}
      <ellipse cx="30" cy="58" rx="11" ry="20" fill="url(#glowL)" />
      {/* lattice */}
      <path d="M24 38 v44 M30 36 v48 M36 38 v44" stroke="#7c2d12" strokeWidth="0.7" opacity="0.45" />
      {/* finial */}
      <path d="M26 84 h8 l-2 6 h-4 z" fill="url(#goldL)" />
      <circle cx="30" cy="95" r="2.5" fill="url(#goldL)" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "w-5 h-5"} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

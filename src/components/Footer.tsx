import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-100">
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-yellow-400 font-bold text-xl mb-3">تعلم دينك لتنجو وتسعد</h3>
          <p className="text-green-400 text-sm leading-relaxed mb-4">
            موقع الشيخ محمود لاشين — دروس ومحاضرات وفتاوى إسلامية تهدف إلى نشر العلم النافع المبني على الكتاب والسنة.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-3 mt-4">
            <SocialLink href="https://www.youtube.com/channel/UCv0g_v1C6JcZALvrkDu98AQ" label="يوتيوب"
              className="bg-red-600 hover:bg-red-500">
              <YoutubeIcon />
            </SocialLink>
            <SocialLink href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78" label="واتساب"
              className="bg-green-600 hover:bg-green-500">
              <WhatsAppIcon />
            </SocialLink>
            <SocialLink href="https://t.me/learnyourreligion" label="تيليغرام"
              className="bg-blue-600 hover:bg-blue-500">
              <TelegramIcon />
            </SocialLink>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-base flex items-center gap-2">
            <span className="w-1 h-5 bg-yellow-400 rounded-full inline-block" />
            روابط سريعة
          </h4>
          <ul className="space-y-2.5">
            {[
              { href: "/videos", label: "المقاطع المرئية" },
              { href: "/articles", label: "المقالات الإسلامية" },
              { href: "/qa", label: "الأسئلة والأجوبة" },
              { href: "/summaries", label: "الملخصات" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href}
                  className="text-green-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2 group">
                  <svg className="w-3 h-3 text-green-600 group-hover:text-yellow-400 transition-colors"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Join WhatsApp */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-base flex items-center gap-2">
            <span className="w-1 h-5 bg-yellow-400 rounded-full inline-block" />
            انضم إلينا
          </h4>
          <a href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-800 hover:bg-green-700 rounded-xl p-4 transition-colors group mb-3">
            <span className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <WhatsAppIcon />
            </span>
            <div>
              <p className="text-white font-semibold text-sm">قناة الواتساب</p>
              <p className="text-green-400 text-xs">احصل على أحدث الدروس</p>
            </div>
          </a>
          <a href="https://t.me/learnyourreligion"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-800 hover:bg-green-700 rounded-xl p-4 transition-colors group">
            <span className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <TelegramIcon />
            </span>
            <div>
              <p className="text-white font-semibold text-sm">قناة التيليغرام</p>
              <p className="text-green-400 text-xs">للأسئلة والفتاوى</p>
            </div>
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-500">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} — الشيخ محمود لاشين</span>
          <Link href="/login" className="hover:text-green-300 transition-colors">تسجيل الدخول</Link>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, className, children }: {
  href: string; label: string; className: string; children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${className}`}>
      {children}
    </a>
  );
}

function TelegramIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.993 15.537l-.396 5.582c.567 0 .813-.244 1.108-.537l2.657-2.542 5.51 4.03c1.01.557 1.723.264 1.995-.934l3.615-16.94.001-.001c.319-1.48-.535-2.058-1.52-1.69L1.515 9.423c-1.46.568-1.438 1.38-.248 1.748l5.94 1.853 13.787-8.696c.65-.427 1.24-.19.754.237" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

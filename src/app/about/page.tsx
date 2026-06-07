import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "عن الشيخ — تعلم دينك لتنجو وتسعد" };

export default function AboutPage() {
  return (
    <div>
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-1">عن الشيخ</h1>
          <p className="text-green-300 text-sm">نبذة تعريفية بفضيلة الشيخ محمود لاشين</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Photo (placeholder — replace /sheikh.png with the Sheikh's real photo) */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-lg scale-110" />
              <Image src="/logo.png" alt="الشيخ محمود لاشين" width={140} height={140}
                className="relative rounded-full border-4 border-yellow-400 object-cover shadow-lg" />
            </div>

            <div className="flex-1 text-center sm:text-right">
              <h2 className="text-2xl font-bold text-green-900">الشيخ / محمود لاشين</h2>
              <p className="text-green-600 text-sm mt-1">داعية وباحث في العلوم الشرعية</p>

              <div className="mt-5 space-y-4 text-gray-700 leading-loose text-[15px]">
                <p>
                  داعية إلى الله على بصيرة، يَعنى بنشر العلم الشرعي النافع المستمد من الكتاب والسنة بفهم
                  السلف الصالح، بأسلوب مبسّط ميسّر يناسب جميع المسلمين.
                </p>
                <p>
                  له العديد من الدروس والمحاضرات والخطب في التفسير والعقيدة والفقه والتزكية، إضافةً إلى
                  الإجابة على أسئلة المستمعين وفتاواهم، وقد جُمع كثيرٌ من ذلك في هذا الموقع ليسهل الوصول إليه
                  والاستفادة منه.
                </p>
                <p className="text-gray-500 text-sm bg-gray-50 rounded-lg p-3">
                  نسأل الله أن يجعل ما يقدّمه الشيخ خالصاً لوجهه الكريم، وأن ينفع به الإسلام والمسلمين.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 justify-center sm:justify-start">
                <Link href="/videos" className="btn-gold text-sm px-6 py-2.5">شاهد المقاطع</Link>
                <Link href="/qa" className="bg-green-700 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">اسأل الشيخ</Link>
                <a href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78" target="_blank" rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">قناة الواتساب</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

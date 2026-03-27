import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-green-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-green-900 mb-3">الصفحة غير موجودة</h2>
      <p className="text-gray-500 mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
      <Link href="/" className="bg-green-700 text-white px-6 py-2.5 rounded-full hover:bg-green-600 transition-colors">
        العودة للرئيسية
      </Link>
    </div>
  );
}

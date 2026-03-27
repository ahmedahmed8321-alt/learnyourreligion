import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata = { title: "لوحة التحكم — الشيخ محمود لاشين" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto min-w-0">{children}</div>
    </div>
  );
}

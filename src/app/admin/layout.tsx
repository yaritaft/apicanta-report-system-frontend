"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated()) {
      router.replace("/admin/login");
    } else {
      setChecked(true);
    }
  }, [isLoginPage, router]);

  if (!checked) return null;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-64">
        <div className="p-6 pt-16 md:pt-6">{children}</div>
      </main>
    </div>
  );
}

"use client";

import { useWorldStore } from "@/store/worldStore";

export default function ContentArea({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarCollapsed = useWorldStore((s) => s.sidebarCollapsed);

  return (
    <div
      className={`transition-[margin] duration-300 ${
        sidebarCollapsed ? "" : "lg:ml-[200px]"
      }`}
    >
      {children}
    </div>
  );
}

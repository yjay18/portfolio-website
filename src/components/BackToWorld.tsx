"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorldStore } from "@/store/worldStore";

export default function BackToWorld() {
  const router = useRouter();
  const sidebarCollapsed = useWorldStore((s) => s.sidebarCollapsed);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") router.push("/");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <Link
      href="/"
      className={`fixed top-4 z-50 flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] border border-gray-700 rounded text-sm text-white hover:bg-white/10 transition-all duration-300 left-16 ${
        sidebarCollapsed ? "lg:left-16" : "lg:left-[216px]"
      }`}
    >
      Back to World
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buildings, type Zone } from "@/data/buildings";
import { useWorldStore } from "@/store/worldStore";

const zoneLabels: Record<Zone, { label: string; color: string }> = {
  projects: { label: "Projects", color: "text-green-400" },
  publications: { label: "Research Papers", color: "text-purple-400" },
  personal: { label: "About Me", color: "text-blue-400" },
};

const zoneOrder: Zone[] = ["projects", "publications", "personal"];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    requestTeleport,
  } = useWorldStore();

  function handleBuildingClick(
    e: React.MouseEvent,
    buildingId: string,
    route: string,
  ) {
    e.preventDefault();
    setSidebarOpen(false);

    if (pathname === "/") {
      requestTeleport(buildingId);
    } else {
      router.push(route);
    }
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-[var(--bg-surface)] rounded border border-gray-700"
        aria-label="Toggle navigation"
      >
        <span className="block w-5 h-0.5 bg-white mb-1" />
        <span className="block w-5 h-0.5 bg-white mb-1" />
        <span className="block w-5 h-0.5 bg-white" />
      </button>

      {/* Desktop expand button (visible when collapsed) */}
      <button
        onClick={toggleSidebarCollapsed}
        className={`fixed top-4 left-4 z-50 hidden lg:flex items-center justify-center w-8 h-8 bg-[var(--bg-surface)] rounded border border-gray-700 text-[var(--text-muted)] hover:text-white transition-all duration-300 ${sidebarCollapsed
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
          }`}
        aria-label="Expand navigation"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full w-[200px] bg-[var(--bg-deep)]/90 backdrop-blur-sm border-r border-gray-800 z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${sidebarCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0"}`}
        role="navigation"
        aria-label="Site navigation"
      >
        <div className="p-4 pt-16 lg:pt-4 overflow-y-auto h-full">
          {/* Desktop header with collapse toggle */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Navigate
            </h2>
            <button
              onClick={toggleSidebarCollapsed}
              className="p-1 text-[var(--text-muted)] hover:text-white transition-colors"
              aria-label="Collapse navigation"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          {/* Mobile header */}
          <h2 className="lg:hidden text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Navigate
          </h2>

          {zoneOrder.map((zone) => (
            <div key={zone} className="mb-4">
              <h3
                className={`text-xs font-bold uppercase tracking-wider mb-2 ${zoneLabels[zone].color}`}
              >
                {zoneLabels[zone].label}
              </h3>
              <ul className="space-y-1">
                {buildings
                  .filter((b) => b.zone === zone)
                  .map((b) => {
                    const isActive = pathname === b.route;
                    return (
                      <li key={b.id}>
                        <a
                          href={b.route}
                          onClick={(e) =>
                            handleBuildingClick(e, b.id, b.route)
                          }
                          className={`block px-2 py-1 rounded text-sm transition-colors ${isActive
                              ? "bg-white/10 text-white font-medium"
                              : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                            }`}
                        >
                          {b.name}
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}

          {pathname !== "/" && (
            <Link
              href="/"
              className="block mt-6 px-3 py-2 bg-white/10 rounded text-center text-sm text-white hover:bg-white/20 transition-colors"
            >
              Back to World
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

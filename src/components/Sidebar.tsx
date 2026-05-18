"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorldStore } from "@/store/worldStore";

type SidebarSection = "projects" | "research" | "personal";

interface SidebarChild {
  label: string;
  route?: string;
  buildingId?: string;
  href?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  children: SidebarChild[];
}

const sectionLabels: Record<SidebarSection, { label: string; color: string }> = {
  projects: { label: "Projects", color: "text-green-400" },
  research: { label: "Research", color: "text-purple-400" },
  personal: { label: "Personal", color: "text-blue-400" },
};

const sectionOrder: SidebarSection[] = ["projects", "research", "personal"];

const sidebarItems: Record<SidebarSection, SidebarItem[]> = {
  projects: [
    {
      id: "legal-classifier",
      label: "Legal Classifier Project",
      children: [
        {
          label: "Overview",
          route: "/legal-classifier",
          buildingId: "legal-classifier",
        },
      ],
    },
    {
      id: "lora-surgeon-labs",
      label: "LoRASurgeon Research",
      children: [
        {
          label: "Overview",
          route: "/lorasurgeon",
          buildingId: "lora-surgeon-labs",
        },
      ],
    },
  ],
  research: [
    {
      id: "fighting-ring",
      label: "Negotiation Gym",
      children: [
        {
          label: "Paper",
          route: "/colm-paper",
          buildingId: "fighting-ring",
        },
        { label: "Demo", route: "/colm-paper/demo" },
        {
          label: "arXiv",
          href: "https://arxiv.org/abs/2510.04368",
        },
        {
          label: "Code",
          href: "https://github.com/chrishokamp/multi-agent-social-simulation",
        },
      ],
    },
    {
      id: "university-library",
      label: "ICU Hypotension Early Warning System",
      children: [
        {
          label: "Thesis",
          route: "/thesis",
          buildingId: "university-library",
        },
      ],
    },
  ],
  personal: [
    {
      id: "yuuvs-apartment",
      label: "About Me",
      children: [
        {
          label: "Profile",
          route: "/about",
          buildingId: "yuuvs-apartment",
        },
        {
          label: "CV",
          route: "/cv",
        },
      ],
    },
    {
      id: "post-office",
      label: "Contact",
      children: [
        {
          label: "Message",
          route: "/contact",
          buildingId: "post-office",
        },
      ],
    },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    requestTeleport,
  } = useWorldStore();

  function isItemActive(item: SidebarItem) {
    return item.children.some((child) => child.route === pathname);
  }

  function isItemExpanded(item: SidebarItem) {
    return expandedItems[item.id] ?? isItemActive(item);
  }

  function toggleItem(itemId: string) {
    setExpandedItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  }

  function handleInternalClick(
    e: React.MouseEvent,
    route: string,
    buildingId?: string,
  ) {
    setSidebarOpen(false);

    const canUseWorldTeleport =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;

    if (pathname === "/" && buildingId && canUseWorldTeleport) {
      e.preventDefault();
      requestTeleport(buildingId);
    } else if (pathname === route) {
      e.preventDefault();
    } else {
      e.preventDefault();
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

          {sectionOrder.map((section) => (
            <div key={section} className="mb-4">
              <h3
                className={`text-xs font-bold uppercase tracking-wider mb-2 ${sectionLabels[section].color}`}
              >
                {sectionLabels[section].label}
              </h3>
              <ul className="space-y-1">
                {sidebarItems[section].map((item) => {
                  const isActive = isItemActive(item);
                  const isExpanded = isItemExpanded(item);

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm transition-colors ${isActive
                            ? "bg-white/10 text-white font-medium"
                            : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
                          }`}
                        aria-expanded={isExpanded}
                      >
                        <span>{item.label}</span>
                        <span
                          className={`text-xs transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          aria-hidden="true"
                        >
                          {">"}
                        </span>
                      </button>

                      {isExpanded && (
                        <ul className="mt-1 space-y-1 pl-3">
                          {item.children.map((child) => {
                            const isChildActive = child.route === pathname;
                            const className = `block rounded px-2 py-1 text-xs transition-colors ${isChildActive
                                ? "bg-white/10 text-white font-medium"
                                : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
                              }`;

                            return (
                              <li key={`${item.id}-${child.label}`}>
                                {child.href ? (
                                  <a
                                    href={child.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setSidebarOpen(false)}
                                    className={className}
                                  >
                                    {child.label}
                                  </a>
                                ) : (
                                  <Link
                                    href={child.route ?? "#"}
                                    onClick={(e) => {
                                      if (child.route) {
                                        handleInternalClick(
                                          e,
                                          child.route,
                                          child.buildingId,
                                        );
                                      }
                                    }}
                                    className={className}
                                  >
                                    {child.label}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
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

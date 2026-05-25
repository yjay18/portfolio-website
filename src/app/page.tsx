"use client";

import Link from "next/link";
import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Game } from "@/game/Game";

const MOBILE_FALLBACK_QUERY = "(max-width: 767px)";

const mobileSections = [
  {
    label: "Projects",
    accent: "text-green-400",
    items: [
      {
        title: "Legal Classifier",
        description: "US state law passage predictor",
        href: "/legal-classifier",
      },
      {
        title: "LoRASurgeon",
        description: "SAE and LoRA adapter analysis",
        href: "/lorasurgeon",
      },
    ],
  },
  {
    label: "Research",
    accent: "text-purple-400",
    items: [
      {
        title: "Negotiation Gym",
        description: "Multi-agent social simulation paper",
        href: "/colm-paper",
      },
      {
        title: "ICU Early Warning System",
        description: "Hypotension prediction thesis",
        href: "/thesis",
      },
    ],
  },
  {
    label: "Personal",
    accent: "text-blue-400",
    items: [
      {
        title: "About Me",
        description: "Education, skills, and background",
        href: "/about",
      },
      {
        title: "CV",
        description: "Resume and experience",
        href: "/cv",
      },
      {
        title: "Contact",
        description: "Send a message",
        href: "/contact",
      },
    ],
  },
];

function subscribeToMobileFallback(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia(MOBILE_FALLBACK_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMobileFallbackSnapshot() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(MOBILE_FALLBACK_QUERY).matches
  );
}

function getMobileFallbackServerSnapshot() {
  return false;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const router = useRouter();
  const isMobileFallback = useSyncExternalStore(
    subscribeToMobileFallback,
    getMobileFallbackSnapshot,
    getMobileFallbackServerSnapshot,
  );

  const navigate = useCallback(
    (route: string) => router.push(route),
    [router],
  );

  useEffect(() => {
    const isSmallViewport =
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_FALLBACK_QUERY).matches;
    if (isMobileFallback || isSmallViewport) return;
    if (!containerRef.current) return;

    // Strict Mode safety: if a game already exists, destroy it first
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }

    const game = new Game(containerRef.current);
    gameRef.current = game;
    game.setNavigate(navigate);

    // Fix #2: handle async init with error catching
    game.init().catch((err) => {
      console.error("Game init failed:", err);
    });

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [navigate, isMobileFallback]);

  if (isMobileFallback) {
    return <MobileFallback />;
  }

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full bg-[var(--bg-deep)]"
      role="img"
      aria-label="Interactive pixel art portfolio world. Use A/D or Left/Right keys to move, F to interact with buildings. Or use the sidebar to navigate."
    />
  );
}

function MobileFallback() {
  return (
    <main className="min-h-dvh bg-[var(--bg-deep)] px-5 pb-10 pt-24 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-7">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent-amber)]">
            Portfolio
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            Yuuv Jauhari
          </h1>
          <p className="mt-3 max-w-[32ch] text-sm leading-6 text-[var(--text-muted)]">
            Machine learning, research, and interactive systems.
          </p>
        </header>

        <section
          aria-label="Desktop experience note"
          className="rounded-md border border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/10 px-4 py-3"
        >
          <p className="text-sm font-semibold text-[var(--accent-amber)]">
            Best experienced on desktop
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            This site works best, and is fully interactive, on the desktop
            version. Please use desktop for the full experience.
          </p>
        </section>

        <nav aria-label="Mobile portfolio navigation" className="space-y-6">
          {mobileSections.map((section) => (
            <section key={section.label}>
              <h2
                className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] ${section.accent}`}
              >
                {section.label}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-md border border-white/10 bg-[var(--bg-surface)]/80 px-4 py-4 transition-colors active:bg-white/10"
                  >
                    <span className="block text-base font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[var(--text-muted)]">
                      {item.description}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </nav>
      </div>
    </main>
  );
}

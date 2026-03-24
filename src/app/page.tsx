"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Game } from "@/game/Game";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const router = useRouter();

  const navigate = useCallback(
    (route: string) => router.push(route),
    [router],
  );

  useEffect(() => {
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
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-[var(--bg-deep)]"
      role="img"
      aria-label="Interactive pixel art portfolio world. Use A/D keys to walk, E to enter buildings. Or use the sidebar to navigate."
    />
  );
}

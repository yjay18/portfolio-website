"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        message: data.get("message"),
        _hp: data.get("_hp"),
      }),
    });

    if (res.ok) {
      setStatus("sent");
      form.reset();
    } else {
      const body = await res.json();
      setError(body.error || "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="p-6 border border-green-500/30 rounded bg-green-500/10 text-center">
        <p className="text-green-400 font-medium">Message sent.</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          I'll get back to you soon.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 px-4 py-2 text-sm bg-white/10 rounded hover:bg-white/20 transition-colors"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden>
        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm mb-1">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-gray-700 rounded text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-gray-700 rounded text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-gray-700 rounded text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--accent-blue)] transition-colors resize-y"
          placeholder="What's on your mind?"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="px-5 py-2 bg-[var(--accent-blue)] rounded text-sm font-medium text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

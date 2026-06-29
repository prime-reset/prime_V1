"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "white",
        padding: "32px 18px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <button
        onClick={() => router.push("/profile")}
        style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,.1)",
          background: "rgba(255,255,255,.05)",
          color: "white",
        }}
      >
        <ArrowLeft size={20} />
      </button>

      <p style={{ color: "#D4B06A", letterSpacing: 7, marginTop: 28 }}>
        PRIME
      </p>

      <h1 style={{ fontSize: 42, lineHeight: 1, margin: "18px 0 10px" }}>
        Settings
      </h1>

      <p style={{ color: "rgba(255,255,255,.65)" }}>
        Page paramètres PRIME en construction.
      </p>
    </main>
  );
}

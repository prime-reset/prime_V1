"use client";

import { useState } from "react";
import BottomNav from "@/components/Bottonav";

export default function SessionPage() {
  const [discipline, setDiscipline] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "white",
        padding: "32px 20px 120px",
      }}
    >
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>
        <p
          style={{
            color: "#D4B06A",
            letterSpacing: "4px",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          PRIME SESSION
        </p>

        <h1
          style={{
            fontSize: "58px",
            lineHeight: "0.95",
            fontWeight: "800",
            marginBottom: "30px",
          }}
        >
          Session
          <br />
          Trading
        </h1>

        <div
          style={{
            background: "rgba(20,20,20,0.95)",
            border: "1px solid rgba(212,176,106,0.15)",
            borderRadius: "32px",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              color: "#D4B06A",
              fontSize: "20px",
              marginBottom: "12px",
            }}
          >
            Discipline
          </h2>

          <p
            style={{
              color: "#8B8B8B",
              marginBottom: "24px",
              lineHeight: "1.6",
            }}
          >
            Active ton mode discipline avant de commencer ta
            session de trading.
          </p>

          <button
            onClick={() => setDiscipline(true)}
            style={{
              width: "100%",
              background: discipline ? "#1D5128" : "#D4B06A",
              color: discipline ? "#7DFFA1" : "#000",
              border: "none",
              borderRadius: "18px",
              padding: "18px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            {discipline
              ? "🟢 Discipline activée"
              : "Activer ma discipline"}
          </button>
        </div>
      </div>

      <BottomNav active="Session" />
    </main>
  );
}

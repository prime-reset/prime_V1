"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PrimeSyncTestPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function createTestConnection() {
    setLoading(true);
    setResult(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          "Aucune session PRIME active. Connecte-toi d'abord à PRIME."
        );
      }

      const response = await fetch("/api/prime-sync/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          external_account_id: "PRIME-TEST-001",
          account_name: "Compte test PRIME Sync",
          broker_name: "PRIME Test",
          account_currency: "EUR",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur PRIME Sync.");
      }

      setResult(data);
    } catch (error) {
      setResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "460px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#D4B06A",
            fontSize: "11px",
            letterSpacing: "3px",
            fontWeight: "900",
          }}
        >
          PRIME SYNC · TEST
        </p>

        <h1>Connexion test</h1>

        <p
          style={{
            color: "rgba(255,255,255,.55)",
            lineHeight: "1.5",
          }}
        >
          Cette page sert uniquement à tester l'infrastructure
          PRIME Sync.
        </p>

        <button
          onClick={createTestConnection}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "25px",
            padding: "16px",
            border: "none",
            borderRadius: "14px",
            background: "#D4B06A",
            color: "#050505",
            fontWeight: "900",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Connexion en cours..."
            : "Créer la connexion test"}
        </button>

        {result && (
          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              borderRadius: "18px",
              background: "#101010",
              border: "1px solid rgba(255,255,255,.08)",
              overflowWrap: "anywhere",
            }}
          >
            {result.error ? (
              <>
                <strong style={{ color: "#F05B5B" }}>
                  Erreur
                </strong>

                <p>{result.error}</p>
              </>
            ) : (
              <>
                <strong style={{ color: "#6BE28B" }}>
                  Connexion créée ✓
                </strong>

                <p>
                  Compte : {result.trading_account_id}
                </p>

                <p>
                  Token PRIME Sync :
                </p>

                <code
                  style={{
                    display: "block",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "#050505",
                    color: "#D4B06A",
                    wordBreak: "break-all",
                  }}
                >
                  {result.sync_token}
                </code>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PrimeSyncTestPage() {
  const [syncToken, setSyncToken] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState(null);
  const [tradeResult, setTradeResult] = useState(null);

  async function createTestConnection() {
    setConnectionLoading(true);
    setConnectionMessage(null);
    setTradeResult(null);

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
        throw new Error(
          data.error || "Impossible de créer la connexion PRIME Sync."
        );
      }

      setSyncToken(data.sync_token);
      setAccountId(data.trading_account_id);
      setConnectionMessage({
        type: "success",
        text: "Connexion PRIME Sync créée ✓",
      });
    } catch (error) {
      setSyncToken(null);
      setAccountId(null);

      setConnectionMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setConnectionLoading(false);
    }
  }

  async function sendTestTrade() {
    if (!syncToken) {
      setTradeResult({
        type: "error",
        text: "Crée d'abord une connexion PRIME Sync.",
      });
      return;
    }

    setTradeLoading(true);
    setTradeResult(null);

    try {
      const now = new Date();

      const openedAt = new Date(
        now.getTime() - 25 * 60 * 1000
      ).toISOString();

      const closedAt = now.toISOString();

      const response = await fetch("/api/prime-sync/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${syncToken}`,
        },
        body: JSON.stringify({
          external_trade_id: "PRIME-TEST-TRADE-001",
          external_account_id: "PRIME-TEST-001",

          symbol: "NAS100",
          side: "long",
          volume: 1,

          entry_price: 18245.5,
          exit_price: 18310.5,

          opened_at: openedAt,
          closed_at: closedAt,

          gross_pnl: 134,
          commission: -4,
          swap: 0,
          fees: 0,

          stop_loss: 18205.5,
          take_profit: 18310.5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible d'envoyer le trade test."
        );
      }

      setTradeResult({
        type: "success",
        text: "Trade test enregistré dans PRIME ✓",
        data,
      });
    } catch (error) {
      setTradeResult({
        type: "error",
        text: error.message,
      });
    } finally {
      setTradeLoading(false);
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

        <h1
          style={{
            marginBottom: "10px",
          }}
        >
          Test du pipeline
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,.55)",
            lineHeight: "1.5",
          }}
        >
          Test complet de la connexion PRIME Sync jusqu'au
          Journal V2.
        </p>

        <section
          style={{
            marginTop: "30px",
            padding: "20px",
            borderRadius: "20px",
            background: "#101010",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#D4B06A",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: "900",
            }}
          >
            ÉTAPE 1
          </p>

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "20px",
            }}
          >
            Connexion
          </h2>

          <button
            onClick={createTestConnection}
            disabled={connectionLoading}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "10px",
              border: "none",
              borderRadius: "14px",
              background: "#D4B06A",
              color: "#050505",
              fontWeight: "900",
              cursor: "pointer",
            }}
          >
            {connectionLoading
              ? "Connexion en cours..."
              : syncToken
              ? "Recréer la connexion test"
              : "Créer la connexion test"}
          </button>

          {connectionMessage && (
            <div
              style={{
                marginTop: "15px",
                padding: "14px",
                borderRadius: "12px",
                background:
                  connectionMessage.type === "success"
                    ? "rgba(107,226,139,.07)"
                    : "rgba(240,91,91,.07)",
                color:
                  connectionMessage.type === "success"
                    ? "#6BE28B"
                    : "#F05B5B",
                fontWeight: "800",
              }}
            >
              {connectionMessage.text}

              {accountId && (
                <div
                  style={{
                    marginTop: "7px",
                    color: "rgba(255,255,255,.45)",
                    fontSize: "10px",
                    fontWeight: "500",
                  }}
                >
                  Compte test prêt
                </div>
              )}
            </div>
          )}
        </section>

        <section
          style={{
            marginTop: "15px",
            padding: "20px",
            borderRadius: "20px",
            background: "#101010",
            border: "1px solid rgba(255,255,255,.08)",
            opacity: syncToken ? 1 : 0.45,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#D4B06A",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: "900",
            }}
          >
            ÉTAPE 2
          </p>

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "20px",
            }}
          >
            Envoyer un trade
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,.5)",
              fontSize: "12px",
              lineHeight: "1.5",
            }}
          >
            Envoie un faux trade NAS100 dans le même pipeline
            qu'utilisera le futur connecteur de trading.
          </p>

          <button
            onClick={sendTestTrade}
            disabled={!syncToken || tradeLoading}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "10px",
              border: "1px solid rgba(212,176,106,.35)",
              borderRadius: "14px",
              background: syncToken
                ? "rgba(212,176,106,.08)"
                : "rgba(255,255,255,.03)",
              color: syncToken
                ? "#D4B06A"
                : "rgba(255,255,255,.3)",
              fontWeight: "900",
              cursor: syncToken ? "pointer" : "default",
            }}
          >
            {tradeLoading
              ? "Envoi en cours..."
              : "Envoyer le trade test"}
          </button>

          {tradeResult && (
            <div
              style={{
                marginTop: "15px",
                padding: "14px",
                borderRadius: "12px",
                background:
                  tradeResult.type === "success"
                    ? "rgba(107,226,139,.07)"
                    : "rgba(240,91,91,.07)",
                color:
                  tradeResult.type === "success"
                    ? "#6BE28B"
                    : "#F05B5B",
                fontWeight: "800",
              }}
            >
              {tradeResult.text}

              {tradeResult.type === "success" && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "rgba(255,255,255,.5)",
                    fontSize: "11px",
                    lineHeight: "1.5",
                    fontWeight: "500",
                  }}
                >
                  Résultat : {tradeResult.data?.result}
                  <br />
                  PnL net : {tradeResult.data?.net_pnl} €
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

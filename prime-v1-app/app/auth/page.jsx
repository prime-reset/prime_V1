"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { Lock, Mail, UserPlus, LogIn, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setLoading(true);
    setMessage("");

    if (!email || !password) {
      setMessage("Entre ton email et ton mot de passe.");
      setLoading(false);
      return;
    }

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }

    setMessage(
      mode === "signup"
        ? "Compte créé. Redirection vers l’offre PRIME..."
        : "Connexion réussie."
    );

    setTimeout(() => {
      router.push(mode === "signup" ? "/offer" : "/");
    }, 700);

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <style>{`
        * { box-sizing: border-box; }

        html,
        body {
          margin: 0;
          background: #000;
        }

        .auth-page {
          min-height: 100vh;
          color: white;
          padding: 34px 18px;
          font-family: Inter, Arial, sans-serif;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.20) 0%,
              rgba(0,0,0,0.55) 52%,
              rgba(0,0,0,0.92) 100%
            ),
            url("/prime-auth-bg.jpg");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-card {
          width: 100%;
          max-width: 430px;
          border-radius: 32px;
          padding: 26px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.025)),
            rgba(5,5,5,0.86);
          border: 1px solid rgba(214,178,95,0.34);
          box-shadow: 0 28px 80px rgba(0,0,0,0.68);
          backdrop-filter: blur(24px);
        }

        .brand {
          margin: 0;
          text-align: center;
          font-size: 26px;
          letter-spacing: 10px;
          color: rgba(214,178,95,0.98);
          font-weight: 800;
        }

        .badge {
          width: fit-content;
          margin: 18px auto 0;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(214,178,95,0.10);
          border: 1px solid rgba(214,178,95,0.24);
          color: #d6b25f;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .title {
          margin: 18px 0 0;
          text-align: center;
          font-size: 34px;
          line-height: 0.98;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .title span {
          display: block;
          background: linear-gradient(180deg, #fff 0%, #d6b25f 82%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .text {
          margin: 16px 0 22px;
          text-align: center;
          color: rgba(255,255,255,0.68);
          font-size: 14.5px;
          line-height: 1.62;
        }

        .value-list {
          display: grid;
          gap: 9px;
          margin: 0 0 22px;
          padding: 14px;
          border-radius: 22px;
          background: rgba(0,0,0,0.34);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .value-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          line-height: 1.35;
          font-weight: 650;
        }

        .value-item span {
          color: #d6b25f;
          font-weight: 950;
        }

        .tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }

        .tab {
          border-radius: 18px;
          padding: 13px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.34);
          color: rgba(255,255,255,0.58);
          font-weight: 850;
          cursor: pointer;
        }

        .tab.active {
          color: #d6b25f;
          border-color: rgba(214,178,95,0.42);
          background: rgba(214,178,95,0.10);
        }

        .field {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 20px;
          padding: 14px;
          background: rgba(0,0,0,0.42);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .field svg {
          color: #d6b25f;
          flex-shrink: 0;
        }

        .field input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 15px;
        }

        .field input::placeholder {
          color: rgba(255,255,255,0.38);
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin: -2px 0 10px;
        }

        .forgot-link {
          color: rgba(214,178,95,0.92);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .button {
          width: 100%;
          margin-top: 8px;
          border: none;
          border-radius: 22px;
          padding: 17px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #000;
          font-size: 15px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          box-shadow: 0 0 32px rgba(214,178,95,0.22);
          cursor: pointer;
        }

        .button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .message {
          margin: 16px 0 0;
          text-align: center;
          color: rgba(255,255,255,0.74);
          font-size: 13px;
          line-height: 1.45;
        }

        .footer-note {
          margin: 18px 0 0;
          text-align: center;
          color: rgba(255,255,255,0.46);
          font-size: 12px;
          line-height: 1.45;
        }

        .gold {
          color: #d6b25f;
          font-weight: 850;
        }

        @media(max-width: 390px) {
          .auth-page {
            padding: 24px 14px;
          }

          .auth-card {
            padding: 22px;
            border-radius: 28px;
          }

          .title {
            font-size: 30px;
          }
        }
      `}</style>

      <section className="auth-card">
        <p className="brand">PRIME.</p>

        <div className="badge">
          Accès privé traders
        </div>

        <h1 className="title">
          Ton cerveau
          <span>de trader</span>
        </h1>

        <p className="text">
          {mode === "signup"
            ? "Crée ton compte pour accéder à PRIME, choisir ton offre et commencer à construire une discipline de trader plus stable."
            : "Connecte-toi pour retrouver ton cockpit PRIME, ton score de discipline, tes sessions et ta progression."}
        </p>

        <div className="value-list">
          <div className="value-item">
            <span>✓</span>
            <div>Analyse ton comportement, pas seulement ton PnL.</div>
          </div>

          <div className="value-item">
            <span>✓</span>
            <div>Détecte tes patterns : revenge, FOMO, overtrading.</div>
          </div>

          <div className="value-item">
            <span>✓</span>
            <div>Transforme tes erreurs en prescriptions concrètes.</div>
          </div>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
          >
            Créer compte
          </button>

          <button
            type="button"
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            Connexion
          </button>
        </div>

        <div className="field">
          <Mail size={19} />
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <Lock size={19} />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {mode === "login" && (
          <div className="forgot-row">
            <Link href="/forgot-password" className="forgot-link">
              Mot de passe oublié ?
            </Link>
          </div>
        )}

        <button className="button" onClick={handleAuth} disabled={loading}>
          {mode === "signup" ? <UserPlus size={18} /> : <LogIn size={18} />}
          {loading
            ? "Chargement..."
            : mode === "signup"
            ? "Créer mon compte"
            : "Me connecter"}
          {!loading && <ArrowRight size={17} />}
        </button>

        {message && <p className="message">{message}</p>}

        <p className="footer-note">
          {mode === "signup" ? (
            <>
              Après création du compte, tu accèdes à la page d’offre :
              <br />
              <span className="gold">Founder 9,99€</span> ou{" "}
              <span className="gold">Standard 7 jours gratuits</span>.
            </>
          ) : (
            "Tes données PRIME restent liées à ton compte sécurisé."
          )}
        </p>
      </section>
    </main>
  );
}


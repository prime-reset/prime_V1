"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleReset(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Entre l’adresse e-mail associée à ton compte PRIME.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Impossible d’envoyer le lien pour le moment. Réessaie dans quelques instants.");
      return;
    }

    setMessage(
      "Si cette adresse est associée à un compte PRIME, un lien sécurisé vient d’être envoyé."
    );
  }

  return (
    <main className="forgot-page">
      <style>{`
        * { box-sizing: border-box; }

        html,
        body {
          margin: 0;
          background: #000;
        }

        .forgot-page {
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

        .card {
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
          margin: 20px 0 0;
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
          color: #7DFFA1;
          font-size: 13px;
          line-height: 1.45;
        }

        .error {
          margin: 16px 0 0;
          text-align: center;
          color: #ff6868;
          font-size: 13px;
          line-height: 1.45;
        }

        .back-link {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          color: rgba(214,178,95,0.92);
          font-size: 14px;
          font-weight: 750;
          text-decoration: none;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        @media(max-width: 390px) {
          .forgot-page {
            padding: 24px 14px;
          }

          .card {
            padding: 22px;
            border-radius: 28px;
          }

          .title {
            font-size: 30px;
          }
        }
      `}</style>

      <form className="card" onSubmit={handleReset}>
        <p className="brand">PRIME.</p>

        <div className="badge">Sécurité du compte</div>

        <h1 className="title">
          Mot de passe
          <span>oublié ?</span>
        </h1>

        <p className="text">
          Saisis l’adresse e-mail associée à ton compte. PRIME t’enverra un lien sécurisé pour créer un nouveau mot de passe.
        </p>

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

        <button className="button" type="submit" disabled={loading}>
          <Send size={18} />
          {loading ? "Envoi en cours..." : "Envoyer le lien"}
        </button>

        {message && <p className="message">{message}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}

        <Link href="/auth" className="back-link">
          <ArrowLeft size={16} />
          Retour à la connexion
        </Link>
      </form>
    </main>
  );
}


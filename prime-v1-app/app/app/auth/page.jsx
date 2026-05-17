"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Lock, Mail, UserPlus, LogIn } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState("login");
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
        ? "Compte créé. Vérifie ton email si Supabase le demande."
        : "Connexion réussie."
    );

    setTimeout(() => {
      router.push("/");
    }, 700);

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <style>{`
        * { box-sizing: border-box; }

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
              rgba(0,0,0,0.42) 0%,
              rgba(0,0,0,0.68) 45%,
              rgba(0,0,0,0.98) 100%
            ),
            url("/prime-panther-bg.png.png");
          background-size: cover, min(120vw, 860px) auto;
          background-position: center top, center -190px;
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
            rgba(5,5,5,0.82);
          border: 1px solid rgba(214,178,95,0.34);
          box-shadow: 0 28px 80px rgba(0,0,0,0.60);
          backdrop-filter: blur(24px);
        }

        .brand {
          margin: 0;
          text-align: center;
          font-size: 26px;
          letter-spacing: 10px;
          color: rgba(214,178,95,0.98);
          font-weight: 700;
        }

        .title {
          margin: 18px 0 0;
          text-align: center;
          font-size: 36px;
          line-height: 0.95;
          font-weight: 900;
          text-transform: uppercase;
        }

        .title span {
          display: block;
          background: linear-gradient(180deg, #fff 0%, #d6b25f 82%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .text {
          margin: 16px 0 24px;
          text-align: center;
          color: rgba(255,255,255,0.66);
          font-size: 14px;
          line-height: 1.6;
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
          font-weight: 800;
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
          background: rgba(0,0,0,0.40);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .field svg {
          color: #d6b25f;
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
          margin-top: 10px;
          border: none;
          border-radius: 22px;
          padding: 17px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #000;
          font-size: 15px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          box-shadow: 0 0 32px rgba(214,178,95,0.22);
          cursor: pointer;
        }

        .message {
          margin-top: 16px;
          text-align: center;
          color: rgba(255,255,255,0.68);
          font-size: 13px;
          line-height: 1.4;
        }
      `}</style>

      <section className="auth-card">
        <p className="brand">PRIME.</p>

        <h1 className="title">
          Trader
          <span>Account</span>
        </h1>

        <p className="text">
          Connecte-toi pour sauvegarder ton score, ton streak, tes sessions et
          ta progression PRIME dans le cloud.
        </p>

        <div className="tabs">
          <button
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Connexion
          </button>

          <button
            className={`tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Créer compte
          </button>
        </div>

        <div className="field">
          <Mail size={19} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <Lock size={19} />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="button" onClick={handleAuth} disabled={loading}>
          {mode === "signup" ? <UserPlus size={18} /> : <LogIn size={18} />}
          {loading
            ? "Chargement..."
            : mode === "signup"
            ? "Créer mon compte"
            : "Me connecter"}
        </button>

        {message && <p className="message">{message}</p>}
      </section>
    </main>
  );
}

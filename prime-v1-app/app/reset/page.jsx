"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Brain,
  Lock,
  CheckCircle2,
} from "lucide-react";

import BottomNav from "../components/BottomNav";

export default function ResetPage() {
  const [resetActive, setResetActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("prime_reset_active");
    if (saved === "true") setResetActive(true);
  }, []);

  function activateReset() {
    setResetActive(true);
    localStorage.setItem("prime_reset_active", "true");
    localStorage.setItem("prime_reset_started_at", new Date().toISOString());
    localStorage.setItem("prime_discipline_active", "false");
  }

  function completeReset() {
    setResetActive(false);
    localStorage.setItem("prime_reset_active", "false");
  }

  return (
    <main className="reset-page">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #000;
        }

        .reset-page {
          min-height: 100vh;
          color: white;
          padding: 28px 18px 125px;
          font-family: Inter, Arial, sans-serif;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.20) 0%,
              rgba(0,0,0,0.42) 38%,
              rgba(0,0,0,0.88) 78%,
              rgba(0,0,0,1) 100%
            ),
            url("/prime-reset-panther.jpg");

          background-size:
            cover,
            920px auto;

          background-position:
            center,
            center -90px;

          background-repeat: no-repeat;
          overflow-x: hidden;
          position: relative;
        }

        .reset-page::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            radial-gradient(
              circle at 50% 22%,
              rgba(214,178,95,0.18),
              transparent 30%
            ),
            linear-gradient(
              180deg,
              rgba(0,0,0,0.05) 0%,
              rgba(0,0,0,0.42) 52%,
              rgba(0,0,0,0.96) 100%
            );
          pointer-events: none;
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          animation: fadeIn 0.8s ease both;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 26px;
        }

        .back {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          background: rgba(0,0,0,0.46);
          border: 1px solid rgba(214,178,95,0.28);
          backdrop-filter: blur(18px);
        }

        .brand {
          margin: 0;
          font-size: 12px;
          letter-spacing: 5px;
          color: rgba(214,178,95,0.95);
          text-transform: uppercase;
        }

        .hero {
          margin-bottom: 14px;
        }

        .title {
          margin: 0;
          font-size: 48px;
          line-height: 0.85;
          font-weight: 950;
          letter-spacing: -1.6px;
          text-transform: uppercase;
        }

        .title span {
          display: block;
          background: linear-gradient(180deg, #fff 0%, #d6b25f 82%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          margin: 6px 0 0;
          color: rgba(255,255,255,0.72);
          font-size: 15px;
          line-height: 1.7;
        }

        .card {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 24px;
          margin-bottom: 16px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.025)),
            rgba(8,8,8,0.82);
          border: 1px solid rgba(214,178,95,0.22);
          box-shadow: 0 24px 70px rgba(0,0,0,0.58);
          backdrop-filter: blur(24px);
          animation: fadeUp 0.75s ease both;
        }

        .card.active {
          border-color: rgba(214,178,95,0.62);
          box-shadow:
            0 0 42px rgba(214,178,95,0.14),
            0 24px 70px rgba(0,0,0,0.70);
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(214,178,95,0.12), transparent 42%);
          pointer-events: none;
        }

        .card > * {
          position: relative;
          z-index: 1;
        }

        .row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gold-icon {
          width: 54px;
          height: 54px;
          min-width: 54px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d6b25f;
          background: rgba(214,178,95,0.12);
          border: 1px solid rgba(214,178,95,0.22);
        }

        .label {
          margin: 0;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.8px;
          color: rgba(214,178,95,0.95);
        }

        .card-title {
          margin: 6px 0 0;
          font-size: 25px;
          line-height: 1.05;
          font-weight: 900;
          color: white;
        }

        .text {
          margin: 16px 0 0;
          color: rgba(255,255,255,0.72);
          font-size: 14px;
          line-height: 1.65;
        }

        .alert-box {
          margin-top: 16px;
          border-radius: 20px;
          padding: 15px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: rgba(255,70,70,0.09);
          border: 1px solid rgba(255,80,80,0.34);
        }

        .alert-box p {
          margin: 0;
          color: rgba(255,130,130,0.96);
          font-size: 13px;
          line-height: 1.45;
          font-weight: 700;
        }

        .reset-list {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .reset-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          border-radius: 18px;
          padding: 14px;
          background: rgba(0,0,0,0.38);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .reset-item.done {
          border-color: rgba(214,178,95,0.34);
        }

        .item-title {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: white;
        }

        .item-desc {
          margin: 4px 0 0;
          color: rgba(255,255,255,0.58);
          font-size: 12px;
          line-height: 1.45;
        }

        .primary-button,
        .secondary-button {
          width: 100%;
          margin-top: 18px;
          border-radius: 22px;
          padding: 17px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          cursor: pointer;
        }

        .primary-button {
          border: none;
          color: #000;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          box-shadow: 0 0 32px rgba(214,178,95,0.22);
        }

        .secondary-button {
          color: #d6b25f;
          background: rgba(0,0,0,0.42);
          border: 1px solid rgba(214,178,95,0.38);
          box-shadow: 0 0 30px rgba(214,178,95,0.10);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media(max-width:520px) {
          .reset-page {
            background-size:
              cover,
              760px auto;

            background-position:
              center,
              center -60px;
          }

          .title {
            font-size: 44px;
          }
        }
      `}</style>

      <div className="page">
        <div className="topbar">
          <Link href="/" className="back">
            <ArrowLeft size={20} />
          </Link>

          <p className="brand">PRIME RESET</p>

          <div style={{ width: 44 }} />
        </div>

        <section className="hero">
          <h1 className="title">
            Mode
            <span>Reset</span>
          </h1>

          <p className="subtitle">
            Quand ton mental prend le contrôle, PRIME te sort du mode exécution
            et te remet en mode protection.
          </p>
        </section>

        <section className={`card ${resetActive ? "active" : ""}`}>
          <div className="row">
            <div className="gold-icon">
              {resetActive ? <Lock size={25} /> : <RotateCcw size={25} />}
            </div>

            <div>
              <p className="label">
                {resetActive ? "Reset activé" : "Protection mentale"}
              </p>

              <h2 className="card-title">
                {resetActive
                  ? "Exécution suspendue"
                  : "Stopper la dérive avant qu’elle coûte cher"}
              </h2>
            </div>
          </div>

          <p className="text">
            Le mode reset est conçu pour les moments où tu veux te refaire,
            forcer une opportunité, augmenter le risque ou reprendre un trade
            par émotion.
          </p>

          <div className="alert-box">
            <AlertTriangle size={18} color="#ff5c5c" />
            <p>
              Si tu es en tilt, ton objectif n’est plus de trader. Ton objectif
              est de redevenir lucide.
            </p>
          </div>

          {!resetActive ? (
            <button className="primary-button" onClick={activateReset}>
              <RotateCcw size={18} />
              Activer le reset
            </button>
          ) : (
            <button className="secondary-button" onClick={completeReset}>
              <ShieldCheck size={18} />
              Je suis revenue au calme
            </button>
          )}
        </section>

        <section className="card">
          <div className="row">
            <div className="gold-icon">
              <Brain size={25} />
            </div>

            <div>
              <p className="label">Protocole PRIME</p>
              <h2 className="card-title">Récupération comportementale</h2>
            </div>
          </div>

          <div className="reset-list">
            <ResetItem
              done={resetActive}
              title="Stopper l’exécution"
              desc="Aucune nouvelle entrée tant que le mode reset est actif."
            />

            <ResetItem
              done={resetActive}
              title="Identifier l’émotion dominante"
              desc="FOMO, frustration, peur de rater, besoin de se refaire."
            />

            <ResetItem
              done={resetActive}
              title="Réduire l’exposition"
              desc="Tu reprends uniquement quand ton état mental est revenu stable."
            />

            <ResetItem
              done={resetActive}
              title="Revenir au plan"
              desc="Pas de trade sans setup, risque défini et invalidation claire."
            />
          </div>
        </section>

        <section className="card">
          <div className="row">
            <div className="gold-icon">
              <ShieldCheck size={25} />
            </div>

            <div>
              <p className="label">Prescription reset</p>
              <h2 className="card-title">Règle temporaire</h2>
            </div>
          </div>

          <p className="text">
            Après un reset, PRIME recommande une règle stricte : maximum 1 trade
            validé, taille réduite, aucun trade de compensation.
          </p>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

function ResetItem({ title, desc, done }) {
  return (
    <div className={`reset-item ${done ? "done" : ""}`}>
      <CheckCircle2
        size={20}
        color={done ? "#d6b25f" : "rgba(255,255,255,0.35)"}
      />

      <div>
        <p className="item-title">{title}</p>
        <p className="item-desc">{desc}</p>
      </div>
    </div>
  );
}

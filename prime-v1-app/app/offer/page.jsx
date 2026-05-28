"use client";

import Link from "next/link";
import {
  Crown,
  ShieldCheck,
  Brain,
  Flame,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import BottomNav from "../components/BottomNav";

export default function OfferPage() {
  return (
    <main className="offer-page">
      <style>{`
        * { box-sizing: border-box; }

        .offer-page {
          min-height: 100vh;
          padding: 28px 20px 150px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.84),
              rgba(0,0,0,0.98)
            ),
            #000;
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
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
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(212,176,106,0.24);
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 6px;
          font-size: 12px;
          text-transform: uppercase;
        }

        .title {
          font-size: 56px;
          line-height: 0.92;
          font-weight: 950;
          letter-spacing: -3px;
          margin: 0;
        }

        .title span {
          display: block;
          color: #D4B06A;
        }

        .subtitle {
          margin-top: 22px;
          color: rgba(255,255,255,0.70);
          font-size: 18px;
          line-height: 1.7;
        }

        .price-card,
        .card {
          padding: 26px;
          margin-top: 18px;
          border-radius: 34px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 20px 60px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.04);
          backdrop-filter: blur(22px);
        }

        .price-card {
          border-color: rgba(212,176,106,0.38);
          box-shadow:
            0 0 50px rgba(212,176,106,0.10),
            0 24px 70px rgba(0,0,0,0.64);
        }

        .icon-box {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212,176,106,0.10);
          border: 1px solid rgba(212,176,106,0.18);
          color: #D4B06A;
          margin-bottom: 20px;
        }

        .label {
          color: rgba(212,176,106,0.88);
          letter-spacing: 3px;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .card-title {
          font-size: 28px;
          line-height: 1.15;
          font-weight: 900;
          margin: 0;
          color: white;
        }

        .text {
          margin-top: 16px;
          color: rgba(255,255,255,0.70);
          font-size: 16px;
          line-height: 1.7;
        }

        .price {
          margin-top: 18px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .amount {
          font-size: 66px;
          line-height: 0.9;
          font-weight: 950;
          color: #D4B06A;
          letter-spacing: -3px;
        }

        .month {
          color: rgba(255,255,255,0.58);
          font-size: 16px;
          margin-bottom: 8px;
        }

        .public-price {
          margin-top: 12px;
          color: rgba(255,255,255,0.48);
          font-size: 14px;
          line-height: 1.6;
        }

        .cta {
          width: 100%;
          margin-top: 22px;
          border: none;
          border-radius: 22px;
          padding: 18px;
          color: #000;
          font-size: 15px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          cursor: pointer;
          display: block;
          text-align: center;
          text-decoration: none;
          box-shadow: 0 0 32px rgba(212,176,106,0.22);
        }

        .list {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }

        .item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .item p {
          margin: 0;
          color: rgba(255,255,255,0.76);
          font-size: 15px;
          line-height: 1.55;
        }

        .warning {
          margin-top: 18px;
          padding: 16px;
          border-radius: 22px;
          background: rgba(212,176,106,0.08);
          border: 1px solid rgba(212,176,106,0.20);
          color: rgba(255,255,255,0.72);
          font-size: 14px;
          line-height: 1.6;
        }

        @media(max-width:520px) {
          .title { font-size: 48px; }
          .amount { font-size: 58px; }
        }
      `}</style>

      <div className="page">
        <div className="topbar">
          <Link href="/" className="back">
            <ArrowLeft size={20} />
          </Link>

          <div className="brand">PRIME OFFER</div>

          <div style={{ width: 44 }} />
        </div>

        <section>
          <h1 className="title">
            Accès
            <span>Fondateur.</span>
          </h1>

          <p className="subtitle">
            Rejoins PRIME avant le lancement public et construis ta discipline
            avec un système pensé pour les traders qui veulent arrêter de saboter
            leur exécution.
          </p>
        </section>

        <section className="price-card">
          <div className="icon-box">
            <Crown size={28} />
          </div>

          <div className="label">OFFRE AMBASSADEUR</div>

          <h2 className="card-title">Prix fondateur verrouillé</h2>

          <div className="price">
            <div className="amount">9,99€</div>
            <div className="month">/ mois</div>
          </div>

          <p className="public-price">
            Prix public prévu : 24,99€ à 29,99€/mois après la phase fondatrice.
          </p>

          <Link href="/auth" className="cta">
            Rejoindre PRIME
          </Link>

          <div className="warning">
            Accès réservé aux premiers utilisateurs. En échange : feedback
            régulier demandé pour améliorer PRIME rapidement.
          </div>
        </section>

        <section className="card">
          <div className="icon-box">
            <Brain size={26} />
          </div>

          <div className="label">CE QUE PRIME FAIT</div>

          <div className="list">
            <Feature text="Score de discipline basé sur ton comportement, pas seulement ton PnL." />
            <Feature text="Coach comportemental avec diagnostics et prescriptions." />
            <Feature text="Mode Reset pour couper les spirales de revenge trade." />
            <Feature text="Journal automatique pour suivre ton évolution sans effort." />
            <Feature text="Profil PRIME Identity personnalisé, même pour les stratégies non standards." />
          </div>
        </section>

        <section className="card">
          <div className="icon-box">
            <ShieldCheck size={26} />
          </div>

          <div className="label">POUR QUI ?</div>

          <h2 className="card-title">Pour les traders qui savent analyser… mais pas toujours exécuter.</h2>

          <p className="text">
            PRIME n’est pas une formation de trading. C’est un système
            d’exécution comportementale pour reprendre le contrôle sur le FOMO,
            l’overtrading, le revenge trade et le non-respect du plan.
          </p>
        </section>

        <section className="card">
          <div className="icon-box">
            <Sparkles size={26} />
          </div>

          <div className="label">PROMESSE V1</div>

          <h2 className="card-title">Moins de chaos. Plus de process.</h2>

          <p className="text">
            La V1 évoluera rapidement avec les retours des fondateurs.
            L’objectif : construire le meilleur copilote comportemental pour
            traders indépendants.
          </p>
        </section>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

function Feature({ text }) {
  return (
    <div className="item">
      <CheckCircle2 size={20} color="#D4B06A" />
      <p>{text}</p>
    </div>
  );
}

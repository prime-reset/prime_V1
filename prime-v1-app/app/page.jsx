"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Target,
  BarChart3,
  RotateCcw,
  Brain,
  Flame,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Crown,
} from "lucide-react";

import BottomNav from "./components/BottomNav";
import PrimeLevelCard from "./components/PrimeLevelCard";
import DisciplineScoreCard from "./components/DisciplineScoreCard";
import PrimeBadgesCard from "./components/PrimeBadgesCard";
import PrimeCoachInsight from "./components/PrimeCoachInsight";
import CloudProfileCard from "./components/CloudProfileCard";

export default function HomePage() {
  const [disciplineActive, setDisciplineActive] = useState(false);
  const [resetActive, setResetActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState("DISCIPLINED TRADER");

  useEffect(() => {
    setDisciplineActive(
      localStorage.getItem("prime_discipline_active") === "true"
    );

    setResetActive(
      localStorage.getItem("prime_reset_active") === "true"
    );

    setStreak(
      Number(localStorage.getItem("prime_streak") || 0)
    );

    const savedXp = Number(
      localStorage.getItem("prime_xp") || 0
    );

    setXp(savedXp);

    if (savedXp >= 1500) {
      setLevel("INSTITUTIONAL MINDSET");
    } else if (savedXp >= 800) {
      setLevel("ELITE EXECUTION");
    } else {
      setLevel("DISCIPLINED TRADER");
    }
  }, []);

  const homeStatus = resetActive
    ? "MODE RESET"
    : disciplineActive
    ? "DISCIPLINE ACTIVE"
    : "READY";

  const homeMessage = resetActive
    ? "PRIME bloque ton exécution pour protéger ton capital mental."
    : disciplineActive
    ? "Ton cerveau d’exécution est actif. Chaque action impacte ton score."
    : "Active une session pour lancer le suivi comportemental PRIME.";

  return (
    <main className="prime-home">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #000;
        }

        .prime-home {
          position: relative;

          min-height: 100vh;

          overflow-x: hidden;

          padding: 32px 18px 140px;

          color: white;
          font-family: Inter, sans-serif;

          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.08) 0%,
              rgba(0,0,0,0.22) 32%,
              rgba(0,0,0,0.72) 74%,
              rgba(0,0,0,0.96) 100%
            ),

            url("/black-panther-home.jpg");

          background-size:
            cover,
            1200px auto;

          background-position:
            center,
            left -260px top -20px;

          background-repeat: no-repeat;

          background-attachment: scroll;

          background-color: #000;
        }

        .prime-home::before {
          content: "";

          position: fixed;
          inset: 0;

          z-index: 1;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              rgba(0,0,0,0.10) 0%,
              rgba(0,0,0,0.34) 45%,
              rgba(0,0,0,0.82) 100%
            );
        }

        .page {
          position: relative;

          z-index: 2;

          max-width: 460px;

          margin: 0 auto;
        }

        .hero {
          padding-top: 12px;

          margin-bottom: 28px;

          animation: fadeUp 0.8s ease;
        }

        .brand {
          margin: 0;

          color: #D4B06A;

          font-size: 16px;

          letter-spacing: 8px;

          text-transform: uppercase;
        }

        .title {
          margin: 18px 0 0;

          font-size: 62px;

          line-height: 0.9;

          font-weight: 900;

          letter-spacing: -3px;
        }

        .title span {
          display: block;

          color: rgba(255,255,255,0.88);
        }

        .subtitle {
          margin-top: 22px;

          font-size: 18px;

          line-height: 1.6;

          color: rgba(255,255,255,0.72);

          max-width: 92%;
        }

        .hero-level {
          margin-top: 26px;

          display: inline-flex;

          align-items: center;

          gap: 10px;

          padding: 12px 18px;

          border-radius: 999px;

          background: rgba(0,0,0,0.42);

          border: 1px solid rgba(212,176,106,0.30);

          backdrop-filter: blur(12px);
        }

        .hero-level span {
          color: #D4B06A;

          font-size: 13px;

          font-weight: 700;

          letter-spacing: 1px;
        }

        .live-card,
        .card {
          position: relative;

          overflow: hidden;

          border-radius: 34px;

          padding: 24px;

          margin-bottom: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.02)
            ),
            rgba(5,5,5,0.70);

          border: 1px solid rgba(255,255,255,0.08);

          backdrop-filter: blur(22px);

          box-shadow:
            0 20px 60px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.04);

          transition: 0.3s ease;
        }

        .card:hover,
        .live-card:hover {
          transform: translateY(-2px);

          border-color: rgba(212,176,106,0.22);
        }

        .status {
          display: flex;

          align-items: center;

          gap: 16px;
        }

        .icon-box {
          width: 58px;
          height: 58px;

          border-radius: 20px;

          display: flex;

          align-items: center;

          justify-content: center;

          background: rgba(212,176,106,0.10);

          border: 1px solid rgba(212,176,106,0.16);

          color: #D4B06A;
        }

        .label {
          color: rgba(212,176,106,0.92);

          font-size: 12px;

          letter-spacing: 2px;

          text-transform: uppercase;

          margin-bottom: 6px;
        }

        .card-title {
          font-size: 30px;

          line-height: 1;

          font-weight: 900;

          margin: 0;
        }

        .text {
          margin-top: 18px;

          color: rgba(255,255,255,0.70);

          font-size: 16px;

          line-height: 1.7;
        }

        .actions-grid {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 14px;

          margin-bottom: 18px;
        }

        .action-card {
          position: relative;

          overflow: hidden;

          text-decoration: none;

          color: white;

          border-radius: 28px;

          padding: 18px;

          min-height: 120px;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.015)
            ),
            rgba(5,5,5,0.72);

          border: 1px solid rgba(255,255,255,0.08);

          backdrop-filter: blur(22px);

          transition: 0.3s ease;
        }

        .action-card:hover {
          transform: translateY(-3px);

          border-color: rgba(212,176,106,0.30);
        }

        .action-top {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;
        }

        .action-icon {
          width: 48px;
          height: 48px;

          border-radius: 16px;

          display: flex;

          align-items: center;

          justify-content: center;

          background: rgba(212,176,106,0.10);

          color: #D4B06A;
        }

        .arrow {
          color: rgba(255,255,255,0.32);
        }

        .action-label {
          margin-top: 18px;

          color: rgba(212,176,106,0.92);

          font-size: 11px;

          letter-spacing: 2px;

          text-transform: uppercase;
        }

        .action-title {
          margin-top: 8px;

          font-size: 22px;

          line-height: 1.1;

          font-weight: 800;
        }

        .streak-row {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-top: 20px;
        }

        .streak-number {
          font-size: 64px;

          line-height: 1;

          font-weight: 900;

          color: #D4B06A;
        }

        .streak-sub {
          color: rgba(255,255,255,0.64);

          font-size: 14px;
        }

        .xp-box {
          text-align: right;
        }

        .xp-label {
          color: rgba(255,255,255,0.46);

          font-size: 11px;

          letter-spacing: 2px;
        }

        .xp-number {
          margin-top: 8px;

          font-size: 34px;

          font-weight: 800;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media(max-width: 768px) {
          .prime-home {
            background-size:
              cover,
              980px auto;

            background-position:
              center,
              left -240px top 0px;
          }
        }

     @media(max-width: 520px) {
  .prime-home {
    background-size:
      cover,
      780px auto;

    background-position:
      center,
      left -230px top -130px;
  }

  .title {
    font-size: 52px;
  }
}

       @media(max-width: 390px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 46px;
  }

  .prime-home {
    background-size:
      cover,
      740px auto;

    background-position:
      center,
      left -220px top -120px;
  }
}
      `}</style>

      <div className="page">
        <section className="hero">
          <p className="brand">
            PRIME RESET
          </p>

          <h1 className="title">
            Ton cerveau
            <span>d’exécution.</span>
          </h1>

          <p className="subtitle">
            Discipline comportementale,
            coaching mental et système
            d’exécution pour traders.
          </p>

          <div className="hero-level">
            <Crown
              size={16}
              color="#D4B06A"
            />

            <span>{level}</span>
          </div>
        </section>

        <section className="live-card">
          <div className="status">
            <div className="icon-box">
              {resetActive ? (
                <RotateCcw size={28} />
              ) : disciplineActive ? (
                <ShieldCheck size={28} />
              ) : (
                <Brain size={28} />
              )}
            </div>

            <div>
              <p className="label">
                STATUT PRIME
              </p>

              <h2 className="card-title">
                {homeStatus}
              </h2>
            </div>
          </div>

          <p className="text">
            {homeMessage}
          </p>
        </section>

        <section className="actions-grid">
          <ActionButton
            href="/session"
            icon={<Target size={24} />}
            label="Exécution"
            title="Session"
          />

          <ActionButton
            href="/stats"
            icon={<BarChart3 size={24} />}
            label="Analytics"
            title="Stats"
          />

          <ActionButton
            href="/reset"
            icon={<RotateCcw size={24} />}
            label="Protection"
            title="Reset"
          />

          <ActionButton
            href="/identity"
            icon={<Sparkles size={24} />}
            label="PRIME"
            title="Identity"
          />
        </section>

        <section className="card">
          <div className="status">
            <div className="icon-box">
              <Flame size={28} />
            </div>

            <div>
              <p className="label">
                DISCIPLINE STREAK
              </p>

              <h2 className="card-title">
                {streak} jours disciplinés
              </h2>
            </div>
          </div>

          <div className="streak-row">
            <div>
              <div className="streak-number">
                {streak}
              </div>

              <div className="streak-sub">
                Série actuelle
              </div>
            </div>

            <div className="xp-box">
              <div className="xp-label">
                TOTAL XP
              </div>

              <div className="xp-number">
                {xp}
              </div>
            </div>
          </div>
        </section>

        <CloudProfileCard />

        <DisciplineScoreCard />

        <PrimeLevelCard />

        <PrimeBadgesCard />

        <PrimeCoachInsight />
      </div>

      <BottomNav />
    </main>
  );
}

function ActionButton({
  href,
  icon,
  label,
  title,
}) {
  return (
    <Link
      href={href}
      className="action-card"
    >
      <div className="action-top">
        <div className="action-icon">
          {icon}
        </div>

        <ChevronRight
          size={20}
          className="arrow"
        />
      </div>

      <div>
        <p className="action-label">
          {label}
        </p>

        <h3 className="action-title">
          {title}
        </h3>
      </div>
    </Link>
  );
}

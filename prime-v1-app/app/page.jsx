"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  BarChart3,
  RotateCcw,
  User,
  Flame,
  CalendarDays,
  Trophy,
  ShieldCheck,
  Brain,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

import BottomNav from "./components/BottomNav";
import PrimeLevelCard from "./components/PrimeLevelCard";
import DisciplineScoreCard from "./components/DisciplineScoreCard";
import PrimeBadgesCard from "./components/PrimeBadgesCard";
import PrimeCoachInsight from "./components/PrimeCoachInsight";

export default function HomePage() {
  const [disciplineActive, setDisciplineActive] = useState(false);
  const [resetActive, setResetActive] = useState(false);
  const [streak, setStreak] = useState(4);
  const [xp, setXp] = useState(640);

  useEffect(() => {
    setDisciplineActive(localStorage.getItem("prime_discipline_active") === "true");
    setResetActive(localStorage.getItem("prime_reset_active") === "true");
    setStreak(Number(localStorage.getItem("prime_streak") || 4));
    setXp(Number(localStorage.getItem("prime_xp") || 640));
  }, []);

  const homeStatus = resetActive
    ? "Mode reset actif"
    : disciplineActive
    ? "Discipline activée"
    : "Prête à exécuter";

  const homeMessage = resetActive
    ? "PRIME a suspendu l’exécution. Priorité : retrouver ton calme avant tout nouveau trade."
    : disciplineActive
    ? "Ta session est verrouillée. PRIME suit ton respect du plan, ton streak et ton XP."
    : "Lance ta session pour activer le suivi discipline, XP, streak et coaching PRIME.";

  return (
    <main className="prime-home">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #000;
        }

        .prime-home {
          min-height: 100vh;
          color: white;
          padding: 34px 18px 125px;
          font-family: Inter, Arial, sans-serif;
          background-color: #000;
          background-image:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.36) 0%,
              rgba(0,0,0,0.48) 28%,
              rgba(0,0,0,0.78) 64%,
              rgba(0,0,0,0.99) 100%
            ),
            url("/prime-panther-bg.png.png");
          background-size:
            cover,
            min(112vw, 760px) auto;
          background-position:
            center top,
            center -175px;
          background-repeat: no-repeat;
          background-attachment: scroll;
          overflow-x: hidden;
          position: relative;
          animation: fadeIn 0.8s ease both;
        }

        .prime-home::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 50% 10%, rgba(214,178,95,0.08), transparent 30%),
            linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.42) 45%, rgba(0,0,0,0.96) 100%);
          pointer-events: none;
          z-index: 0;
        }

        .prime-home::after {
          content: "";
          position: fixed;
          inset: 0;
          opacity: 0.035;
          pointer-events: none;
          z-index: 1;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.35) 0 1px, transparent 1px);
          background-size: 7px 7px, 11px 11px;
          mix-blend-mode: screen;
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero {
          text-align: center;
          padding-top: 4px;
          margin-bottom: 26px;
          animation: fadeUp 0.7s ease both;
        }

        .brand {
          margin: 0;
          font-size: 28px;
          letter-spacing: 12px;
          color: rgba(214,178,95,0.98);
          font-weight: 700;
        }

        .title {
          margin: 16px 0 0;
          font-size: 42px;
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: -1.4px;
          text-transform: uppercase;
        }

        .title span {
          display: block;
          background: linear-gradient(180deg, #fff 0%, #d6b25f 78%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          margin: 16px 0 0;
          font-size: 13px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.62);
        }

        .live-card,
        .card {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          padding: 22px;
          margin-bottom: 16px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.02)),
            rgba(5,5,5,0.78);
          border: 1px solid rgba(214,178,95,0.30);
          box-shadow: 0 24px 70px rgba(0,0,0,0.56);
          backdrop-filter: blur(22px);
          animation: fadeUp 0.85s ease both;
          transition: transform 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease, background 0.32s ease;
        }

        .live-card {
          border-color: ${resetActive ? "rgba(255,180,80,0.48)" : disciplineActive ? "rgba(214,178,95,0.52)" : "rgba(214,178,95,0.30)"};
        }

        .card:hover,
        .live-card:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: rgba(214,178,95,0.52);
          box-shadow: 0 0 42px rgba(214,178,95,0.10), 0 24px 70px rgba(0,0,0,0.62);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .action-card {
          min-height: 98px;
          text-decoration: none;
          color: white;
          border-radius: 24px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025)),
            rgba(0,0,0,0.48);
          border: 1px solid rgba(214,178,95,0.34);
          box-shadow: 0 20px 60px rgba(0,0,0,0.50);
          backdrop-filter: blur(20px);
          animation: fadeUp 0.75s ease both;
          transition: transform 0.28s ease, border-color 0.28s ease, background 0.28s ease, box-shadow 0.28s ease;
        }

        .action-card:hover {
          transform: translateY(-3px) scale(1.02);
          border-color: rgba(214,178,95,0.78);
          box-shadow: 0 0 30px rgba(214,178,95,0.13), 0 20px 60px rgba(0,0,0,0.62);
          background:
            linear-gradient(145deg, rgba(214,178,95,0.14), rgba(255,255,255,0.035)),
            rgba(0,0,0,0.55);
        }

        .row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .gold-icon,
        .action-icon {
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

        .action-icon {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 18px;
        }

        .label,
        .action-label {
          margin: 0;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: rgba(214,178,95,0.95);
        }

        .action-label {
          font-size: 11px;
        }

        .card-title {
          margin: 6px 0 0;
          font-size: 26px;
          line-height: 1.05;
          font-weight: 850;
          letter-spacing: -0.6px;
          color: #d6b25f;
          text-transform: uppercase;
        }

        .action-title {
          margin: 4px 0 0;
          font-size: 17px;
          line-height: 1.15;
          font-weight: 700;
          text-transform: uppercase;
        }

        .text {
          margin: 16px 0 0;
          color: rgba(255,255,255,0.70);
          font-size: 14px;
          line-height: 1.6;
        }

        .chevron {
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 50%;
          border: 1px solid rgba(214,178,95,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d6b25f;
        }

        .progress-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 18px 0 7px;
          font-size: 13px;
          color: rgba(255,255,255,0.66);
        }

        .progress {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          box-shadow: 0 0 24px rgba(214,178,95,0.45);
          animation: loadBar 1.15s ease both;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 16px;
        }

        .mini-card {
          border-radius: 18px;
          padding: 13px;
          background: rgba(0,0,0,0.38);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .mini-label {
          margin: 8px 0 0;
          font-size: 11px;
          color: rgba(214,178,95,0.9);
          text-transform: uppercase;
        }

        .mini-value {
          margin: 2px 0 0;
          font-size: 22px;
          font-weight: 850;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes loadBar {
          from { width: 0%; }
        }

        @media (max-width: 430px) {
          .prime-home {
            background-size:
              cover,
              148vw auto;
            background-position:
              center top,
              center -135px;
          }

          .brand {
            font-size: 26px;
            letter-spacing: 10px;
          }
        }

        @media (max-width: 390px) {
          .title { font-size: 36px; }
          .actions-grid { grid-template-columns: 1fr; }

          .prime-home {
            background-size:
              cover,
              158vw auto;
            background-position:
              center top,
              center -115px;
          }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <p className="brand">PRIME.</p>

          <h1 className="title">
            Trading
            <span>Discipline OS</span>
          </h1>

          <p className="subtitle">Discipline. Contrôle. Performance.</p>
        </section>

        <section className="live-card">
          <div className="row">
            <div className="gold-icon">
              {resetActive ? <AlertTriangle size={25} /> : disciplineActive ? <ShieldCheck size={25} /> : <Brain size={25} />}
            </div>

            <div>
              <p className="label">Home vivante</p>
              <h2 className="card-title">{homeStatus}</h2>
            </div>
          </div>

          <p className="text">{homeMessage}</p>
        </section>

        <section className="actions-grid">
          <ActionButton href="/session" icon={<Target size={26} />} label="Commencer" title="Ma session" />
          <ActionButton href="/stats" icon={<BarChart3 size={26} />} label="Voir" title="Mes stats" />
          <ActionButton href="/reset" icon={<RotateCcw size={26} />} label="Mode" title="Reset" />
          <ActionButton href="/onboarding" icon={<User size={26} />} label="Créer mon" title="Profil PRIME" />
        </section>

        <section className="card">
          <div className="between">
            <div className="row">
              <div className="gold-icon">
                <Flame size={28} />
              </div>

              <div>
                <p className="label">Streak PRIME</p>
                <h2 className="card-title">{streak} jours disciplinés</h2>
              </div>
            </div>
          </div>

          <p className="text">
            Ta série se met à jour quand tu actives une session disciplinée.
            PRIME suit ta régularité, pas seulement ton résultat.
          </p>

          <div className="progress-head">
            <span>Objectif semaine</span>
            <span>{Math.min(streak, 5)}/5 jours</span>
          </div>

          <div className="progress">
            <div className="progress-fill" style={{ width: `${Math.min((streak / 5) * 100, 100)}%` }} />
          </div>

          <div className="stats-grid">
            <MiniStat icon={<CalendarDays size={19} />} title="Série" value={`${streak}j`} />
            <MiniStat icon={<Trophy size={19} />} title="XP" value={xp} />
            <MiniStat icon={<ShieldCheck size={19} />} title="Statut" value={resetActive ? "Reset" : "Actif"} />
          </div>
        </section>

        <DisciplineScoreCard />

        <PrimeLevelCard />

        <PrimeBadgesCard />

        <PrimeCoachInsight />
      </div>

      <BottomNav />
    </main>
  );
}

function ActionButton({ href, icon, label, title }) {
  return (
    <Link href={href} className="action-card">
      <div className="row">
        <div className="action-icon">{icon}</div>
        <div>
          <p className="action-label">{label}</p>
          <p className="action-title">{title}</p>
        </div>
      </div>

      <div className="chevron">
        <ChevronRight size={17} />
      </div>
    </Link>
  );
}

function MiniStat({ icon, title, value }) {
  return (
    <div className="mini-card">
      <div style={{ color: "#d6b25f" }}>{icon}</div>
      <p className="mini-label">{title}</p>
      <p className="mini-value">{value}</p>
    </div>
  );
}

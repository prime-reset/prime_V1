"use client";

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
  Crown,
  ChevronRight,
} from "lucide-react";

import BottomNav from "./components/BottomNav";

export default function HomePage() {
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
              rgba(0,0,0,0.08) 0%,
              rgba(0,0,0,0.16) 28%,
              rgba(0,0,0,0.66) 64%,
              rgba(0,0,0,0.98) 100%
            ),
            url("/prime-panther-bg.png.png");
          background-size:
            cover,
            min(120vw, 860px) auto;
          background-position:
            center top,
            center -225px;
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
            radial-gradient(circle at 50% 10%, rgba(214,178,95,0.16), transparent 32%),
            radial-gradient(circle at 50% 22%, rgba(255,255,255,0.05), transparent 28%),
            linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 48%, rgba(0,0,0,0.92) 100%);
          pointer-events: none;
          z-index: 0;
        }

        .prime-home::after {
          content: "";
          position: fixed;
          inset: 0;
          opacity: 0.045;
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
          padding-top: 8px;
          margin-bottom: 28px;
          animation: fadeUp 0.7s ease both;
        }

        .brand {
          margin: 0;
          font-size: 18px;
          letter-spacing: 9px;
          color: rgba(214,178,95,0.95);
          font-weight: 500;
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
            linear-gradient(145deg, rgba(255,255,255,0.105), rgba(255,255,255,0.03)),
            rgba(0,0,0,0.34);
          border: 1px solid rgba(214,178,95,0.36);
          box-shadow: 0 20px 60px rgba(0,0,0,0.46);
          backdrop-filter: blur(20px);
          animation: fadeUp 0.75s ease both;
          transition: transform 0.28s ease, border-color 0.28s ease, background 0.28s ease, box-shadow 0.28s ease;
        }

        .action-card:nth-child(1) { animation-delay: 0.08s; }
        .action-card:nth-child(2) { animation-delay: 0.14s; }
        .action-card:nth-child(3) { animation-delay: 0.20s; }
        .action-card:nth-child(4) { animation-delay: 0.26s; }

        .action-card:hover {
          transform: translateY(-3px) scale(1.02);
          border-color: rgba(214,178,95,0.78);
          box-shadow: 0 0 30px rgba(214,178,95,0.16), 0 20px 60px rgba(0,0,0,0.58);
          background:
            linear-gradient(145deg, rgba(214,178,95,0.18), rgba(255,255,255,0.04)),
            rgba(0,0,0,0.44);
        }

        .action-icon {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d6b25f;
          background: rgba(214,178,95,0.12);
          border: 1px solid rgba(214,178,95,0.22);
        }

        .action-label {
          margin: 0;
          font-size: 11px;
          color: rgba(214,178,95,0.92);
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }

        .action-title {
          margin: 4px 0 0;
          font-size: 17px;
          line-height: 1.15;
          font-weight: 700;
          text-transform: uppercase;
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

        .card {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          padding: 22px;
          margin-bottom: 16px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.025)),
            rgba(8,8,8,0.72);
          border: 1px solid rgba(214,178,95,0.32);
          box-shadow: 0 24px 70px rgba(0,0,0,0.52);
          backdrop-filter: blur(22px);
          animation: fadeUp 0.85s ease both;
          transition: transform 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease, background 0.32s ease;
        }

        .card:nth-of-type(3) { animation-delay: 0.34s; }
        .card:nth-of-type(4) { animation-delay: 0.42s; }
        .card:nth-of-type(5) { animation-delay: 0.50s; }

        .card:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: rgba(214,178,95,0.52);
          background:
            linear-gradient(145deg, rgba(214,178,95,0.10), rgba(255,255,255,0.025)),
            rgba(8,8,8,0.68);
          box-shadow: 0 0 42px rgba(214,178,95,0.12), 0 24px 70px rgba(0,0,0,0.60);
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(214,178,95,0.18), transparent 42%);
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

        .between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
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
          letter-spacing: 1.2px;
          color: rgba(214,178,95,0.95);
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

        .white-title {
          color: white;
          text-transform: none;
        }

        .text {
          margin: 16px 0 0;
          color: rgba(255,255,255,0.68);
          font-size: 14px;
          line-height: 1.6;
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
          box-shadow: 0 0 24px rgba(214,178,95,0.55);
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
          background: rgba(0,0,0,0.34);
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

        .two-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .small-title {
          margin: 8px 0 0;
          font-size: 30px;
          font-weight: 850;
          color: #d6b25f;
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

        @media (max-width: 390px) {
          .title { font-size: 36px; }
          .actions-grid { grid-template-columns: 1fr; }
          .two-grid { grid-template-columns: 1fr; }
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
                <h2 className="card-title">4 jours disciplinés</h2>
              </div>
            </div>
          </div>

          <p className="text">
            Tu construis ta régularité. Chaque journée où tu respectes ton plan
            renforce ton identité de trader discipliné.
          </p>

          <div className="progress-head">
            <span>Objectif semaine</span>
            <span>4/5 jours</span>
          </div>

          <div className="progress">
            <div className="progress-fill" style={{ width: "80%" }} />
          </div>

          <div className="stats-grid">
            <MiniStat icon={<CalendarDays size={19} />} title="Série" value="4j" />
            <MiniStat icon={<Trophy size={19} />} title="Record" value="12j" />
            <MiniStat icon={<ShieldCheck size={19} />} title="Statut" value="Actif" />
          </div>
        </section>

        <section className="two-grid">
          <SmallMetric icon={<ShieldCheck size={24} />} title="Score discipline" value="82%" text="Très bon contrôle aujourd’hui." />
          <SmallMetric icon={<Brain size={24} />} title="État mental" value="Stable" text="Tu peux trader avec clarté." />
        </section>

        <section className="card">
          <div className="row">
            <div className="gold-icon">
              <Target size={25} />
            </div>

            <div>
              <p className="label">Prescription active</p>
              <h2 className="card-title">Maximum 2 trades aujourd’hui</h2>
            </div>
          </div>

          <p className="text">
            Ta priorité n’est pas de faire plus. Ta priorité est de respecter
            ton plan, limiter l’impulsivité et protéger ton capital mental.
          </p>
        </section>

        <section className="card">
          <div className="row">
            <div className="gold-icon">
              <Crown size={25} />
            </div>

            <div>
              <p className="label">Progression PRIME</p>
              <h2 className="card-title white-title">Niveau 3 — Trader structuré</h2>
            </div>
          </div>

          <div className="progress-head">
            <span>640 XP</span>
            <span>1000 XP</span>
          </div>

          <div className="progress">
            <div className="progress-fill" style={{ width: "64%" }} />
          </div>
        </section>
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

function SmallMetric({ icon, title, value, text }) {
  return (
    <section className="card">
      <div className="gold-icon">{icon}</div>

      <p className="label" style={{ marginTop: 14 }}>
        {title}
      </p>

      <p className="small-title">{value}</p>

      <p className="text" style={{ marginTop: 8 }}>
        {text}
      </p>
    </section>
  );
}

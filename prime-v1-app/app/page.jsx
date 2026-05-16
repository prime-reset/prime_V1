"use client";

import {
  Flame,
  ShieldCheck,
  Brain,
  BarChart3,
  Target,
  Sparkles,
  Trophy,
  CalendarCheck,
  Zap,
  Crown,
} from "lucide-react";

import BottomNav from "./components/BottomNav";

export default function HomePage() {
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
          min-height: 100vh;
          color: white;
          padding: 28px 18px 120px;
          font-family: Inter, Arial, sans-serif;

          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.18) 0%,
              rgba(0,0,0,0.42) 35%,
              rgba(0,0,0,0.92) 100%
            ),
            url("/background.jpg");

          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          background-attachment: fixed;

          overflow-x: hidden;
          position: relative;
        }

        .prime-home::before {
          content: "";
          position: fixed;
          inset: 0;

          background:
            radial-gradient(
              circle at top left,
              rgba(214,178,95,0.16),
              transparent 28%
            );

          pointer-events: none;
        }

        .page {
          max-width: 430px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 26px;
          animation: fadeUp 0.7s ease both;
        }

        .brand {
          margin: 0;
          font-size: 12px;
          letter-spacing: 7px;
          color: rgba(214,178,95,0.82);
        }

        .title {
          margin: 8px 0 0;
          font-size: 38px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -1.4px;
        }

        .premium-icon {
          width: 62px;
          height: 62px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.16),
            rgba(255,255,255,0.04)
          );

          border: 1px solid rgba(255,255,255,0.14);

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 20px 50px rgba(0,0,0,0.45);

          backdrop-filter: blur(14px);
        }

        .card {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          padding: 22px;
          margin-bottom: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.105),
              rgba(255,255,255,0.035)
            ),
            rgba(255,255,255,0.035);

          border: 1px solid rgba(255,255,255,0.12);

          box-shadow:
            0 22px 70px rgba(0,0,0,0.46);

          backdrop-filter: blur(22px);

          animation: fadeUp 0.75s ease both;
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;

          background:
            radial-gradient(
              circle at top left,
              rgba(214,178,95,0.12),
              transparent 42%
            );

          pointer-events: none;
        }

        .card > * {
          position: relative;
          z-index: 1;
        }

        .gold-card {
          background:
            linear-gradient(
              145deg,
              rgba(214,178,95,0.16),
              rgba(255,255,255,0.04)
            ),
            rgba(255,255,255,0.04);
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
        }

        .icon-box {
          width: 52px;
          height: 52px;
          min-width: 52px;

          border-radius: 20px;

          background: rgba(255,255,255,0.09);

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;
        }

        .icon-box.light {
          background: linear-gradient(145deg, #ffffff, #d8d8d8);
          color: black;
        }

        .label {
          margin: 0;
          font-size: 12px;
          color: rgba(255,255,255,0.46);
        }

        .gold {
          color: rgba(214,178,95,0.92);
        }

        .card-title {
          margin: 2px 0 0;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .big-title {
          margin: 8px 0 0;
          font-size: 32px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .text {
          margin: 18px 0 0;
          color: rgba(255,255,255,0.64);
          font-size: 15px;
          line-height: 1.65;
        }

        .progress-head {
          display: flex;
          justify-content: space-between;
          margin: 20px 0 7px;
          font-size: 12px;
          color: rgba(255,255,255,0.48);
        }

        .progress {
          height: 9px;
          width: 100%;

          background: rgba(255,255,255,0.11);

          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;

          background: linear-gradient(
            90deg,
            #d6b25f,
            #ffffff
          );

          box-shadow:
            0 0 24px rgba(214,178,95,0.42);

          animation: loadBar 1.2s ease both;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 20px;
        }

        .mini {
          border-radius: 22px;
          padding: 14px;

          background: rgba(0,0,0,0.22);

          border: 1px solid rgba(255,255,255,0.10);
        }

        .mini p {
          margin: 0;
        }

        .mini-value {
          margin-top: 4px !important;
          font-size: 21px;
          font-weight: 800;
        }

        .two-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .small-card {
          min-height: 170px;

          border-radius: 30px;
          padding: 20px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.09),
              rgba(255,255,255,0.025)
            );

          border: 1px solid rgba(255,255,255,0.11);

          box-shadow:
            0 20px 55px rgba(0,0,0,0.44);

          animation: fadeUp 0.8s ease both;
        }

        .small-value {
          margin: 8px 0;
          font-size: 30px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .mission {
          margin-top: 18px;

          border-radius: 24px;
          padding: 16px;

          background: rgba(0,0,0,0.25);

          border: 1px solid rgba(255,255,255,0.08);
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          margin-top: 16px;

          padding: 9px 12px;

          border-radius: 999px;

          background: rgba(214,178,95,0.13);

          border: 1px solid rgba(214,178,95,0.24);

          color: rgba(255,255,255,0.82);

          font-size: 12px;
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

        @keyframes loadBar {
          from {
            width: 0%;
          }
        }
      `}</style>

      <div className="page">
        <header className="hero">
          <div>
            <p className="brand">PRIME.</p>
            <h1 className="title">Discipline Mode</h1>
          </div>

          <div className="premium-icon">
            <Sparkles size={26} />
          </div>
        </header>

        <section className="card gold-card">
          <div className="row">
            <div className="icon-box light">
              <Brain size={25} />
            </div>

            <div>
              <p className="label gold">Coach PRIME</p>

              <h2 className="card-title">
                Les choses sérieuses commencent.
              </h2>
            </div>
          </div>

          <p className="text">
            Ton objectif est simple : maintenir une discipline constante.
            PRIME t’aide à identifier tes erreurs, corriger ton comportement
            et construire le trader que tu deviens.
          </p>

          <div className="pill">
            <Zap size={14} />
            Mode exécution activé
          </div>
        </section>

        <section className="card">
          <div className="between">
            <div>
              <p className="label gold">Streak PRIME</p>

              <h2 className="big-title">
                4 jours disciplinés
              </h2>
            </div>

            <div className="icon-box light">
              <Flame size={29} />
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
            <div
              className="progress-fill"
              style={{ width: "80%" }}
            />
          </div>

          <div className="stats-grid">
            <MiniStat
              icon={<CalendarCheck size={18} />}
              title="Série"
              value="4j"
            />

            <MiniStat
              icon={<Trophy size={18} />}
              title="Record"
              value="12j"
            />

            <MiniStat
              icon={<ShieldCheck size={18} />}
              title="Statut"
              value="Actif"
            />
          </div>
        </section>

        <div className="two-grid">
          <SmallCard
            icon={<ShieldCheck size={21} />}
            title="Score discipline"
            value="82%"
            desc="Très bon contrôle aujourd’hui."
          />

          <SmallCard
            icon={<Flame size={21} />}
            title="État mental"
            value="Stable"
            desc="Tu peux trader avec clarté."
          />
        </div>

        <section className="card">
          <div className="row">
            <div className="icon-box">
              <Target size={22} />
            </div>

            <div>
              <p className="label gold">
                Prescription active
              </p>

              <h3 className="card-title">
                Maximum 2 trades aujourd’hui
              </h3>
            </div>
          </div>

          <p className="text">
            Ta priorité n’est pas de faire plus. Ta priorité est de respecter
            ton plan, limiter l’impulsivité et protéger ton capital mental.
          </p>
        </section>

        <section className="card">
          <div className="row">
            <div className="icon-box">
              <BarChart3 size={22} />
            </div>

            <div>
              <p className="label gold">
                Progression PRIME
              </p>

              <h3 className="card-title">
                Niveau 3 — Trader structuré
              </h3>
            </div>
          </div>

          <div className="progress-head">
            <span>640 XP</span>
            <span>1000 XP</span>
          </div>

          <div className="progress">
            <div
              className="progress-fill"
              style={{ width: "64%" }}
            />
          </div>

          <div className="mission">
            <div className="row">
              <Crown size={20} color="#d6b25f" />

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                Prochain objectif : débloquer le niveau Trader discipliné.
              </p>
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

function MiniStat({ icon, title, value }) {
  return (
    <div className="mini">
      <div
        style={{
          color: "rgba(255,255,255,0.68)",
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <p className="label">{title}</p>

      <p className="mini-value">{value}</p>
    </div>
  );
}

function SmallCard({ icon, title, value, desc }) {
  return (
    <div className="small-card">
      <div className="icon-box">
        {icon}
      </div>

      <p
        className="label gold"
        style={{ marginTop: 18 }}
      >
        {title}
      </p>

      <p className="small-value">{value}</p>

      <p
        className="text"
        style={{
          fontSize: 13,
          marginTop: 0,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

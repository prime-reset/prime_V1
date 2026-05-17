"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  ShieldCheck,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Play,
  Lock,
} from "lucide-react";

import BottomNav from "../components/BottomNav";

export default function SessionPage() {
  const [disciplineActive, setDisciplineActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("prime_discipline_active");
    if (saved === "true") {
      setDisciplineActive(true);
    }
  }, []);

  function activateDiscipline() {
  const today = new Date().toISOString().split("T")[0];
  const lastXpDate = localStorage.getItem("prime_last_xp_date");

  setDisciplineActive(true);
  localStorage.setItem("prime_discipline_active", "true");
  localStorage.setItem("prime_session_started_at", new Date().toISOString());

  if (lastXpDate !== today) {
    const currentXp = Number(localStorage.getItem("prime_xp") || 640);
    const currentStreak = Number(localStorage.getItem("prime_streak") || 4);

    localStorage.setItem("prime_xp", String(currentXp + 40));
    localStorage.setItem("prime_streak", String(currentStreak + 1));
    localStorage.setItem("prime_last_xp_date", today);
  }
}

  return (
    <main className="session-page">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #000;
        }

        .session-page {
          min-height: 100vh;
          color: white;
          padding: 28px 18px 125px;
          font-family: Inter, Arial, sans-serif;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.12) 0%,
              rgba(0,0,0,0.40) 42%,
              rgba(0,0,0,0.98) 100%
            ),
            url("/prime-panther-bg.png.png");
          background-size: cover, min(120vw, 860px) auto;
          background-position: center top, center -220px;
          background-repeat: no-repeat;
          overflow-x: hidden;
          position: relative;
        }

        .session-page::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 50% 10%, rgba(214,178,95,0.16), transparent 32%),
            linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.95) 100%);
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
          background: rgba(0,0,0,0.38);
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
          margin-bottom: 18px;
        }

        .title {
          margin: 0;
          font-size: 38px;
          line-height: 0.98;
          font-weight: 900;
          letter-spacing: -1.2px;
          text-transform: uppercase;
        }

        .title span {
          display: block;
          background: linear-gradient(180deg, #fff 0%, #d6b25f 82%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          margin: 14px 0 0;
          color: rgba(255,255,255,0.68);
          font-size: 14px;
          line-height: 1.6;
        }

        .card {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          padding: 22px;
          margin-bottom: 16px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.025)),
            rgba(8,8,8,0.74);
          border: 1px solid rgba(214,178,95,0.32);
          box-shadow: 0 24px 70px rgba(0,0,0,0.52);
          backdrop-filter: blur(22px);
          animation: fadeUp 0.75s ease both;
        }

        .card.active-card {
          border-color: rgba(214,178,95,0.58);
          box-shadow:
            0 0 40px rgba(214,178,95,0.14),
            0 24px 70px rgba(0,0,0,0.60);
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(214,178,95,0.16), transparent 42%);
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
          letter-spacing: 1.2px;
          color: rgba(214,178,95,0.95);
        }

        .card-title {
          margin: 6px 0 0;
          font-size: 24px;
          line-height: 1.05;
          font-weight: 850;
          color: white;
        }

        .text {
          margin: 16px 0 0;
          color: rgba(255,255,255,0.68);
          font-size: 14px;
          line-height: 1.6;
        }

        .mental-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .mental-option {
          border-radius: 18px;
          padding: 13px 10px;
          text-align: center;
          background: rgba(0,0,0,0.34);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          font-weight: 700;
        }

        .mental-option.active {
          color: #d6b25f;
          border-color: rgba(214,178,95,0.42);
          background: rgba(214,178,95,0.10);
          box-shadow: 0 0 24px rgba(214,178,95,0.10);
        }

        .checklist {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-radius: 18px;
          padding: 14px;
          background: rgba(0,0,0,0.34);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .check-item.done {
          border-color: rgba(214,178,95,0.34);
        }

        .check-title {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: white;
        }

        .check-desc {
          margin: 4px 0 0;
          font-size: 12px;
          line-height: 1.45;
          color: rgba(255,255,255,0.56);
        }

        .warning,
        .confirmation {
          margin-top: 16px;
          border-radius: 20px;
          padding: 15px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .warning {
          background: rgba(214,178,95,0.10);
          border: 1px solid rgba(214,178,95,0.22);
        }

        .confirmation {
          background: rgba(214,178,95,0.14);
          border: 1px solid rgba(214,178,95,0.42);
          box-shadow: 0 0 28px rgba(214,178,95,0.10);
        }

        .warning p,
        .confirmation p {
          margin: 0;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          line-height: 1.45;
        }

        .primary-button {
          width: 100%;
          margin-top: 18px;
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

        .primary-button.active {
          color: #d6b25f;
          background: rgba(0,0,0,0.42);
          border: 1px solid rgba(214,178,95,0.38);
          box-shadow: 0 0 30px rgba(214,178,95,0.12);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="page">
        <div className="topbar">
          <Link href="/" className="back">
            <ArrowLeft size={20} />
          </Link>

          <p className="brand">PRIME SESSION</p>

          <div style={{ width: 44 }} />
        </div>

        <section className="hero">
          <h1 className="title">
            Prépare
            <span>ta session</span>
          </h1>

          <p className="subtitle">
            Avant d’entrer en marché, PRIME vérifie ton état mental, ton intention
            et ton respect du process.
          </p>
        </section>

        <section className={`card ${disciplineActive ? "active-card" : ""}`}>
          <div className="row">
            <div className="gold-icon">
              {disciplineActive ? <Lock size={25} /> : <Brain size={25} />}
            </div>

            <div>
              <p className="label">
                {disciplineActive ? "Discipline activée" : "État mental"}
              </p>
              <h2 className="card-title">
                {disciplineActive
                  ? "Session verrouillée PRIME"
                  : "Comment tu arrives aujourd’hui ?"}
              </h2>
            </div>
          </div>

          {!disciplineActive ? (
            <div className="mental-grid">
              <div className="mental-option">Fatiguée</div>
              <div className="mental-option active">Stable</div>
              <div className="mental-option">Tendue</div>
            </div>
          ) : (
            <div className="confirmation">
              <ShieldCheck size={18} color="#d6b25f" />
              <p>
                Ton mode discipline est actif. PRIME considérera cette session
                comme engagée et suivra ton respect du plan.
              </p>
            </div>
          )}
        </section>

        <section className="card">
          <div className="row">
            <div className="gold-icon">
              <Target size={25} />
            </div>

            <div>
              <p className="label">Intention</p>
              <h2 className="card-title">Objectif comportemental</h2>
            </div>
          </div>

          <p className="text">
            Aujourd’hui, ton objectif n’est pas de gagner plus. Ton objectif est
            de respecter ton plan, ton risque et ton nombre maximal de trades.
          </p>

          <div className="warning">
            <AlertTriangle size={18} color="#d6b25f" />
            <p>
              Si tu ressens le besoin de te refaire, PRIME te recommandera le mode reset.
            </p>
          </div>
        </section>

        <section className={`card ${disciplineActive ? "active-card" : ""}`}>
          <div className="row">
            <div className="gold-icon">
              <ShieldCheck size={25} />
            </div>

            <div>
              <p className="label">Checklist pré-trade</p>
              <h2 className="card-title">Verrou de discipline</h2>
            </div>
          </div>

          <div className="checklist">
            <CheckItem
              title="Biais HTF identifié"
              desc="Structure, liquidité, zones clés et contexte global validés."
              done
            />

            <CheckItem
              title="Session highs/lows repérés"
              desc="Asian / London / premarket visibles avant l’exécution."
              done
            />

            <CheckItem
              title="Risque défini"
              desc="Stop, invalidation et perte maximale acceptée avant entrée."
              done
            />

            <CheckItem
              title="Pas de trade émotionnel"
              desc="Aucune entrée pour compenser, prouver ou forcer."
              done={disciplineActive}
            />
          </div>

          <button
            className={`primary-button ${disciplineActive ? "active" : ""}`}
            onClick={activateDiscipline}
            disabled={disciplineActive}
          >
            {disciplineActive ? (
              <>
                <Lock size={18} />
                Discipline activée
              </>
            ) : (
              <>
                <Play size={18} />
                Activer ma discipline
              </>
            )}
          </button>

          {disciplineActive && (
            <div className="confirmation">
              <ShieldCheck size={18} color="#d6b25f" />
              <p>
                Session lancée. Prochaine étape : chaque action pourra alimenter
                ton score discipline, ton streak et tes XP.
              </p>
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

function CheckItem({ title, desc, done }) {
  return (
    <div className={`check-item ${done ? "done" : ""}`}>
      <CheckCircle2
        size={20}
        color={done ? "#d6b25f" : "rgba(255,255,255,0.35)"}
      />
      <div>
        <p className="check-title">{title}</p>
        <p className="check-desc">{desc}</p>
      </div>
    </div>
  );
}

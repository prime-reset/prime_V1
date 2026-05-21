"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Save,
  Flame,
} from "lucide-react";

import BottomNav from "../components/BottomNav";
import { supabase } from "../../lib/supabase";

const errors = [
  { id: "revenge", label: "Revenge trading", severity: 5 },
  { id: "overtrading", label: "Overtrading", severity: 4 },
  { id: "fomo", label: "FOMO", severity: 4 },
  { id: "stop", label: "Stop non respecté", severity: 5 },
  { id: "plan", label: "Plan non respecté", severity: 4 },
  { id: "risk", label: "Risque trop élevé", severity: 5 },
];

export default function ReviewPage() {
  const [selectedErrors, setSelectedErrors] = useState([]);
  const [saved, setSaved] = useState(false);

  const totalSeverity = selectedErrors.reduce((sum, errorId) => {
    const error = errors.find((item) => item.id === errorId);
    return sum + (error?.severity || 0);
  }, 0);

  const disciplineScore = Math.max(100 - totalSeverity * 8, 0);
let insight = "Discipline stable. Continue d’exécuter ton plan.";

if (selectedErrors.includes("revenge")) {
  insight =
    "Tu sembles trader sous émotion après une perte. PRIME détecte une tendance au revenge trading.";
} else if (selectedErrors.includes("overtrading")) {
  insight =
    "Ton volume de trades semble excessif. PRIME détecte une perte de patience.";
} else if (selectedErrors.includes("fomo")) {
  insight =
    "Tu sembles poursuivre le marché au lieu d’attendre ton setup.";
} else if (selectedErrors.includes("risk")) {
  insight =
    "Ton risque devient instable. PRIME détecte une perte de contrôle du risk management.";
}
  function toggleError(errorId) {
    setSaved(false);

    setSelectedErrors((current) =>
      current.includes(errorId)
        ? current.filter((id) => id !== errorId)
        : [...current, errorId]
    );
  }

  async function saveReview() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      alert("Tu dois être connectée pour sauvegarder ta review.");
      return;
    }

    const { data: activeSession } = await supabase
      .from("sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!activeSession) {
      alert("Aucune session active trouvée.");
      return;
    }

    const rows = selectedErrors.map((errorId) => {
      const error = errors.find((item) => item.id === errorId);

      return {
        user_id: user.id,
        session_id: activeSession.id,
        category: error.label,
        severity: error.severity,
      };
    });

    if (rows.length > 0) {
      await supabase.from("trade_errors").insert(rows);
    }

    await supabase
      .from("sessions")
      .update({
        discipline_score: disciplineScore,
        status: "reviewed",
      })
      .eq("id", activeSession.id);

    await supabase
      .from("profiles")
      .update({
        discipline_score: disciplineScore,
      })
      .eq("id", user.id);

    setSaved(true);
  }

  return (
    <main className="review-page">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #000;
        }

        .review-page {
          min-height: 100vh;
          color: white;
          padding: 28px 18px 125px;
          font-family: Inter, Arial, sans-serif;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.16) 0%,
              rgba(0,0,0,0.44) 42%,
              rgba(0,0,0,0.98) 100%
            ),
            url("/prime-panther-bg.png.png");
          background-size: cover, min(120vw, 860px) auto;
          background-position: center top, center -220px;
          background-repeat: no-repeat;
          overflow-x: hidden;
          position: relative;
        }

        .review-page::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 50% 10%, rgba(214,178,95,0.14), transparent 32%),
            linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.96) 100%);
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
            rgba(8,8,8,0.76);
          border: 1px solid rgba(214,178,95,0.32);
          box-shadow: 0 24px 70px rgba(0,0,0,0.52);
          backdrop-filter: blur(22px);
          animation: fadeUp 0.75s ease both;
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

        .score {
          margin: 18px 0 0;
          font-size: 48px;
          font-weight: 900;
          color: #d6b25f;
          line-height: 1;
        }

        .errors-grid {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .error-item {
          width: 100%;
          border-radius: 18px;
          padding: 15px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.36);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          text-align: left;
        }

        .error-item.active {
          border-color: rgba(214,178,95,0.48);
          background: rgba(214,178,95,0.12);
          box-shadow: 0 0 28px rgba(214,178,95,0.10);
        }

        .error-title {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
        }

        .error-severity {
          margin: 4px 0 0;
          color: rgba(255,255,255,0.56);
          font-size: 12px;
        }

        .save-button {
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

        .saved-box {
          margin-top: 16px;
          border-radius: 20px;
          padding: 15px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: rgba(214,178,95,0.14);
          border: 1px solid rgba(214,178,95,0.42);
        }

        .saved-box p {
          margin: 0;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          line-height: 1.45;
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

          <p className="brand">PRIME REVIEW</p>

          <div style={{ width: 44 }} />
        </div>

        <section className="hero">
          <h1 className="title">
            Review
            <span>de session</span>
          </h1>

          <p className="subtitle">
            Identifie ce qui a réellement impacté ta discipline. PRIME transforme
            tes erreurs en données exploitables.
          </p>
        </section>

        <section className="card">
          <div className="row">
            <div className="gold-icon">
              <Brain size={25} />
            </div>

            <div>
              <p className="label">Score discipline</p>
              <h2 className="card-title">Calcul automatique</h2>
            </div>
          </div>

          <p className="score">{disciplineScore}%</p>

          <p className="text">
            Plus les erreurs sont graves, plus le score baisse. L’objectif est
            de mesurer ton exécution, pas seulement ton PnL.
          </p>
        </section>
<p
  style={{
    marginTop: 16,
    color: "#d6b25f",
    fontWeight: 700,
    lineHeight: 1.5,
  }}
>
  {insight}
</p>
        <section className="card">
          <div className="row">
            <div className="gold-icon">
              <AlertTriangle size={25} />
            </div>

            <div>
              <p className="label">Erreurs détectées</p>
              <h2 className="card-title">Qu’est-ce qui s’est passé ?</h2>
            </div>
          </div>

          <div className="errors-grid">
            {errors.map((error) => (
              <button
                key={error.id}
                className={`error-item ${
                  selectedErrors.includes(error.id) ? "active" : ""
                }`}
                onClick={() => toggleError(error.id)}
              >
                <div>
                  <p className="error-title">{error.label}</p>
                  <p className="error-severity">
                    Gravité : {error.severity}/5
                  </p>
                </div>

                {selectedErrors.includes(error.id) && (
                  <CheckCircle2 size={21} color="#d6b25f" />
                )}
              </button>
            ))}
          </div>

          <button className="save-button" onClick={saveReview}>
            <Save size={18} />
            Sauvegarder la review
          </button>

          {saved && (
            <div className="saved-box">
              <Flame size={18} color="#d6b25f" />
              <p>
                Review sauvegardée. PRIME a mis à jour ta session, ton score
                discipline et tes erreurs comportementales.
              </p>
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

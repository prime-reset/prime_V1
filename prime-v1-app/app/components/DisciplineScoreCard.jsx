"use client";

import { ShieldCheck, AlertTriangle, Brain } from "lucide-react";

export default function DisciplineScoreCard() {
  const score = 82;

  const status =
    score >= 85
      ? "Exécution institutionnelle"
      : score >= 65
      ? "Discipline stable"
      : score >= 45
      ? "Instabilité détectée"
      : "Danger émotionnel";

  const message =
    score >= 85
      ? "Tu respectes ton process. Continue sans augmenter le risque."
      : score >= 65
      ? "Ton contrôle est bon, mais reste attentive aux impulsions."
      : score >= 45
      ? "Ton comportement montre une perte de précision. Réduis l’exposition."
      : "Stop trading recommandé. Ton capital mental doit être protégé.";

  const Icon = score >= 65 ? ShieldCheck : AlertTriangle;

  return (
    <section className="discipline-card">
      <style>{`
        .discipline-card {
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
        }

        .discipline-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .discipline-icon {
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

        .discipline-label {
          margin: 0;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: rgba(214,178,95,0.95);
        }

        .discipline-score {
          margin: 8px 0 0;
          font-size: 46px;
          line-height: 1;
          font-weight: 900;
          color: #d6b25f;
        }

        .discipline-status {
          margin: 8px 0 0;
          font-size: 18px;
          font-weight: 800;
          color: white;
        }

        .discipline-message {
          margin: 16px 0 0;
          color: rgba(255,255,255,0.68);
          font-size: 14px;
          line-height: 1.6;
        }

        .discipline-progress {
          margin-top: 18px;
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          overflow: hidden;
        }

        .discipline-progress-fill {
          height: 100%;
          width: ${score}%;
          border-radius: 999px;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          box-shadow: 0 0 24px rgba(214,178,95,0.55);
        }

        .discipline-ai {
          margin-top: 16px;
          border-radius: 20px;
          padding: 14px;
          background: rgba(0,0,0,0.34);
          border: 1px solid rgba(255,255,255,0.10);
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .discipline-ai p {
          margin: 0;
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          line-height: 1.45;
        }
      `}</style>

      <div className="discipline-row">
        <div>
          <p className="discipline-label">Score discipline</p>
          <h2 className="discipline-score">{score}%</h2>
          <p className="discipline-status">{status}</p>
        </div>

        <div className="discipline-icon">
          <Icon size={28} />
        </div>
      </div>

      <p className="discipline-message">{message}</p>

      <div className="discipline-progress">
        <div className="discipline-progress-fill" />
      </div>

      <div className="discipline-ai">
        <Brain size={20} color="#d6b25f" />
        <p>
          PRIME analyse ton comportement, pas seulement ton résultat. Le score
          reflète la qualité de ton exécution.
        </p>
      </div>
    </section>
  );
}

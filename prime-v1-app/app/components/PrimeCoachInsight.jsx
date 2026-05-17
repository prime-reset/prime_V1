"use client";

import { BrainCircuit, AlertTriangle } from "lucide-react";

export default function PrimeCoachInsight() {
  return (
    <section className="coach-card">
      <style>{`
        .coach-card {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 24px;
          margin-bottom: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.02)
            ),
            rgba(8,8,8,0.78);

          border: 1px solid rgba(214,178,95,0.26);

          backdrop-filter: blur(20px);

          box-shadow:
            0 24px 80px rgba(0,0,0,0.48),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .coach-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
        }

        .coach-icon {
          width: 58px;
          height: 58px;
          border-radius: 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(214,178,95,0.12);

          border: 1px solid rgba(214,178,95,0.22);

          color: #d6b25f;
        }

        .coach-label {
          margin: 0;
          font-size: 12px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: rgba(214,178,95,0.9);
        }

        .coach-title {
          margin: 6px 0 0;
          font-size: 28px;
          line-height: 1;
          font-weight: 850;
          color: white;
        }

        .coach-main {
          border-radius: 24px;
          padding: 18px;

          background: rgba(0,0,0,0.34);

          border: 1px solid rgba(255,255,255,0.06);
        }

        .coach-warning {
          display: flex;
          align-items: center;
          gap: 10px;

          color: #ffcc66;

          font-size: 13px;
          font-weight: 700;

          margin-bottom: 12px;
        }

        .coach-message {
          font-size: 17px;
          line-height: 1.6;
          color: rgba(255,255,255,0.82);
          margin: 0;
        }

        .coach-highlight {
          color: #d6b25f;
          font-weight: 800;
        }

      `}</style>

      <div className="coach-top">
        <div className="coach-icon">
          <BrainCircuit size={28} />
        </div>

        <div>
          <p className="coach-label">Coach PRIME</p>
          <h2 className="coach-title">Analyse comportementale</h2>
        </div>
      </div>

      <div className="coach-main">
        <div className="coach-warning">
          <AlertTriangle size={16} />
          Risque émotionnel détecté
        </div>

        <p className="coach-message">
          Tu sembles vouloir <span className="coach-highlight">forcer des opportunités</span>.
          Aujourd’hui, ta priorité n’est pas de trader plus.
          Ta priorité est de <span className="coach-highlight">rester propre mentalement</span>.
        </p>
      </div>
    </section>
  );
}

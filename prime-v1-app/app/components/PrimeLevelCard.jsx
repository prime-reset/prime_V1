"use client";

import { useEffect, useState } from "react";
import { Crown, Zap, Lock } from "lucide-react";

export default function PrimeLevelCard() {
  const [xp, setXp] = useState(640);

  useEffect(() => {
    const savedXp = localStorage.getItem("prime_xp");
    if (savedXp) setXp(Number(savedXp));
  }, []);

  const nextLevelXp = 1000;
  const level = Math.max(1, Math.floor(xp / 300) + 1);
  const progress = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <section className="prime-level-card">
      <style>{`
        .prime-level-card {
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
        }

        .level-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .level-icon {
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

        .level-label {
          margin: 0;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: rgba(214,178,95,0.95);
        }

        .level-title {
          margin: 6px 0 0;
          font-size: 24px;
          font-weight: 850;
          color: white;
        }

        .level-progress-head {
          display: flex;
          justify-content: space-between;
          margin: 20px 0 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.66);
        }

        .level-progress {
          height: 8px;
          width: 100%;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          overflow: hidden;
        }

        .level-progress-fill {
          height: 100%;
          width: ${progress}%;
          border-radius: 999px;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          box-shadow: 0 0 24px rgba(214,178,95,0.55);
        }

        .level-rewards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
        }

        .reward {
          border-radius: 18px;
          padding: 13px;
          background: rgba(0,0,0,0.34);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .reward-title {
          margin: 8px 0 0;
          font-size: 12px;
          color: rgba(214,178,95,0.9);
          text-transform: uppercase;
        }

        .reward-text {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(255,255,255,0.72);
          line-height: 1.4;
        }
      `}</style>

      <div className="level-row">
        <div className="level-icon">
          <Crown size={25} />
        </div>

        <div>
          <p className="level-label">Progression PRIME</p>
          <h2 className="level-title">
            Niveau {level} — Trader structuré
          </h2>
        </div>
      </div>

      <div className="level-progress-head">
        <span>{xp} XP</span>
        <span>{nextLevelXp} XP</span>
      </div>

      <div className="level-progress">
        <div className="level-progress-fill" />
      </div>

      <div className="level-rewards">
        <div className="reward">
          <Zap size={18} color="#d6b25f" />
          <p className="reward-title">Gain XP</p>
          <p className="reward-text">+40 XP par session disciplinée.</p>
        </div>

        <div className="reward">
          <Lock size={18} color="#d6b25f" />
          <p className="reward-title">Prochain unlock</p>
          <p className="reward-text">Niveau 4 : Discipline Core.</p>
        </div>
      </div>
    </section>
  );
}

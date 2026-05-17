"use client";

import { Award, Lock, Flame, ShieldCheck, Brain } from "lucide-react";

export default function PrimeBadgesCard() {
  const badges = [
    {
      title: "Discipline Starter",
      desc: "3 jours disciplinés",
      unlocked: true,
      icon: <Flame size={20} />,
    },
    {
      title: "Emotion Control",
      desc: "Aucun revenge trade",
      unlocked: true,
      icon: <ShieldCheck size={20} />,
    },
    {
      title: "Consistent Mind",
      desc: "10 jours de régularité",
      unlocked: false,
      icon: <Brain size={20} />,
    },
  ];

  return (
    <section className="badges-card">
      <style>{`
        .badges-card {
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

        .badges-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .badges-icon {
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

        .badges-label {
          margin: 0;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: rgba(214,178,95,0.95);
        }

        .badges-title {
          margin: 6px 0 0;
          font-size: 26px;
          line-height: 1.05;
          font-weight: 850;
          color: white;
        }

        .badge-list {
          display: grid;
          gap: 10px;
        }

        .badge-item {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 20px;
          padding: 14px;
          background: rgba(0,0,0,0.34);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .badge-item.unlocked {
          border-color: rgba(214,178,95,0.34);
          box-shadow: 0 0 24px rgba(214,178,95,0.08);
        }

        .badge-mark {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d6b25f;
          background: rgba(214,178,95,0.12);
          border: 1px solid rgba(214,178,95,0.18);
        }

        .badge-item.locked {
          opacity: 0.48;
        }

        .badge-name {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: white;
          text-transform: uppercase;
        }

        .badge-desc {
          margin: 4px 0 0;
          font-size: 12px;
          color: rgba(255,255,255,0.58);
        }
      `}</style>

      <div className="badges-row">
        <div className="badges-icon">
          <Award size={25} />
        </div>

        <div>
          <p className="badges-label">Badges PRIME</p>
          <h2 className="badges-title">Récompenses débloquées</h2>
        </div>
      </div>

      <div className="badge-list">
        {badges.map((badge) => (
          <div
            key={badge.title}
            className={`badge-item ${badge.unlocked ? "unlocked" : "locked"}`}
          >
            <div className="badge-mark">
              {badge.unlocked ? badge.icon : <Lock size={18} />}
            </div>

            <div>
              <p className="badge-name">{badge.title}</p>
              <p className="badge-desc">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

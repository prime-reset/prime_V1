"use client";

import {
  Brain,
  ShieldAlert,
  Flame,
  Activity,
  Sparkles,
} from "lucide-react";

import BottomNav from "../components/BottomNav";

export default function CoachPage() {
  return (
    <main className="coach-page">
      <style>{`
        *{
          box-sizing:border-box;
        }

        .coach-page{
          min-height:100vh;
          padding:32px 20px 140px;
          color:white;
          font-family:Inter,sans-serif;
          position:relative;
          z-index:2;
        }

        .page{
          max-width:460px;
          margin:0 auto;
        }

        .hero{
          margin-bottom:28px;
        }

        .brand{
          color:#D4B06A;
          letter-spacing:6px;
          font-size:14px;
          text-transform:uppercase;
          margin-bottom:18px;
        }

        .title{
          font-size:64px;
          line-height:0.92;
          font-weight:900;
          letter-spacing:-3px;
          margin:0;
        }

        .title span{
          display:block;
          color:rgba(255,255,255,0.88);
        }

        .subtitle{
          margin-top:24px;
          font-size:18px;
          line-height:1.7;
          color:rgba(255,255,255,0.68);
        }

        .card{
          position:relative;
          overflow:hidden;

          padding:28px;
          margin-bottom:18px;

          border-radius:34px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.02)
            ),
            rgba(5,5,5,0.72);

          border:1px solid rgba(255,255,255,0.08);

          backdrop-filter:blur(22px);

          box-shadow:
            0 20px 60px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .card-label{
          color:rgba(212,176,106,0.82);
          font-size:12px;
          letter-spacing:3px;
          text-transform:uppercase;
          margin-bottom:16px;
        }

        .card-title{
          font-size:28px;
          line-height:1.15;
          font-weight:800;
          margin:0;
          color:#D4B06A;
        }

        .card-text{
          margin-top:22px;
          font-size:17px;
          line-height:1.8;
          color:rgba(255,255,255,0.74);
        }

        .icon-box{
          width:58px;
          height:58px;

          border-radius:18px;

          display:flex;
          align-items:center;
          justify-content:center;

          margin-bottom:22px;

          background:rgba(212,176,106,0.10);

          border:1px solid rgba(212,176,106,0.18);

          color:#D4B06A;
        }

        .prescription{
          font-size:20px;
          line-height:1.5;
          font-weight:700;
          color:white;
          margin-top:18px;
        }

        .mental-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
          margin-bottom:18px;
        }

        .mental-card{
          padding:20px;
          border-radius:26px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.02)
            ),
            rgba(5,5,5,0.72);

          border:1px solid rgba(255,255,255,0.08);

          backdrop-filter:blur(20px);
        }

        .mental-title{
          margin-top:16px;
          font-size:14px;
          color:rgba(212,176,106,0.82);
          letter-spacing:2px;
          text-transform:uppercase;
        }

        .mental-value{
          margin-top:10px;
          font-size:24px;
          font-weight:800;
        }

        @media(max-width:520px){

          .title{
            font-size:52px;
          }

          .mental-grid{
            grid-template-columns:1fr;
          }

        }
      `}</style>

      <div className="page">

        <section className="hero">
          <div className="brand">
            PRIME COACH
          </div>

          <h1 className="title">
            Ton cerveau
            <span>d’exécution.</span>
          </h1>

          <p className="subtitle">
            PRIME analyse ton comportement,
            ton état mental et tes erreurs
            dominantes pour corriger ton exécution.
          </p>
        </section>

        <section className="card">
          <div className="icon-box">
            <Brain size={28}/>
          </div>

          <div className="card-label">
            ANALYSE COACH
          </div>

          <h2 className="card-title">
            Coach actif
          </h2>

          <p className="card-text">
            PRIME analyse ton comportement,
            ton état mental et tes erreurs
            dominantes pour te donner
            une prescription claire.
          </p>
        </section>

        <section className="card">
          <div className="icon-box">
            <ShieldAlert size={28}/>
          </div>

          <div className="card-label">
            PRESCRIPTION ACTIVE
          </div>

          <div className="prescription">
            Respecte ton plan avant ton envie.
          </div>

          <p className="card-text">
            Pendant ta prochaine session,
            ton objectif n’est pas la performance.
            Ton objectif est le respect
            total de ton process.
          </p>
        </section>

        <section className="mental-grid">

          <div className="mental-card">
            <Activity size={24} color="#D4B06A"/>

            <div className="mental-title">
              ÉTAT MENTAL
            </div>

            <div className="mental-value">
              Stable
            </div>
          </div>

          <div className="mental-card">
            <Flame size={24} color="#D4B06A"/>

            <div className="mental-title">
              RISQUE
            </div>

            <div className="mental-value">
              FOMO
            </div>
          </div>

        </section>

        <section className="card">
          <div className="icon-box">
            <Sparkles size={28}/>
          </div>

          <div className="card-label">
            INSIGHT PRIME IA
          </div>

          <p className="card-text">
            Tes performances chutent
            principalement lorsque tu prends
            une position sans validation complète
            de ta checklist.
          </p>

          <p className="card-text">
            Tu es techniquement capable,
            mais émotionnellement irrégulière.
          </p>
        </section>

      </div>

      <BottomNav />
    </main>
  );
}

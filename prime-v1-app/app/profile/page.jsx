"use client";

import { useEffect, useState } from "react";
import {
  User,
  Crown,
  Flame,
  ShieldCheck,
  Target,
  Sparkles,
  CheckCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function ProfilePage() {
  const [primeProfile, setPrimeProfile] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) return;

const { data: profileData } = await supabase
  .from("profiles")
  .select("*")
  .eq("email", user.email)
  .maybeSingle();

if (profileData?.detected_profile) {
  setPrimeProfile({
    detectedProfile: profileData.detected_profile,
    risk: profileData.risk,
    strength: profileData.strength,
    weakness: profileData.weakness,
    prescription: profileData.prescription,
    checklist: profileData.checklist || [],
  });
} else {
  const savedProfile = localStorage.getItem("primeProfile");

  if (savedProfile) {
    setPrimeProfile(JSON.parse(savedProfile));
  }
}

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
  };

  const scores = sessions
    .map((s) => s.discipline_score)
    .filter((score) => typeof score === "number");

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const totalXP = sessions.reduce((total, s) => total + (s.xp_gain || 0), 0);
  const totalStreak = sessions.reduce((total, s) => total + (s.streak_gain || 0), 0);

  const level = getPrimeLevel(totalXP);

  return (
    <main className="profile-page">
      <style>{`
        * { box-sizing: border-box; }

        .profile-page {
          min-height: 100vh;
          padding: 32px 20px 150px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.86),
              rgba(0,0,0,0.96)
            ),
            #000;
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 6px;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .title {
          font-size: 58px;
          line-height: 0.92;
          font-weight: 900;
          letter-spacing: -3px;
          margin: 0;
        }

        .title span {
          display: block;
          color: rgba(255,255,255,0.88);
        }

        .subtitle {
          margin-top: 24px;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255,255,255,0.68);
          margin-bottom: 30px;
        }

        .card {
          position: relative;
          overflow: hidden;
          padding: 26px;
          margin-bottom: 18px;
          border-radius: 34px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.02)
            ),
            rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(22px);
          box-shadow:
            0 20px 60px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .icon-box {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          background: rgba(212,176,106,0.10);
          border: 1px solid rgba(212,176,106,0.18);
          color: #D4B06A;
        }

        .card-label {
          color: rgba(212,176,106,0.82);
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .card-title {
          font-size: 29px;
          line-height: 1.18;
          font-weight: 850;
          margin: 0;
          color: #D4B06A;
        }

        .text {
          margin-top: 18px;
          font-size: 17px;
          line-height: 1.75;
          color: rgba(255,255,255,0.72);
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .mini-card {
          padding: 20px;
          border-radius: 26px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.02)
            ),
            rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
        }

        .mini-label {
          margin-top: 14px;
          font-size: 12px;
          color: rgba(212,176,106,0.82);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .mini-value {
          margin-top: 10px;
          font-size: 25px;
          font-weight: 900;
        }

        .list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 16px;
        }

        .list-text {
          margin: 0;
          color: rgba(255,255,255,0.78);
          font-size: 16px;
          line-height: 1.6;
        }

        @media(max-width:520px) {
          .title { font-size: 50px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <section>
          <div className="brand">ADN TRADER</div>

          <h1 className="title">
            Ton profil
            <span>PRIME.</span>
          </h1>

          <p className="subtitle">
            Ton espace personnel réunit ton identité de trader, ton niveau,
            ta progression et ta discipline réelle.
          </p>
        </section>

        <section className="card">
          <div className="icon-box">
            <User size={26} />
          </div>

          <div className="card-label">PROFIL DÉTECTÉ</div>

          <h2 className="card-title">
            {primeProfile?.detectedProfile || "Profil non généré"}
          </h2>

          <p className="text">
            {primeProfile
              ? `Risque dominant : ${primeProfile.risk}`
              : "Va dans PRIME Identity pour générer ton profil trader personnalisé."}
          </p>
        </section>

        <section className="grid">
          <div className="mini-card">
            <Crown size={24} color="#D4B06A" />
            <div className="mini-label">Niveau</div>
            <div className="mini-value">{level}</div>
          </div>

          <div className="mini-card">
            <Sparkles size={24} color="#D4B06A" />
            <div className="mini-label">XP</div>
            <div className="mini-value">{totalXP}</div>
          </div>

          <div className="mini-card">
            <ShieldCheck size={24} color="#D4B06A" />
            <div className="mini-label">Score moyen</div>
            <div className="mini-value">{averageScore}%</div>
          </div>

          <div className="mini-card">
            <Flame size={24} color="#D4B06A" />
            <div className="mini-label">Streak</div>
            <div className="mini-value">{totalStreak}</div>
          </div>
        </section>

        <section className="card">
          <div className="icon-box">
            <Target size={26} />
          </div>

          <div className="card-label">PRESCRIPTION ACTIVE</div>

          <h2 className="card-title">
            {primeProfile?.prescription || "Aucune prescription"}
          </h2>

          <p className="text">
            Cette prescription sert de règle comportementale principale pour
            protéger ton exécution.
          </p>
        </section>

        <section className="card">
          <div className="icon-box">
            <CheckCircle size={26} />
          </div>

          <div className="card-label">CHECKLIST PERSONNALISÉE</div>

          {primeProfile?.checklist?.length > 0 ? (
            primeProfile.checklist.map((item) => (
              <div key={item} className="list-item">
                <CheckCircle size={18} color="#D4B06A" />
                <p className="list-text">{item}</p>
              </div>
            ))
          ) : (
            <p className="text">
              Ta checklist personnalisée apparaîtra après la création de ton
              profil PRIME Identity.
            </p>
          )}
        </section>
      </div>

      <BottomNav active="Profil" />
    </main>
  );
}

function getPrimeLevel(xp) {
  if (xp >= 1500) return "PRIME Operator";
  if (xp >= 900) return "Institutional Mindset";
  if (xp >= 500) return "Elite Executor";
  if (xp >= 250) return "Consistent Trader";
  if (xp >= 100) return "Discipline Builder";
  return "Rookie Trader";
}

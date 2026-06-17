"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  Brain,
  Flame,
  ChevronRight,
  Sparkles,
  Crown,
  ShieldAlert,
  BookOpen,
  User,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import BottomNav from "./components/BottomNav";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState("Trader en construction");
  const [averageScore, setAverageScore] = useState(0);
  const [lastScore, setLastScore] = useState(null);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [activePrescription, setActivePrescription] = useState(null);
  const [riskState, setRiskState] = useState("Sous observation");
  const [focus, setFocus] = useState("Respecter le process avant le résultat.");

  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription) {
      router.push("/offer");
      return;
    }

    const { data: identityData } = await supabase
      .from("prime_identity_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (identityData) {
      setProfile(identityData.profile || "Trader en construction");
      setAverageScore(identityData.discipline_average || 0);
    }

    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "closed")
      .order("created_at", { ascending: false });

    if (sessionsData) {
      setSessionsCount(sessionsData.length);

      if (
        sessionsData[0] &&
        sessionsData[0].discipline_score !== null &&
        sessionsData[0].discipline_score !== undefined
      ) {
        setLastScore(Number(sessionsData[0].discipline_score));
      }

      const scores = sessionsData
        .map((s) => Number(s.discipline_score))
        .filter((score) => !Number.isNaN(score));

      if (!identityData && scores.length > 0) {
        const avg = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length
        );

        setAverageScore(avg);
      }

      const lastThree = sessionsData.slice(0, 3);

      const lowDiscipline =
        lastThree.length === 3 &&
        lastThree.every((s) => Number(s.discipline_score) < 65);

      if (lowDiscipline) {
        setRiskState("Risque discipline élevé");
      } else if (sessionsData[0]?.dominant_error) {
        setRiskState("Pattern à surveiller");
      } else {
        setRiskState("Stable");
      }
    }

    const { data: prescriptionData } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (prescriptionData) {
      setActivePrescription(prescriptionData);
    }

    setFocus(getFocusByProfile(identityData?.profile));

    setLoading(false);
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <style>{`
          .loading-screen {
            min-height: 100vh;
            background: #000;
            color: #D4B06A;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, Arial, sans-serif;
            letter-spacing: 4px;
            text-transform: uppercase;
          }
        `}</style>

        Chargement PRIME...
      </main>
    );
  }

  const prescriptionProgress = activePrescription
    ? (activePrescription.compliance_days || 0) +
      (activePrescription.missed_days || 0)
    : 0;

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
          padding: 32px 18px 140px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(circle at top right, rgba(212,176,106,0.16), transparent 34%),
            linear-gradient(180deg, #050505 0%, #000 100%);
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 28px;
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 7px;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .title {
          margin: 0;
          font-size: 56px;
          line-height: 0.92;
          font-weight: 900;
          letter-spacing: -3px;
        }

        .title span {
          display: block;
          color: rgba(255,255,255,0.88);
        }

        .subtitle {
          margin-top: 22px;
          font-size: 18px;
          line-height: 1.65;
          color: rgba(255,255,255,0.68);
        }

        .card,
        .live-card {
          padding: 26px;
          margin-bottom: 18px;
          border-radius: 34px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 20px 60px rgba(0,0,0,0.55);
        }

        .label {
          color: rgba(212,176,106,0.86);
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .card-title {
          margin: 0;
          font-size: 30px;
          line-height: 1.1;
          font-weight: 900;
          color: #D4B06A;
        }

        .text {
          margin-top: 18px;
          color: rgba(255,255,255,0.72);
          font-size: 16px;
          line-height: 1.7;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .mini-card,
        .action-card {
          padding: 20px;
          border-radius: 28px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            rgba(5,5,5,0.76);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .mini-label {
          margin-top: 14px;
          color: rgba(212,176,106,0.82);
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .mini-value {
          margin-top: 8px;
          font-size: 28px;
          font-weight: 900;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .action-card {
          min-height: 120px;
          color: white;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .action-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .action-icon {
          color: #D4B06A;
        }

        .arrow {
          color: rgba(255,255,255,0.34);
        }

        .action-label {
          color: rgba(212,176,106,0.82);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 8px;
        }

        .action-title {
          margin: 0;
          font-size: 22px;
          font-weight: 900;
        }

        @media(max-width: 390px) {
          .grid,
          .actions-grid {
            grid-template-columns: 1fr;
          }

          .title {
            font-size: 48px;
          }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <p className="brand">PRIME DASHBOARD</p>

          <h1 className="title">
            Ton cockpit
            <span>d’exécution.</span>
          </h1>

          <p className="subtitle">
            Chaque session alimente ton score, ton identité PRIME et tes
            prescriptions comportementales.
          </p>
        </section>

        <section className="live-card">
          <p className="label">IDENTITÉ ACTIVE</p>

          <h2 className="card-title">{profile}</h2>

          <p className="text">Focus du jour : {focus}</p>
        </section>

        <section className="grid">
          <div className="mini-card">
            <Target size={26} color="#D4B06A" />

            <div className="mini-label">Score moyen</div>

            <div className="mini-value">{averageScore}%</div>
          </div>

          <div className="mini-card">
            <Flame size={26} color="#D4B06A" />

            <div className="mini-label">Dernier score</div>

            <div className="mini-value">
              {lastScore !== null ? `${lastScore}%` : "—"}
            </div>
          </div>
        </section>

        <section className="card">
          <p className="label">PRESCRIPTION ACTIVE</p>

          <h2 className="card-title">
            {activePrescription
              ? activePrescription.title
              : "Aucune prescription"}
          </h2>

          <p className="text">
            {activePrescription
              ? activePrescription.rule
              : "PRIME activera une prescription lorsqu’un vrai pattern comportemental sera détecté."}
          </p>

          {activePrescription && (
            <p className="text">
              Progression : Jour {prescriptionProgress} /{" "}
              {activePrescription.duration_days || 7}
            </p>
          )}
        </section>

        <section className="grid">
          <div className="mini-card">
            <ShieldAlert size={26} color="#D4B06A" />

            <div className="mini-label">Risque actuel</div>

            <div className="mini-value">{riskState}</div>
          </div>

          <div className="mini-card">
            <Sparkles size={26} color="#D4B06A" />

            <div className="mini-label">Sessions lues</div>

            <div className="mini-value">{sessionsCount}</div>
          </div>
        </section>

        <section className="actions-grid">
          <ActionButton
            href="/session"
            icon={<Target size={24} />}
            label="Exécution"
            title="Session"
          />

          <ActionButton
            href="/coach"
            icon={<Brain size={24} />}
            label="Analyse"
            title="Coach"
          />

          <ActionButton
            href="/journal"
            icon={<BookOpen size={24} />}
            label="Historique"
            title="Journal"
          />

          <ActionButton
            href="/profile"
            icon={<User size={24} />}
            label="Compte"
            title="Profil"
          />

          <ActionButton
            href="/identity"
            icon={<Crown size={24} />}
            label="PRIME"
            title="Identity"
          />
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

function ActionButton({ href, icon, label, title }) {
  return (
    <Link href={href} className="action-card">
      <div className="action-top">
        <div className="action-icon">{icon}</div>

        <ChevronRight size={20} className="arrow" />
      </div>

      <div>
        <p className="action-label">{label}</p>

        <h3 className="action-title">{title}</h3>
      </div>
    </Link>
  );
}

function getFocusByProfile(profile) {
  switch (profile) {
    case "Trader Impulsif":
      return "Ralentir avant d’agir.";

    case "Trader FOMO":
      return "Accepter de laisser partir une opportunité.";

    case "Trader Désorganisé":
      return "Structurer ton plan avant l’exécution.";

    case "Trader Patient":
      return "Maintenir ton cadre sans excès de confiance.";

    case "Trader Agressif":
      return "Rendre ton invalidation non négociable.";

    default:
      return "Respecter le process avant le résultat.";
  }
}

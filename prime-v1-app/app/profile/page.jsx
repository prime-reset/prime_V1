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
  TrendingUp,
  CheckCircle,
  PlayCircle,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import BottomNav from "./components/BottomNav";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Trader");
  const [profile, setProfile] = useState("Trader en construction");
  const [averageScore, setAverageScore] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [activePrescription, setActivePrescription] = useState(null);
  const [riskState, setRiskState] = useState("Sous contrôle");
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

    const { data: profileData } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("email", user.email)
      .maybeSingle();

    if (profileData?.display_name) {
      setDisplayName(profileData.display_name);
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
      setSessions(sessionsData);
      setSessionsCount(sessionsData.length);

      const scores = sessionsData
        .map((s) => Number(s.discipline_score))
        .filter((score) => !Number.isNaN(score));

      if (!identityData && scores.length > 0) {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        setAverageScore(avg);
      }

      setRiskState(getRiskFromSessions(sessionsData));
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
            background: #050505;
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

  const lastSession = sessions[0] || null;
  const weekDays = getCurrentWeekData(sessions);
  const weekPnl = weekDays.reduce((sum, day) => sum + day.pnl, 0);
  const weekPlanRate = getWeekPlanRate(weekDays);

  const prescriptionProgress = activePrescription
    ? (activePrescription.compliance_days || 0) +
      (activePrescription.missed_days || 0)
    : 0;

  const prescriptionDuration = activePrescription?.duration_days || 7;

  const prescriptionPercent = activePrescription
    ? Math.min(Math.round((prescriptionProgress / prescriptionDuration) * 100), 100)
    : 0;

  const lastPnl = Number(lastSession?.session_pnl || 0);

  return (
    <main className="prime-home">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #050505;
        }

        .prime-home {
          min-height: 100vh;
          padding: 30px 18px 128px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background: #050505;
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 7px;
          font-size: 13px;
          text-transform: uppercase;
          margin-bottom: 22px;
        }

        .hero {
          margin-bottom: 24px;
        }

        .title {
          margin: 0;
          font-size: 46px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -2.6px;
        }

        .title strong {
          color: #D4B06A;
          font-weight: 900;
        }

        .subtitle {
          margin-top: 14px;
          font-size: 18px;
          line-height: 1.45;
          color: rgba(255,255,255,0.62);
        }

        .card,
        .score-card,
        .metric-card,
        .cta-card,
        .action-card {
          border-radius: 26px;
          background: #101010;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 18px 45px rgba(0,0,0,0.38);
        }

        .score-card {
          padding: 24px;
          margin-bottom: 14px;
        }

        .score-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 20px;
          align-items: center;
        }

        .score-ring {
          width: 128px;
          height: 128px;
          border-radius: 50%;
          background:
            conic-gradient(#D4B06A ${averageScore * 3.6}deg, rgba(255,255,255,0.10) 0deg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 0 28px rgba(212,176,106,0.12);
        }

        .score-ring::before {
          content: "";
          position: absolute;
          width: 104px;
          height: 104px;
          border-radius: 50%;
          background: #050505;
        }

        .score-number {
          position: relative;
          z-index: 1;
          font-size: 36px;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .label {
          color: #D4B06A;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .score-title {
          margin: 0;
          font-size: 22px;
          line-height: 1.25;
          font-weight: 900;
        }

        .score-text {
          margin-top: 12px;
          color: rgba(255,255,255,0.68);
          font-size: 14px;
          line-height: 1.55;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        .metric-card {
          min-height: 150px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .metric-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .icon {
          color: #D4B06A;
        }

        .arrow {
          color: rgba(255,255,255,0.34);
        }

        .metric-title {
          margin: 0;
          color: #D4B06A;
          font-size: 12px;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          font-weight: 900;
        }

        .metric-value {
          margin: 10px 0 0;
          font-size: 28px;
          font-weight: 950;
          line-height: 1.05;
          letter-spacing: -0.6px;
        }

        .metric-caption {
          margin: 10px 0 0;
          color: rgba(255,255,255,0.64);
          font-size: 14px;
          line-height: 1.45;
        }

        .progress-track {
          margin-top: 14px;
          height: 8px;
          width: 100%;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 999px;
          background: #D4B06A;
        }

        .cta-card {
          margin: 14px 0 18px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          text-decoration: none;
          background: linear-gradient(90deg, #D4B06A, #f0d28a);
          color: #050505;
          border: none;
        }

        .cta-icon {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          background: rgba(0,0,0,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .cta-title {
          margin: 0;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -0.2px;
        }

        .cta-subtitle {
          margin: 6px 0 0;
          color: rgba(0,0,0,0.62);
          font-size: 14px;
          font-weight: 800;
        }

        .card {
          padding: 22px;
          margin-bottom: 14px;
        }

        .card-title {
          margin: 0;
          font-size: 25px;
          line-height: 1.16;
          font-weight: 950;
          color: #D4B06A;
        }

        .text {
          margin-top: 14px;
          color: rgba(255,255,255,0.68);
          font-size: 15px;
          line-height: 1.6;
        }

        .week-dots {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-top: 18px;
        }

        .week-dot {
          min-height: 62px;
          border-radius: 17px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .week-label {
          font-size: 11px;
          color: rgba(255,255,255,0.62);
          font-weight: 900;
        }

        .week-pnl {
          font-size: 12px;
          color: rgba(255,255,255,0.82);
          font-weight: 950;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 14px;
        }

        .action-card {
          min-height: 105px;
          padding: 18px;
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

        .action-label {
          color: #D4B06A;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin: 0 0 8px;
          font-weight: 900;
        }

        .action-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
        }

        @media(max-width: 390px) {
          .title { font-size: 40px; }
          .score-grid {
            grid-template-columns: 1fr;
          }
          .score-ring {
            margin: 0 auto;
          }
          .grid,
          .actions-grid {
            grid-template-columns: 1fr;
          }
          .week-dots { gap: 6px; }
          .week-dot { min-height: 56px; border-radius: 15px; }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <p className="brand">PRIME</p>

          <h1 className="title">
            Bonjour <strong>{displayName}.</strong>
          </h1>

          <p className="subtitle">Focus. Discipline. Maîtrise.</p>
        </section>

        <section className="score-card">
          <div className="label">SCORE PRIME</div>

          <div className="score-grid">
            <div className="score-ring">
              <div className="score-number">{averageScore}%</div>
            </div>

            <div>
              <h2 className="score-title">Score d’exécution</h2>

              <p className="score-text">
                Ce score mesure la qualité de ton exécution : checklist respectée,
                plan suivi, erreurs comportementales évitées.
                <br />
                <br />
                Il ne juge pas ton PnL. Une perte avec un plan respecté peut être
                une bonne session.
              </p>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="metric-card">
            <div className="metric-top">
              <div>
                <p className="metric-title">Dernière session</p>
              </div>
              <Flame size={22} className="icon" />
            </div>

            <div>
              <p
                className="metric-value"
                style={{
                  color:
                    lastPnl > 0
                      ? "#6BE28B"
                      : lastPnl < 0
                      ? "#F05B5B"
                      : "#fff",
                }}
              >
                {lastPnl > 0 ? "+" : ""}
                {lastPnl}€
              </p>

              <p className="metric-caption">
                Discipline : {lastSession?.discipline_score ?? 0}% ·{" "}
                {lastSession?.plan_respected === true
                  ? "Plan respecté"
                  : lastSession?.plan_respected === false
                  ? "Hors plan"
                  : "Plan non renseigné"}
              </p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <div>
                <p className="metric-title">PnL semaine</p>
              </div>
              <TrendingUp size={22} className="icon" />
            </div>

            <div>
              <p
                className="metric-value"
                style={{
                  color:
                    weekPnl > 0
                      ? "#6BE28B"
                      : weekPnl < 0
                      ? "#F05B5B"
                      : "#fff",
                }}
              >
                {weekPnl > 0 ? "+" : ""}
                {weekPnl}€
              </p>

              <p className="metric-caption">{sessionsCount} sessions analysées</p>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="metric-card">
            <div className="metric-top">
              <Target size={28} className="icon" />
              <ChevronRight size={20} className="arrow" />
            </div>

            <div>
              <p className="metric-title">Prescription active</p>
              <p className="metric-caption">
                {activePrescription
                  ? activePrescription.rule
                  : "Aucune prescription active."}
              </p>

              {activePrescription && (
                <>
                  <p className="metric-caption">
                    <strong>{prescriptionProgress}</strong> / {prescriptionDuration} jours
                  </p>
                  <div className="progress-track">
                    <div
                      className="progress-bar"
                      style={{ width: `${prescriptionPercent}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <ShieldAlert size={28} className="icon" />
              <ChevronRight size={20} className="arrow" />
            </div>

            <div>
              <p className="metric-title">Risque actuel</p>
              <p className="metric-value" style={{ fontSize: "22px", color: "#D4B06A" }}>
                {riskState}
              </p>
              <p className="metric-caption">{focus}</p>
            </div>
          </div>
        </section>

        <Link href="/session" className="cta-card">
          <div className="cta-icon">
            <PlayCircle size={27} />
          </div>

          <div style={{ flex: 1 }}>
            <p className="cta-title">Démarrer une session</p>
            <p className="cta-subtitle">Avant ou après ton trade.</p>
          </div>

          <ChevronRight size={25} />
        </Link>

        <section className="card">
          <div className="label">CALENDRIER PRIME</div>
          <h2 className="card-title">Ta semaine d’exécution</h2>

          <div className="week-dots">
            {weekDays.map((day) => (
              <div key={day.label} className="week-dot" style={getWeekDayStyle(day)}>
                <div className="week-label">{day.label}</div>
                <div
                  className="week-pnl"
                  style={{
                    color:
                      day.pnl > 0
                        ? "#6BE28B"
                        : day.pnl < 0
                        ? "#F05B5B"
                        : "rgba(255,255,255,0.68)",
                  }}
                >
                  {day.pnl > 0 ? "+" : ""}
                  {day.pnl}€
                </div>
              </div>
            ))}
          </div>

          <p className="text">
            Respect du plan cette semaine : <strong>{weekPlanRate}%</strong>
          </p>
        </section>

        <section className="card">
          <div className="label">PROFIL ACTUEL</div>
          <h2 className="card-title">{profile}</h2>
          <p className="text">
            Niveau : <strong>{getPrimeLevel(averageScore, sessionsCount)}</strong>
            <br />
            Sessions analysées : <strong>{sessionsCount}</strong>
          </p>
        </section>

        <section className="actions-grid">
          <ActionButton href="/onboarding" icon={<Crown size={22} />} label="PRIME" title="Identity" />
          <ActionButton href="/profile" icon={<User size={22} />} label="Compte" title="Profil" />
          <ActionButton href="/coach" icon={<Brain size={22} />} label="Analyse" title="Coach" />
          <ActionButton href="/journal" icon={<BookOpen size={22} />} label="Historique" title="Journal" />
        </section>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

function ActionButton({ href, icon, label, title }) {
  return (
    <Link href={href} className="action-card">
      <div className="action-top">
        <div className="icon">{icon}</div>
        <ChevronRight size={18} className="arrow" />
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

function getPrimeLevel(score, count) {
  if (count < 5) return "En construction";
  if (score >= 85) return "Consistant";
  if (score >= 70) return "Confirmé";
  if (score >= 55) return "Intermédiaire";
  return "À stabiliser";
}

function getRiskFromSessions(sessions) {
  const closedSessions = sessions
    .filter((s) => s.status === "closed")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const lastThree = closedSessions.slice(0, 3);
  const lastFive = closedSessions.slice(0, 5);

  const lowDiscipline =
    lastThree.length === 3 &&
    lastThree.every((s) => Number(s.discipline_score) < 65);

  if (lowDiscipline) return "Discipline en baisse";

  const revengeCount = lastFive.filter(
    (s) => s.dominant_error === "Revenge trade"
  ).length;

  if (revengeCount >= 2) return "Revenge Trading détecté";

  const overtradingCount = lastFive.filter(
    (s) => s.dominant_error === "Overtrading"
  ).length;

  if (overtradingCount >= 2) return "Overtrading détecté";

  const fomoCount = lastFive.filter((s) => s.dominant_error === "Entrée FOMO").length;

  if (fomoCount >= 2) return "FOMO à surveiller";

  return "Sous contrôle";
}

function getCurrentWeekData(sessions) {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const daySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.created_at);
      return sessionDate.toDateString() === date.toDateString();
    });

    const pnl = daySessions.reduce(
      (sum, session) => sum + Number(session.session_pnl || 0),
      0
    );

    const hasSession = daySessions.length > 0;

    const respectedCount = daySessions.filter(
      (session) => session.plan_respected === true
    ).length;

    const notRespectedCount = daySessions.filter(
      (session) => session.plan_respected === false
    ).length;

    const planRespected =
      hasSession && notRespectedCount === 0 && respectedCount > 0;

    const planNotRespected = hasSession && notRespectedCount > 0;

    return {
      label,
      pnl,
      hasSession,
      planRespected,
      planNotRespected,
    };
  });
}

function getWeekDayStyle(day) {
  if (!day.hasSession) {
    return {
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.07)",
    };
  }

  if (day.planRespected) {
    return {
      background: "rgba(107,226,139,0.12)",
      border: "1px solid rgba(107,226,139,0.30)",
    };
  }

  if (day.planNotRespected && day.pnl > 0) {
    return {
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.14)",
    };
  }

  if (day.planNotRespected && day.pnl < 0) {
    return {
      background: "rgba(240,91,91,0.13)",
      border: "1px solid rgba(240,91,91,0.32)",
    };
  }

  return {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
  };
}

function getWeekPlanRate(days) {
  const tradedDays = days.filter((day) => day.hasSession);
  if (tradedDays.length === 0) return 0;

  const respectedDays = tradedDays.filter((day) => day.planRespected).length;
  return Math.round((respectedDays / tradedDays.length) * 100);
}


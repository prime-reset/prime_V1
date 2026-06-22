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
  CalendarDays,
  TrendingUp,
  CheckCircle,
  PlayCircle,
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

  return (
    <main className="prime-home">
      <style>{`
        * { box-sizing: border-box; }

        body { margin: 0; background: #000; }

        .prime-home {
          min-height: 100vh;
          padding: 32px 18px 140px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(circle at top right, rgba(212,176,106,0.18), transparent 34%),
            linear-gradient(180deg, #050505 0%, #000 100%);
        }

        .page { max-width: 460px; margin: 0 auto; }
        .hero { margin-bottom: 24px; }

        .brand {
          color: #D4B06A;
          letter-spacing: 7px;
          font-size: 13px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .title {
          margin: 0;
          font-size: 52px;
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: -3px;
        }

        .subtitle {
          margin-top: 20px;
          font-size: 18px;
          line-height: 1.65;
          color: rgba(255,255,255,0.68);
        }

        .card,
        .live-card,
        .cta-card,
        .action-card {
          border-radius: 34px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 20px 60px rgba(0,0,0,0.55);
        }

        .card,
        .live-card { padding: 26px; margin-bottom: 18px; }

        .cta-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 22px;
          margin-bottom: 18px;
          text-decoration: none;
          color: #000;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          border: none;
        }

        .cta-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          letter-spacing: -0.5px;
        }

        .cta-subtitle {
          margin: 6px 0 0;
          color: rgba(0,0,0,0.64);
          font-size: 14px;
          font-weight: 800;
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

        .score-explain {
          margin-top: 16px;
          padding: 16px;
          border-radius: 22px;
          background: rgba(212,176,106,0.08);
          border: 1px solid rgba(212,176,106,0.16);
          color: rgba(255,255,255,0.76);
          font-size: 15px;
          line-height: 1.65;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .mini-card {
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
          font-size: 27px;
          font-weight: 900;
          line-height: 1.05;
        }

        .progress-track {
          margin-top: 20px;
          height: 12px;
          width: 100%;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #9d742f, #D4B06A, #fff2b8);
        }

        .week-dots {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-top: 20px;
        }

        .week-dot {
          min-height: 56px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .week-label {
          font-size: 11px;
          color: rgba(255,255,255,0.70);
          font-weight: 800;
        }

        .week-pnl {
          font-size: 11px;
          color: rgba(255,255,255,0.82);
          font-weight: 900;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .action-card {
          min-height: 112px;
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

        .action-icon { color: #D4B06A; }
        .arrow { color: rgba(255,255,255,0.34); }

        .action-label {
          color: rgba(212,176,106,0.82);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 8px;
        }

        .action-title {
          margin: 0;
          font-size: 21px;
          font-weight: 900;
        }

        @media(max-width: 390px) {
          .grid,
          .actions-grid { grid-template-columns: 1fr; }
          .title { font-size: 44px; }
          .week-dots { gap: 6px; }
          .week-dot { min-height: 52px; border-radius: 15px; }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <p className="brand">PRIME DASHBOARD</p>

          <h1 className="title">Bonjour {displayName} 👋</h1>

          <p className="subtitle">
            Voici ton cockpit PRIME pour aujourd'hui.
          </p>
        </section>

        <Link href="/session" className="cta-card">
          <div>
            <p className="cta-title">Commencer ma session</p>
            <p className="cta-subtitle">Prépare, exécute, débriefe.</p>
          </div>
          <PlayCircle size={34} />
        </Link>

        <section className="live-card">
          <p className="label">IDENTITÉ PRIME</p>
          <h2 className="card-title">{profile}</h2>

          <p className="text">
            Niveau : <strong>{getPrimeLevel(averageScore, sessionsCount)}</strong>
            <br />
            Sessions analysées : <strong>{sessionsCount}</strong>
            <br />
            Score moyen : <strong>{averageScore}%</strong>
          </p>
        </section>

        <section className="card">
          <p className="label">SCORE PRIME</p>
          <h2 className="card-title">{averageScore}%</h2>

          <div className="score-explain">
            Le Score PRIME mesure la qualité de ton exécution : checklist respectée,
            plan suivi et erreurs comportementales évitées. Il ne juge pas ton PnL.
            Une perte avec un plan respecté peut être une bonne session.
          </div>
        </section>

        <section className="card">
          <p className="label">FOCUS DU JOUR</p>
          <h2 className="card-title">{focus}</h2>
          <p className="text">
            Le PnL dit ce que le marché t’a donné. Le Score PRIME dit ce que tu as maîtrisé.
          </p>
        </section>

        <section className="card">
          <p className="label">PRESCRIPTION ACTIVE</p>

          <h2 className="card-title">
            {activePrescription ? activePrescription.title : "Aucune prescription"}
          </h2>

          <p className="text">
            {activePrescription
              ? activePrescription.rule
              : "PRIME activera une prescription lorsqu’un vrai pattern comportemental sera détecté."}
          </p>

          {activePrescription && (
            <>
              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{ width: `${prescriptionPercent}%` }}
                />
              </div>

              <p className="text">
                Progression : {prescriptionProgress} / {prescriptionDuration} jours
              </p>
            </>
          )}
        </section>

        <section className="grid">
          <div className="mini-card">
            <ShieldAlert size={26} color="#D4B06A" />
            <div className="mini-label">Risque principal</div>
            <div className="mini-value">{riskState}</div>
          </div>

          <div className="mini-card">
            <TrendingUp size={26} color="#D4B06A" />
            <div className="mini-label">PnL semaine</div>
            <div
              className="mini-value"
              style={{
                color:
                  weekPnl > 0 ? "#7DFFA1" : weekPnl < 0 ? "#FF7D7D" : "#fff",
              }}
            >
              {weekPnl > 0 ? "+" : ""}
              {weekPnl}€
            </div>
          </div>
        </section>

        {lastSession && (
          <section className="card">
            <p className="label">DERNIÈRE SESSION</p>
            <h2 className="card-title">
              Discipline : {lastSession.discipline_score ?? 0}%
            </h2>

            <p
              className="text"
              style={{
                color:
                  Number(lastSession.session_pnl || 0) > 0
                    ? "#7DFFA1"
                    : Number(lastSession.session_pnl || 0) < 0
                    ? "#FF7D7D"
                    : "rgba(255,255,255,0.72)",
                fontWeight: 900,
              }}
            >
              PnL : {Number(lastSession.session_pnl || 0) > 0 ? "+" : ""}
              {Number(lastSession.session_pnl || 0)}€
            </p>

            <p
              className="text"
              style={{
                color:
                  lastSession.plan_respected === true
                    ? "#7DFFA1"
                    : lastSession.plan_respected === false
                    ? "#FF7D7D"
                    : "rgba(255,255,255,0.72)",
                fontWeight: 900,
              }}
            >
              {lastSession.plan_respected === true
                ? "✓ Plan respecté"
                : lastSession.plan_respected === false
                ? "✗ Hors plan"
                : "Plan non renseigné"}
            </p>
          </section>
        )}

        <section className="card">
          <p className="label">CALENDRIER PRIME</p>
          <h2 className="card-title">Ta semaine</h2>

          <div className="week-dots">
            {weekDays.map((day) => (
              <div key={day.label} className="week-dot" style={getWeekDayStyle(day)}>
                <div className="week-label">{day.label}</div>
                <div className="week-pnl">
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

        <section className="grid">
          <div className="mini-card">
            <CheckCircle size={26} color="#D4B06A" />
            <div className="mini-label">Plans respectés</div>
            <div className="mini-value">{weekPlanRate}%</div>
          </div>

          <div className="mini-card">
            <Sparkles size={26} color="#D4B06A" />
            <div className="mini-label">Sessions lues</div>
            <div className="mini-value">{sessionsCount}</div>
          </div>
        </section>

        <section className="actions-grid">
          <ActionButton href="/onboarding" icon={<Crown size={24} />} label="PRIME" title="Identity" />
          <ActionButton href="/profile" icon={<User size={24} />} label="Compte" title="Profil" />
          <ActionButton href="/coach" icon={<Brain size={24} />} label="Analyse" title="Coach" />
          <ActionButton href="/journal" icon={<BookOpen size={24} />} label="Historique" title="Journal" />
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

  const fomoCount = lastFive.filter(
    (s) => s.dominant_error === "Entrée FOMO"
  ).length;

  if (fomoCount >= 2) return "FOMO à surveiller";

  return "Stable";
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

    const planRespected = hasSession && notRespectedCount === 0 && respectedCount > 0;
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
      background: "rgba(125,255,161,0.12)",
      border: "1px solid rgba(125,255,161,0.30)",
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
      background: "rgba(255,80,80,0.13)",
      border: "1px solid rgba(255,80,80,0.32)",
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


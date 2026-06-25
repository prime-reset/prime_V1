"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  Flame,
  ShieldAlert,
  TrendingUp,
  CheckCircle,
  CalendarDays,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function JournalPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJournal();
  }, []);

  const loadJournal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setSessions(data);

    setLoading(false);
  };

  const lastSession = sessions[0] || null;
  const weekDays = getCurrentWeekData(sessions);

  const weekPnl = weekDays.reduce((sum, day) => sum + day.pnl, 0);
  const weekSessions = weekDays.reduce((sum, day) => sum + day.sessionsCount, 0);
  const weekPlanRate = getWeekPlanRate(weekDays);

  const scores = sessions
    .map((session) => Number(session.discipline_score))
    .filter((score) => !Number.isNaN(score));

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const lastPnl = Number(lastSession?.session_pnl || 0);

  return (
    <main className="journal-page">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #050505;
        }

        .journal-page {
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
          margin-bottom: 18px;
        }

        .hero {
          margin-bottom: 22px;
        }

        .title {
          margin: 0;
          font-size: 46px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -2.6px;
        }

        .title span {
          display: block;
          color: rgba(255,255,255,0.88);
        }

        .subtitle {
          margin-top: 14px;
          font-size: 17px;
          line-height: 1.5;
          color: rgba(255,255,255,0.62);
        }

        .card,
        .metric-card,
        .session-card,
        .summary-card {
          border-radius: 26px;
          background: #101010;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 18px 45px rgba(0,0,0,0.38);
        }

        .summary-card {
          padding: 22px;
          margin-bottom: 14px;
        }

        .summary-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }

        .summary-pnl {
          margin: 0;
          font-size: 42px;
          line-height: 0.95;
          font-weight: 950;
          letter-spacing: -1.5px;
        }

        .summary-caption {
          margin: 10px 0 0;
          color: rgba(255,255,255,0.62);
          font-size: 15px;
          line-height: 1.45;
        }

        .label {
          color: #D4B06A;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 900;
          margin: 0 0 12px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        .metric-card {
          min-height: 128px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .metric-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .icon {
          color: #D4B06A;
        }

        .metric-title {
          margin: 0;
          color: #D4B06A;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-weight: 900;
        }

        .metric-value {
          margin: 10px 0 0;
          font-size: 27px;
          font-weight: 950;
          line-height: 1.05;
          letter-spacing: -0.5px;
        }

        .metric-caption {
          margin: 9px 0 0;
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          line-height: 1.45;
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

        .last-session {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 18px;
        }

        .data-box {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .data-label {
          color: rgba(212,176,106,0.78);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 900;
        }

        .data-value {
          color: white;
          font-size: 16px;
          line-height: 1.35;
          font-weight: 900;
        }

        .timeline-title {
          color: rgba(255,255,255,0.44);
          letter-spacing: 3px;
          font-size: 12px;
          text-transform: uppercase;
          margin: 26px 0 14px;
          font-weight: 950;
        }

        .session-card {
          padding: 18px;
          margin-bottom: 12px;
        }

        .session-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .session-date {
          margin: 0;
          color: rgba(255,255,255,0.50);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 900;
        }

        .session-score {
          margin: 0;
          color: #D4B06A;
          font-size: 20px;
          font-weight: 950;
        }

        .session-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }

        .session-note {
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.68);
          font-size: 14px;
          line-height: 1.5;
        }

        .empty {
          color: rgba(255,255,255,0.66);
          font-size: 16px;
          line-height: 1.6;
        }

        @media(max-width:390px) {
          .title { font-size: 40px; }
          .grid,
          .last-session,
          .session-main {
            grid-template-columns: 1fr;
          }
          .week-dots { gap: 6px; }
          .week-dot { min-height: 56px; border-radius: 15px; }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <p className="brand">JOURNAL PRIME</p>

          <h1 className="title">
            Journal
            <span>d’exécution.</span>
          </h1>

          <p className="subtitle">
            Ta semaine, tes sessions et tes décisions. Lis ton comportement, pas seulement ton PnL.
          </p>
        </section>

        <section className="summary-card">
          <p className="label">SEMAINE EN COURS</p>

          <div className="summary-top">
            <div>
              <p
                className="summary-pnl"
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

              <p className="summary-caption">
                {weekSessions} session(s) · {weekPlanRate}% plan respecté
              </p>
            </div>

            <CalendarDays size={30} className="icon" />
          </div>
        </section>

        <section className="grid">
          <div className="metric-card">
            <div className="metric-top">
              <p className="metric-title">Score moyen</p>
              <Flame size={22} className="icon" />
            </div>

            <div>
              <p className="metric-value">{averageScore}%</p>
              <p className="metric-caption">Qualité d’exécution globale</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p className="metric-title">Total sessions</p>
              <BookOpen size={22} className="icon" />
            </div>

            <div>
              <p className="metric-value">{sessions.length}</p>
              <p className="metric-caption">Traces comportementales</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p className="metric-title">Plan semaine</p>
              <CheckCircle size={22} className="icon" />
            </div>

            <div>
              <p className="metric-value">{weekPlanRate}%</p>
              <p className="metric-caption">Respect du cadre</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <p className="metric-title">Mental récent</p>
              <Brain size={22} className="icon" />
            </div>

            <div>
              <p className="metric-value" style={{ fontSize: "22px" }}>
                {lastSession?.post_mental_state || lastSession?.mental_state || "—"}
              </p>
              <p className="metric-caption">Dernière session</p>
            </div>
          </div>
        </section>

        <section className="card">
          <p className="label">CALENDRIER PRIME</p>
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
            Vert = plan respecté. Gris = gain hors plan. Rouge = perte hors plan.
          </p>
        </section>

        {lastSession && (
          <section className="card">
            <p className="label">DERNIÈRE SESSION</p>
            <h2 className="card-title">{getJournalInsightTitle(lastSession)}</h2>

            <div className="last-session">
              <div className="data-box">
                <div className="data-label">PnL</div>
                <div
                  className="data-value"
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
                </div>
              </div>

              <div className="data-box">
                <div className="data-label">Plan</div>
                <div
                  className="data-value"
                  style={{
                    color:
                      lastSession.plan_respected === true
                        ? "#6BE28B"
                        : lastSession.plan_respected === false
                        ? "#F05B5B"
                        : "#fff",
                  }}
                >
                  {lastSession.plan_respected === true
                    ? "Respecté"
                    : lastSession.plan_respected === false
                    ? "Hors plan"
                    : "Non renseigné"}
                </div>
              </div>

              <div className="data-box">
                <div className="data-label">Score</div>
                <div className="data-value">
                  {lastSession.discipline_score ?? 0}%
                </div>
              </div>

              <div className="data-box">
                <div className="data-label">Mental</div>
                <div className="data-value">
                  {lastSession.post_mental_state ||
                    lastSession.mental_state ||
                    "Non renseigné"}
                </div>
              </div>
            </div>

            <p className="text">{getJournalInsight(lastSession)}</p>
          </section>
        )}

        <div className="timeline-title">Historique compact</div>

        {loading && (
          <div className="card">
            <p className="empty">Chargement du journal...</p>
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="card">
            <p className="empty">
              Aucune session pour le moment. Enregistre une première session pour créer ton journal PRIME.
            </p>
          </div>
        )}

        {sessions.slice(0, 12).map((session) => {
          const pnl = Number(session.session_pnl || 0);

          return (
            <div key={session.id} className="session-card">
              <div className="session-top">
                <div>
                  <p className="session-date">{formatDate(session.created_at)}</p>
                </div>

                <p className="session-score">{session.discipline_score ?? 0}%</p>
              </div>

              <div className="session-main">
                <div className="data-box">
                  <div className="data-label">PnL</div>
                  <div
                    className="data-value"
                    style={{
                      color:
                        pnl > 0
                          ? "#6BE28B"
                          : pnl < 0
                          ? "#F05B5B"
                          : "#fff",
                    }}
                  >
                    {pnl > 0 ? "+" : ""}
                    {pnl}€
                  </div>
                </div>

                <div className="data-box">
                  <div className="data-label">Plan</div>
                  <div
                    className="data-value"
                    style={{
                      color:
                        session.plan_respected === true
                          ? "#6BE28B"
                          : session.plan_respected === false
                          ? "#F05B5B"
                          : "#fff",
                    }}
                  >
                    {session.plan_respected === true
                      ? "Respecté"
                      : session.plan_respected === false
                      ? "Hors plan"
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="session-note">
                <strong>Erreur :</strong> {session.dominant_error || "Aucune"}
                <br />
                <strong>Amélioration :</strong>{" "}
                {session.improvement_note || "Aucune note"}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav active="Journal" />
    </main>
  );
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
      date,
      pnl,
      hasSession,
      planRespected,
      planNotRespected,
      sessionsCount: daySessions.length,
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

function getJournalInsightTitle(session) {
  if (session.plan_respected === true && Number(session.session_pnl || 0) < 0) {
    return "Bonne perte.";
  }

  if (session.plan_respected === false && Number(session.session_pnl || 0) > 0) {
    return "Gain à surveiller.";
  }

  if (session.plan_respected === false && Number(session.session_pnl || 0) < 0) {
    return "Dérive coûteuse.";
  }

  if (Number(session.session_pnl || 0) > 0) {
    return "Session positive.";
  }

  return "Trace enregistrée.";
}

function getJournalInsight(session) {
  if (session.plan_respected === true && Number(session.session_pnl || 0) < 0) {
    return "Tu as perdu de l’argent, mais tu as respecté ton plan. PRIME considère cette session comme une bonne décision d’exécution.";
  }

  if (session.plan_respected === false && Number(session.session_pnl || 0) > 0) {
    return "Le PnL est positif, mais la décision était hors plan. PRIME surveille ce type de gain, car il peut renforcer un mauvais comportement.";
  }

  if (session.dominant_error === "Revenge trade") {
    return "Cette session montre une tentative de récupération émotionnelle. La priorité est de couper la boucle après une perte.";
  }

  if (session.dominant_error === "Overtrading") {
    return "Cette session montre une tendance à agir trop. La prochaine amélioration est de réduire le nombre de trades.";
  }

  if (session.dominant_error === "Entrée FOMO") {
    return "Cette session montre une entrée probablement liée à la peur de rater le mouvement. Le focus est l’attente.";
  }

  if (session.dominant_error === "Stop déplacé") {
    return "Cette session montre une négociation avec le risque. Le stop doit redevenir une frontière non négociable.";
  }

  if (session.dominant_error === "Trade hors plan") {
    return "Cette session montre un écart au cadre prévu. Le plan doit redevenir souverain.";
  }

  if ((session.discipline_score || 0) >= 85) {
    return "Très bonne trace comportementale. Le process semble avoir été respecté avec stabilité.";
  }

  return "Trace enregistrée. PRIME construit ton historique psycho-financier.";
}

function formatDate(value) {
  if (!value) return "Date inconnue";

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


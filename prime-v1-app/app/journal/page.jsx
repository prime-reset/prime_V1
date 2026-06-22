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

  const lastSession = sessions[0];

  const totalPnl = sessions.reduce(
    (sum, session) => sum + Number(session.session_pnl || 0),
    0
  );

  const planRespectedCount = sessions.filter(
    (session) => session.plan_respected === true
  ).length;

  const planRespectedRate =
    sessions.length > 0
      ? Math.round((planRespectedCount / sessions.length) * 100)
      : 0;

  const weekDays = getCurrentWeekData(sessions);

  return (
    <main className="journal-page">
      <style>{`
        * { box-sizing: border-box; }

        .journal-page {
          min-height: 100vh;
          padding: 32px 20px 150px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(circle at top right, rgba(212,176,106,0.14), transparent 34%),
            linear-gradient(180deg, #050505 0%, #000 100%);
        }

        .page { max-width: 460px; margin: 0 auto; }

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
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
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
          font-size: 27px;
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
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
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
          font-size: 24px;
          font-weight: 900;
        }

        .week-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 22px;
        }

        .week-day {
          padding: 16px;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .week-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .week-name {
          font-size: 15px;
          font-weight: 900;
        }

        .week-pnl {
          font-size: 18px;
          font-weight: 900;
        }

        .week-status {
          margin-top: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.72);
          font-weight: 700;
        }

        .week-summary {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .timeline-title {
          color: rgba(255,255,255,0.50);
          letter-spacing: 3px;
          font-size: 12px;
          text-transform: uppercase;
          margin: 28px 0 16px;
        }

        .session-card {
          padding: 22px;
          margin-bottom: 16px;
          border-radius: 28px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .session-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
        }

        .session-date {
          margin: 0;
          color: rgba(255,255,255,0.46);
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .session-score {
          margin: 0;
          color: #D4B06A;
          font-weight: 900;
          font-size: 20px;
        }

        .session-row {
          padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .session-label {
          color: rgba(212,176,106,0.78);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .session-value {
          color: rgba(255,255,255,0.78);
          font-size: 15px;
          line-height: 1.6;
          font-weight: 650;
        }

        .empty {
          color: rgba(255,255,255,0.68);
          font-size: 17px;
          line-height: 1.7;
        }

        @media(max-width:520px) {
          .title { font-size: 50px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <section>
          <div className="brand">JOURNAL PRIME</div>

          <h1 className="title">
            Ton journal
            <span>d’exécution.</span>
          </h1>

          <p className="subtitle">
            Un journal façon Notion PRIME : discipline, PnL, état mental,
            respect du plan et axes d’amélioration.
          </p>
        </section>

        <section className="card">
          <div className="icon-box">
            <BookOpen size={26} />
          </div>

          <div className="card-label">SYNTHÈSE JOURNAL</div>

          <h2 className="card-title">
            {loading
              ? "Chargement..."
              : sessions.length > 0
              ? `${sessions.length} analyses enregistrées`
              : "Ton journal est vide"}
          </h2>

          <p className="text">
            {sessions.length > 0
              ? "Chaque session devient une trace psycho-financière : ce que tu as ressenti, ce que tu as respecté, ce que tu as gagné ou perdu, et ce que tu dois améliorer."
              : "Lance une session PRIME pour créer ta première trace comportementale."}
          </p>
        </section>

        {lastSession && (
          <>
            <section className="grid">
              <div className="mini-card">
                <Brain size={24} color="#D4B06A" />
                <div className="mini-label">Mental post</div>
                <div className="mini-value">
                  {lastSession.post_mental_state || "Non noté"}
                </div>
              </div>

              <div className="mini-card">
                <Flame size={24} color="#D4B06A" />
                <div className="mini-label">Dernier score</div>
                <div className="mini-value">
                  {lastSession.discipline_score ?? 0}%
                </div>
              </div>
            </section>

            <section className="grid">
              <div className="mini-card">
                <TrendingUp size={24} color="#D4B06A" />
                <div className="mini-label">PnL total</div>
                <div
                  className="mini-value"
                  style={{
                    color:
                      totalPnl > 0
                        ? "#7DFFA1"
                        : totalPnl < 0
                        ? "#FF7D7D"
                        : "#fff",
                  }}
                >
                  {totalPnl > 0 ? "+" : ""}
                  {totalPnl}€
                </div>
              </div>

              <div className="mini-card">
                <CheckCircle size={24} color="#D4B06A" />
                <div className="mini-label">Plans respectés</div>
                <div className="mini-value">{planRespectedRate}%</div>
              </div>
            </section>

            <section className="card">
              <div className="icon-box">
                <CalendarDays size={26} />
              </div>

              <div className="card-label">VUE HEBDOMADAIRE PRIME</div>

              <h2 className="card-title">Ta semaine d’exécution</h2>

              <p className="text">
                Vert = bonne exécution. Gris = gain hors plan. Rouge = perte
                hors plan.
              </p>

              <div className="week-grid">
                {weekDays.map((day) => (
                  <div
                    key={day.label}
                    className="week-day"
                    style={getWeekDayStyle(day)}
                  >
                    <div className="week-top">
                      <div className="week-name">{day.label}</div>

                      <div
                        className="week-pnl"
                        style={{
                          color:
                            day.pnl > 0
                              ? "#7DFFA1"
                              : day.pnl < 0
                              ? "#FF7D7D"
                              : "rgba(255,255,255,0.78)",
                        }}
                      >
                        {day.pnl > 0 ? "+" : ""}
                        {day.pnl}€
                      </div>
                    </div>

                    <div className="week-status">{getWeekStatus(day)}</div>
                  </div>
                ))}
              </div>

              <div className="week-summary">
                <div>
                  <div className="mini-label">Total semaine</div>
                  <div
                    className="mini-value"
                    style={{
                      color:
                        weekDays.reduce((s, d) => s + d.pnl, 0) > 0
                          ? "#7DFFA1"
                          : weekDays.reduce((s, d) => s + d.pnl, 0) < 0
                          ? "#FF7D7D"
                          : "#fff",
                    }}
                  >
                    {weekDays.reduce((s, d) => s + d.pnl, 0) > 0 ? "+" : ""}
                    {weekDays.reduce((s, d) => s + d.pnl, 0)}€
                  </div>
                </div>

                <div>
                  <div className="mini-label">Plans respectés</div>
                  <div className="mini-value">
                    {getWeekPlanRate(weekDays)}%
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="icon-box">
                <ShieldAlert size={26} />
              </div>

              <div className="card-label">DERNIÈRE TRACE</div>

              <h2 className="card-title">
                {lastSession.dominant_error || "Aucune erreur dominante"}
              </h2>

              <p className="text">{getJournalInsight(lastSession)}</p>
            </section>
          </>
        )}

        <div className="timeline-title">JOURNAL COMPORTEMENTAL PRIME</div>

        {sessions.length === 0 && (
          <div className="card">
            <p className="empty">
              Aucune session pour le moment. Va dans Session, renseigne ton état
              mental, coche ta checklist, fais ton débrief et enregistre ta
              session.
            </p>
          </div>
        )}

        {sessions.slice(0, 12).map((session) => {
          const pnl = Number(session.session_pnl || 0);

          return (
            <div key={session.id} className="session-card">
              <div className="session-top">
                <p className="session-date">{formatDate(session.created_at)}</p>

                <p className="session-score">
                  {session.discipline_score ?? 0}%
                </p>
              </div>

              <div className="session-row">
                <div className="session-label">PnL</div>
                <div
                  className="session-value"
                  style={{
                    color:
                      pnl > 0
                        ? "#7DFFA1"
                        : pnl < 0
                        ? "#FF7D7D"
                        : "rgba(255,255,255,0.78)",
                    fontWeight: 900,
                    fontSize: "18px",
                  }}
                >
                  {pnl > 0 ? "+" : ""}
                  {pnl}€
                </div>
              </div>

              <div className="session-row">
                <div className="session-label">Respect du plan</div>
                <div
                  className="session-value"
                  style={{
                    color:
                      session.plan_respected === true
                        ? "#7DFFA1"
                        : session.plan_respected === false
                        ? "#FF7D7D"
                        : "rgba(255,255,255,0.78)",
                    fontWeight: 900,
                  }}
                >
                  {session.plan_respected === true
                    ? "✓ Plan respecté"
                    : session.plan_respected === false
                    ? "✗ Hors plan"
                    : "Plan non renseigné"}
                </div>
              </div>

              <div className="session-row">
                <div className="session-label">Mental pré-session</div>
                <div className="session-value">
                  {session.mental_state || "Non renseigné"}
                </div>
              </div>

              <div className="session-row">
                <div className="session-label">Mental post-session</div>
                <div className="session-value">
                  {session.post_mental_state || "Non renseigné"}
                </div>
              </div>

              <div className="session-row">
                <div className="session-label">Erreur dominante</div>
                <div className="session-value">
                  {session.dominant_error || "Aucune"}
                </div>
              </div>

              <div className="session-row">
                <div className="session-label">Amélioration</div>
                <div className="session-value">
                  {session.improvement_note || "Aucune note"}
                </div>
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

  if (day.planRespected && day.pnl >= 0) {
    return {
      background: "rgba(125,255,161,0.12)",
      border: "1px solid rgba(125,255,161,0.30)",
    };
  }

  if (day.planRespected && day.pnl < 0) {
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

function getWeekStatus(day) {
  if (!day.hasSession) return "Aucune session";

  if (day.planRespected && day.pnl >= 0) {
    return `Plan respecté · ${day.sessionsCount} session(s)`;
  }

  if (day.planRespected && day.pnl < 0) {
    return `Bon stop loss · plan respecté`;
  }

  if (day.planNotRespected && day.pnl > 0) {
    return `Gain hors plan · à surveiller`;
  }

  if (day.planNotRespected && day.pnl < 0) {
    return `Hors plan + perte`;
  }

  return `${day.sessionsCount} session(s) enregistrée(s)`;
}

function getWeekPlanRate(days) {
  const tradedDays = days.filter((day) => day.hasSession);
  if (tradedDays.length === 0) return 0;

  const respectedDays = tradedDays.filter((day) => day.planRespected).length;

  return Math.round((respectedDays / tradedDays.length) * 100);
}

function getJournalInsight(session) {
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

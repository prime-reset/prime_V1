"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  Flame,
  ShieldAlert,
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

    if (!error && data) {
      setSessions(data);
    }

    setLoading(false);
  };

  const lastSession = sessions[0];

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
          font-size: 24px;
          font-weight: 900;
        }

        .timeline-title {
          color: rgba(255,255,255,0.50);
          letter-spacing: 3px;
          font-size: 12px;
          text-transform: uppercase;
          margin: 26px 0 16px;
        }

        .session-card {
          padding: 22px;
          margin-bottom: 14px;
          border-radius: 28px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .session-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
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

        .session-text {
          margin: 14px 0 0;
          color: rgba(255,255,255,0.70);
          font-size: 15px;
          line-height: 1.6;
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
            Ton évolution
            <span>automatique.</span>
          </h1>

          <p className="subtitle">
            PRIME transforme tes sessions en timeline comportementale, sans te
            forcer à remplir un journal interminable.
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
              ? `${sessions.length} sessions enregistrées`
              : "Ton journal est vide"}
          </h2>

          <p className="text">
            {sessions.length > 0
              ? "Chaque session devient une trace de ta discipline, de ton état mental et de tes erreurs comportementales."
              : "Lance une session PRIME pour créer ta première trace comportementale."}
          </p>
        </section>

        {lastSession && (
          <>
            <section className="grid">
              <div className="mini-card">
                <Brain size={24} color="#D4B06A" />
                <div className="mini-label">Mental</div>
                <div className="mini-value">
                  {lastSession.mental_state || "Non noté"}
                </div>
              </div>

              <div className="mini-card">
                <Flame size={24} color="#D4B06A" />
                <div className="mini-label">Score</div>
                <div className="mini-value">
                  {lastSession.discipline_score ?? 0}%
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

              <p className="text">
                {getJournalInsight(lastSession)}
              </p>
            </section>

            <section className="card">
              <div className="icon-box">
                <Sparkles size={26} />
              </div>

              <div className="card-label">NOTE RAPIDE</div>

              <h2 className="card-title">
                Deux questions seulement.
              </h2>

              <p className="text">
                Qu’est-ce que tu as bien exécuté ? Qu’est-ce que tu dois
                améliorer à la prochaine session ? Cette partie sera connectée
                en V1 finale.
              </p>
            </section>
          </>
        )}

        <div className="timeline-title">Timeline des sessions</div>

        {sessions.length === 0 && (
          <div className="card">
            <p className="empty">
              Aucune session pour le moment. Va dans Session, active ta
              discipline, renseigne ton état mental et coche ta checklist.
            </p>
          </div>
        )}

        {sessions.slice(0, 8).map((session) => (
          <div key={session.id} className="session-card">
            <div className="session-top">
              <p className="session-date">
                {formatDate(session.created_at)}
              </p>

              <p className="session-score">
                {session.discipline_score ?? 0}%
              </p>
            </div>

            <p className="session-text">
              Mental : {session.mental_state || "non renseigné"} · Erreur :
              {" "}
              {session.dominant_error || "aucune"}
            </p>

            <p className="session-text">
              Statut : {session.status || "non défini"} · XP :
              {" "}
              {session.xp_gain || 0}
            </p>
          </div>
        ))}
      </div>

      <BottomNav active="Journal" />
    </main>
  );
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

  return "Trace enregistrée. PRIME commence à construire ton historique comportemental.";
}

function formatDate(value) {
  if (!value) return "Date inconnue";

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

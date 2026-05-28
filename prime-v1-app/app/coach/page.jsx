"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  ShieldAlert,
  Flame,
  Activity,
  Sparkles,
  Target,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function CoachPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoachData();
  }, []);

  const loadCoachData = async () => {
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

  const scores = sessions
    .map((s) => s.discipline_score)
    .filter((score) => typeof score === "number");

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const lastSession = sessions[0];

  const dominantMentalState = getDominantValue(
    sessions.map((s) => s.mental_state).filter(Boolean)
  );

  const dominantError = getDominantValue(
    sessions.map((s) => s.dominant_error).filter(Boolean)
  );

  const coach = getCoachAnalysis({
    averageScore,
    dominantMentalState,
    dominantError,
    lastSession,
    sessionsCount: sessions.length,
  });

  return (
    <main className="coach-page">
      <style>{`
        * { box-sizing: border-box; }

        .coach-page {
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

        .hero {
          margin-bottom: 28px;
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 6px;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .title {
          font-size: 64px;
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
        }

        .card {
          position: relative;
          overflow: hidden;
          padding: 28px;
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
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          background: rgba(212,176,106,0.10);
          border: 1px solid rgba(212,176,106,0.18);
          color: #D4B06A;
        }

        .card-label {
          color: rgba(212,176,106,0.82);
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 28px;
          line-height: 1.15;
          font-weight: 800;
          margin: 0;
          color: #D4B06A;
        }

        .card-text {
          margin-top: 22px;
          font-size: 17px;
          line-height: 1.8;
          color: rgba(255,255,255,0.74);
        }

        .prescription {
          font-size: 21px;
          line-height: 1.5;
          font-weight: 800;
          color: white;
          margin-top: 18px;
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

        .mini-title {
          margin-top: 16px;
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

        .score {
          font-size: 58px;
          line-height: 1;
          font-weight: 900;
          color: #D4B06A;
          margin-top: 18px;
        }

        @media(max-width:520px) {
          .title { font-size: 52px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <div className="brand">PRIME COACH</div>

          <h1 className="title">
            Ton cerveau
            <span>d’exécution.</span>
          </h1>

          <p className="subtitle">
            PRIME transforme tes données de session en diagnostic clair,
            prescription active et focus d’exécution.
          </p>
        </section>

        <section className="card">
          <div className="icon-box">
            <Brain size={28} />
          </div>

          <div className="card-label">ANALYSE IA</div>

          <h2 className="card-title">
            {loading ? "Analyse en cours..." : coach.title}
          </h2>

          <p className="card-text">{coach.analysis}</p>
        </section>

        <section className="grid">
          <div className="mini-card">
            <Activity size={24} color="#D4B06A" />
            <div className="mini-title">État mental</div>
            <div className="mini-value">
              {dominantMentalState || "Aucun"}
            </div>
          </div>

          <div className="mini-card">
            <Flame size={24} color="#D4B06A" />
            <div className="mini-title">Erreur dominante</div>
            <div className="mini-value">
              {dominantError || "Aucune"}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="icon-box">
            <ShieldAlert size={28} />
          </div>

          <div className="card-label">PRESCRIPTION ACTIVE</div>

          <div className="prescription">
            {coach.prescription}
          </div>

          <p className="card-text">
            Durée recommandée : 7 jours. PRIME ne cherche pas à te faire trader
            plus, mais à te faire exécuter mieux.
          </p>
        </section>

        <section className="grid">
          <div className="mini-card">
            <Target size={24} color="#D4B06A" />
            <div className="mini-title">Score moyen</div>
            <div className="mini-value">{averageScore}%</div>
          </div>

          <div className="mini-card">
            <Sparkles size={24} color="#D4B06A" />
            <div className="mini-title">Sessions lues</div>
            <div className="mini-value">{sessions.length}</div>
          </div>
        </section>

        <section className="card">
          <div className="icon-box">
            <Sparkles size={28} />
          </div>

          <div className="card-label">FOCUS DU JOUR</div>

          <h2 className="card-title">{coach.focusTitle}</h2>

          <p className="card-text">{coach.focus}</p>
        </section>
      </div>

      <BottomNav active="Coach" />
    </main>
  );
}

function getDominantValue(values) {
  if (!values || values.length === 0) return null;

  return values.sort(
    (a, b) =>
      values.filter((value) => value === b).length -
      values.filter((value) => value === a).length
  )[0];
}

function getCoachAnalysis({
  averageScore,
  dominantMentalState,
  dominantError,
  lastSession,
  sessionsCount,
}) {
  if (!sessionsCount) {
    return {
      title: "Coach en attente",
      analysis:
        "Lance une session PRIME pour que le coach commence à lire ton comportement réel.",
      prescription:
        "Active une session, renseigne ton état mental, coche ta checklist et note tes erreurs.",
      focusTitle: "Créer la première donnée",
      focus:
        "La première étape n’est pas de performer. C’est de créer une base de données comportementale fiable.",
    };
  }

  if (dominantError === "Revenge trade") {
    return {
      title: "Tu cherches à récupérer une émotion.",
      analysis:
        "PRIME détecte une tendance à reprendre le contrôle par l’action après une perte. Le danger n’est pas le marché, c’est la réaction émotionnelle.",
      prescription:
        "Après une perte : pause obligatoire de 20 minutes. Aucun nouveau trade sans setup A clair.",
      focusTitle: "Ne récupère pas. Reviens neutre.",
      focus:
        "Ton objectif du jour : accepter la perte sans chercher à la réparer immédiatement.",
    };
  }

  if (dominantError === "Overtrading") {
    return {
      title: "Tu confonds activité et efficacité.",
      analysis:
        "PRIME détecte une sur-exécution. Tu risques de multiplier les trades pour te rassurer, alors que ton edge vient de la sélection.",
      prescription:
        "Maximum 2 trades par session pendant 7 jours. Une fois la limite atteinte, session terminée.",
      focusTitle: "Moins de trades. Plus de qualité.",
      focus:
        "Le bon trader n’est pas celui qui agit le plus. C’est celui qui sait attendre le bon moment.",
    };
  }

  if (dominantError === "Entrée FOMO") {
    return {
      title: "Tu entres quand le mouvement est déjà chargé.",
      analysis:
        "PRIME détecte une difficulté à laisser partir un mouvement. Tu risques d’acheter l’urgence plutôt que la confirmation.",
      prescription:
        "Aucune entrée sans pullback ou confirmation complète de la checklist.",
      focusTitle: "Laisse partir ce qui part sans toi.",
      focus:
        "Une opportunité manquée coûte moins cher qu’une entrée émotionnelle.",
    };
  }

  if (dominantError === "Stop déplacé") {
    return {
      title: "Ton invalidation doit redevenir sacrée.",
      analysis:
        "PRIME détecte une négociation avec le risque après l’entrée. Le stop n’est pas une suggestion, c’est la frontière du plan.",
      prescription:
        "Stop défini avant entrée. Interdiction de l’élargir. Autorisé seulement à réduire le risque.",
      focusTitle: "Ton stop protège ton identité.",
      focus:
        "Respecter ton stop, c’est respecter la trader que tu construis.",
    };
  }

  if (dominantError === "Trade hors plan") {
    return {
      title: "Le plan existe, mais il n’est pas encore souverain.",
      analysis:
        "PRIME détecte que ton principal risque vient du non-respect de ton propre cadre.",
      prescription:
        "Chaque trade doit correspondre à ton scénario principal ou secondaire. Sinon : aucun trade.",
      focusTitle: "Pas dans le plan, pas dans le marché.",
      focus:
        "Ton avantage ne vient pas de ton intuition seule. Il vient de la répétition d’un cadre clair.",
    };
  }

  if (averageScore >= 85) {
    return {
      title: "Ton exécution devient propre.",
      analysis:
        "PRIME détecte une bonne stabilité comportementale. Ton objectif est maintenant de répéter ce niveau sans augmenter le risque trop vite.",
      prescription:
        "Maintiens la même taille, le même process et la même checklist pendant 7 jours.",
      focusTitle: "Stabilise avant d’accélérer.",
      focus:
        "La consistance vient avant le scaling. Continue de protéger ton process.",
    };
  }

  if (averageScore >= 65) {
    return {
      title: "Base correcte, mais encore fragile.",
      analysis:
        `Ton état mental dominant est ${dominantMentalState || "encore inconnu"}. PRIME détecte une structure intéressante, mais la discipline doit encore être renforcée.`,
      prescription:
        "Avant chaque entrée : relire le scénario, l’invalidation et le risque. Aucun trade sans validation complète.",
      focusTitle: "Protège ton process.",
      focus:
        "Aujourd’hui, ta victoire est de suivre ton plan, pas d’optimiser ton PnL.",
    };
  }

  return {
    title: "Priorité au contrôle émotionnel.",
    analysis:
      "PRIME détecte un risque élevé de dérive comportementale. La priorité n’est pas la performance, mais la protection de ton capital mental.",
    prescription:
      "Réduis le nombre de trades, baisse l’exposition et termine la session dès la première dérive.",
    focusTitle: "Redeviens lucide avant d’agir.",
    focus:
      "Tu n’as pas besoin de forcer le marché. Tu as besoin de redevenir neutre.",
  };
}

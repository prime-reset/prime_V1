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

  const detectedPattern = detectPrimePattern(sessions);

  const coach = getCoachAnalysis({
    averageScore,
    dominantMentalState,
    dominantError,
    lastSession,
    sessionsCount: sessions.length,
    detectedPattern,
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
            linear-gradient(180deg, rgba(0,0,0,0.86), rgba(0,0,0,0.96)),
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
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
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
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
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

          <div className="card-label">ANALYSE PRIME</div>

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

          <div className="prescription">{coach.prescription}</div>

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

function detectPrimePattern(sessions) {
  const closedSessions = sessions
    .filter((s) => s.status === "closed")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (closedSessions.length < 5) {
    return {
      type: "diagnostic_phase",
      severity: "observation",
      title: "Phase diagnostic en cours",
      reason: `PRIME analyse tes ${closedSessions.length} premières sessions clôturées. Il faut 5 sessions clôturées pour activer les prescriptions comportementales.`,
    };
  }

  const lastThree = closedSessions.slice(0, 3);
  const lastFive = closedSessions.slice(0, 5);

  const lowDisciplineStreak =
    lastThree.length === 3 &&
    lastThree.every((s) => Number(s.discipline_score) < 65);

  if (lowDisciplineStreak) {
    return {
      type: "low_discipline_streak",
      severity: "high",
      title: "Dérive de discipline détectée",
      reason:
        "Tes 3 dernières sessions clôturées sont sous 65% de discipline. Ce n’est plus un accident isolé, c’est un pattern.",
    };
  }

  const revengeCount = lastFive.filter(
    (s) => s.dominant_error === "Revenge trade"
  ).length;

  if (revengeCount >= 2) {
    return {
      type: "revenge_trading",
      severity: "critical",
      title: "Pattern de revenge trading détecté",
      reason:
        "PRIME détecte au moins 2 occurrences de revenge trading sur tes 5 dernières sessions.",
    };
  }

  const overtradingCount = lastFive.filter(
    (s) => s.dominant_error === "Overtrading"
  ).length;

  if (overtradingCount >= 2) {
    return {
      type: "overtrading",
      severity: "medium",
      title: "Pattern d’overtrading détecté",
      reason:
        "PRIME détecte au moins 2 occurrences d’overtrading sur tes 5 dernières sessions.",
    };
  }

  return {
    type: "stable",
    severity: "normal",
    title: "Aucun pattern critique détecté",
    reason:
      "PRIME ne détecte pas encore de dérive comportementale répétée. Le Coach reste silencieux tant qu’aucun vrai pattern ne justifie une prescription forte.",
  };
}

function getCoachAnalysis({
  averageScore,
  dominantMentalState,
  dominantError,
  lastSession,
  sessionsCount,
  detectedPattern,
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

  if (detectedPattern?.type === "diagnostic_phase") {
    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason +
        " Cette phase n’est pas un vide : c’est la construction de ton empreinte comportementale.",
      prescription:
        "Continue de clôturer tes sessions avec honnêteté. PRIME active les prescriptions après 5 sessions complètes.",
      focusTitle: "Créer ta baseline",
      focus:
        "Pendant cette phase, ton objectif n’est pas d’être parfaite. Ton objectif est de fournir des données réelles.",
    };
  }

  if (detectedPattern?.type === "low_discipline_streak") {
    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason +
        " Le problème prioritaire n’est pas la stratégie, mais le respect du cadre.",
      prescription:
        "Pendant 7 jours : checklist obligatoire avant chaque trade. Aucun trade si ton scénario, ton invalidation et ton risque ne sont pas définis.",
      focusTitle: "Pas de cadre, pas de trade.",
      focus:
        "Tu ne dois pas chercher plus d’opportunités. Tu dois protéger ton processus.",
    };
  }

  if (detectedPattern?.type === "revenge_trading") {
    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason +
        " Tu ne trades plus seulement le marché, tu trades une émotion à réparer.",
      prescription:
        "Pendant 7 jours : après une perte, pause obligatoire de 20 minutes. Aucun nouveau trade sans setup A clair.",
      focusTitle: "Ne récupère pas. Reviens neutre.",
      focus:
        "Une perte acceptée coûte moins cher qu’une perte que tu essaies de réparer.",
    };
  }

  if (detectedPattern?.type === "overtrading") {
    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason +
        " Ton danger principal est de confondre présence au marché et qualité d’exécution.",
      prescription:
        "Pendant 7 jours : maximum 2 trades par session. Une fois la limite atteinte, session terminée.",
      focusTitle: "Moins de trades. Plus de qualité.",
      focus:
        "Ton edge ne vient pas du nombre d’actions, mais de la sélection.",
    };
  }

  if (detectedPattern?.type === "stable") {
    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason,
      prescription:
        "Aucune prescription active. Continue ton process et protège ta régularité.",
      focusTitle: "Maintenir le cadre.",
      focus:
        "Aujourd’hui, PRIME ne cherche pas à corriger. Il observe et confirme ta stabilité.",
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
      analysis: `Ton état mental dominant est ${
        dominantMentalState || "encore inconnu"
      }. PRIME détecte une structure intéressante, mais la discipline doit encore être renforcée.`,
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

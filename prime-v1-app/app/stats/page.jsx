"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";

export default function StatsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
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

  const scores = sessions
    .map((session) => session.discipline_score)
    .filter((score) => typeof score === "number");

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lastSession = sessions[0];

  const totalXP = sessions.reduce(
    (total, session) => total + (session.xp_gain || 0),
    0
  );

  const totalStreak = sessions.reduce(
    (total, session) => total + (session.streak_gain || 0),
    0
  );

  const level = getPrimeLevel(totalXP);
  const nextLevel = getNextPrimeLevel(totalXP);
  const progress = getLevelProgress(totalXP);

  const dominantMentalState = getDominantValue(
    sessions.map((session) => session.mental_state).filter(Boolean)
  );

  const dominantError = getDominantValue(
    sessions.map((session) => session.dominant_error).filter(Boolean)
  );

  const disciplineLevel = getDisciplineLevel(averageScore);
  const primeInsight = getPrimeInsight(averageScore, dominantError);
  const prescription = getPrescription(dominantError);

  return (
    <main style={main}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <FadeIn delay={0}>
          <p style={label}>PRIME ANALYTICS</p>

          <h1 style={title}>
            Tableau
            <br />
            de bord
          </h1>

          <p style={subtitle}>
            PRIME transforme ta discipline en progression visible.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <PremiumCard>
            <p style={cardLabel}>NIVEAU PRIME</p>
            <h2 style={goldTitle}>{level.name}</h2>
            <p style={text}>{level.description}</p>

            <div style={progressOuter}>
              <div style={{ ...progressInner, width: `${progress}%` }} />
            </div>

            <p style={miniText}>
              {totalXP} XP · prochain niveau : {nextLevel}
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.25}>
          <PremiumCard>
            <p style={cardLabel}>SCORE MOYEN</p>
            <h2 style={score}>{loading ? "..." : `${averageScore}%`}</h2>
            <p style={text}>{disciplineLevel}</p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div style={grid}>
            <PremiumCard>
              <p style={cardLabel}>SESSIONS</p>
              <h2 style={smallScore}>{sessions.length}</h2>
            </PremiumCard>

            <PremiumCard>
              <p style={cardLabel}>MEILLEUR</p>
              <h2 style={smallScore}>{bestScore}%</h2>
            </PremiumCard>
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div style={grid}>
            <PremiumCard>
              <p style={cardLabel}>XP TOTAL</p>
              <h2 style={smallScore}>{totalXP}</h2>
            </PremiumCard>

            <PremiumCard>
              <p style={cardLabel}>STREAK</p>
              <h2 style={smallScore}>{totalStreak}</h2>
            </PremiumCard>
          </div>
        </FadeIn>

        <FadeIn delay={0.65}>
          <PremiumCard>
            <p style={cardLabel}>ÉTAT MENTAL DOMINANT</p>
            <h2 style={goldTitle}>{dominantMentalState || "Aucun"}</h2>
            <p style={text}>
              PRIME repère l’état mental qui revient le plus souvent dans tes
              sessions.
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.8}>
          <PremiumCard>
            <p style={cardLabel}>ERREUR DOMINANTE</p>
            <h2 style={goldTitle}>{dominantError || "Aucune"}</h2>
            <p style={text}>
              L’erreur qui revient le plus devient ton axe de correction
              prioritaire.
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.95}>
          <PremiumCard>
            <p style={cardLabel}>INSIGHT PRIME</p>
            <h2 style={goldTitle}>Diagnostic</h2>
            <p style={text}>{primeInsight}</p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={1.1}>
          <PremiumCard>
            <p style={cardLabel}>PRESCRIPTION</p>
            <h2 style={goldTitle}>Plan correctif</h2>
            <p style={text}>{prescription}</p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={1.25}>
          <PremiumCard>
            <p style={cardLabel}>DERNIÈRE SESSION</p>

            <h2 style={goldTitle}>
              {lastSession ? `${lastSession.discipline_score}%` : "Aucune"}
            </h2>

            <p style={text}>
              {lastSession
                ? `Mental : ${lastSession.mental_state || "non renseigné"} · Erreur : ${
                    lastSession.dominant_error || "aucune"
                  }`
                : "Lance une session pour générer tes statistiques."}
            </p>
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Stats" />
    </main>
  );
}

function getPrimeLevel(xp) {
  if (xp >= 1500)
    return {
      name: "PRIME Operator",
      description: "Tu exécutes avec une discipline avancée et une vraie maîtrise comportementale.",
    };
  if (xp >= 900)
    return {
      name: "Institutional Mindset",
      description: "Ton process devient structuré, stable et professionnel.",
    };
  if (xp >= 500)
    return {
      name: "Elite Executor",
      description: "Tu commences à incarner une exécution solide et répétable.",
    };
  if (xp >= 250)
    return {
      name: "Consistent Trader",
      description: "Tu construis une régularité réelle session après session.",
    };
  if (xp >= 100)
    return {
      name: "Discipline Builder",
      description: "Tu renforces tes bases et tu apprends à respecter ton cadre.",
    };
  return {
    name: "Rookie Trader",
    description: "Tu poses les premières fondations de ta discipline PRIME.",
  };
}

function getNextPrimeLevel(xp) {
  if (xp < 100) return "Discipline Builder";
  if (xp < 250) return "Consistent Trader";
  if (xp < 500) return "Elite Executor";
  if (xp < 900) return "Institutional Mindset";
  if (xp < 1500) return "PRIME Operator";
  return "Niveau maximum";
}

function getLevelProgress(xp) {
  const levels = [0, 100, 250, 500, 900, 1500];

  for (let i = 0; i < levels.length - 1; i++) {
    if (xp >= levels[i] && xp < levels[i + 1]) {
      return Math.round(((xp - levels[i]) / (levels[i + 1] - levels[i])) * 100);
    }
  }

  return 100;
}

function getDominantValue(values) {
  if (!values || values.length === 0) return null;

  return values.sort(
    (a, b) =>
      values.filter((value) => value === b).length -
      values.filter((value) => value === a).length
  )[0];
}

function getDisciplineLevel(score) {
  if (score >= 85) return "Discipline solide. Continue de stabiliser ton process.";
  if (score >= 75) return "Bonne base. Ton enjeu est de rester constante.";
  if (score >= 65) return "Zone fragile. PRIME doit renforcer tes garde-fous.";
  if (score > 0) return "Risque élevé. Priorité au contrôle émotionnel.";
  return "Aucune donnée pour le moment.";
}

function getPrimeInsight(score, error) {
  if (!error && score >= 85) {
    return "Ton exécution est propre. Ton objectif est maintenant de maintenir cette stabilité sur plusieurs sessions.";
  }

  if (error === "Revenge trade") {
    return "Tu as tendance à vouloir récupérer après une perte. Ce comportement détruit ton edge plus vite que ton analyse ne peut le reconstruire.";
  }

  if (error === "Overtrading") {
    return "Ton problème principal semble être la sur-exécution. Tu confonds activité et efficacité.";
  }

  if (error === "Entrée FOMO") {
    return "Tu entres quand le mouvement est déjà émotionnellement chargé. PRIME doit t’aider à attendre la confirmation.";
  }

  if (error === "Stop déplacé") {
    return "Ton invalidation n’est pas encore respectée. Tu sais où le trade est faux, mais tu négocies encore avec le marché.";
  }

  if (error === "Trade hors plan") {
    return "Ton risque principal vient du non-respect de ton propre cadre. Le plan existe, mais il n’est pas encore souverain.";
  }

  if (score > 0) {
    return "PRIME commence à collecter tes données. Plus tu renseignes tes sessions, plus le diagnostic deviendra précis.";
  }

  return "Aucune donnée suffisante pour générer un diagnostic fiable.";
}

function getPrescription(error) {
  if (error === "Revenge trade") {
    return "Pendant 7 jours : après une perte, pause obligatoire de 20 minutes et interdiction de reprendre un trade sans nouveau setup A.";
  }

  if (error === "Overtrading") {
    return "Pendant 7 jours : maximum 2 trades par session. Une fois la limite atteinte, la session est terminée.";
  }

  if (error === "Entrée FOMO") {
    return "Pendant 7 jours : aucune entrée sans pullback ou confirmation claire. Si le mouvement est déjà parti, tu le laisses partir.";
  }

  if (error === "Stop déplacé") {
    return "Pendant 7 jours : stop défini avant entrée et interdit de le déplacer sauf pour réduire le risque.";
  }

  if (error === "Trade hors plan") {
    return "Pendant 7 jours : chaque trade doit correspondre à ton scénario principal ou secondaire. Sinon, aucun trade.";
  }

  return "Continue à remplir tes sessions. PRIME te donnera une prescription dès qu’un pattern comportemental clair apparaîtra.";
}

const main = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #0A0A0A 55%, #050505 100%)",
  color: "white",
  padding: "32px",
  paddingBottom: "140px",
  fontFamily: "Arial, sans-serif",
};

const label = {
  color: "#D4B06A",
  letterSpacing: "6px",
  fontSize: "12px",
  marginBottom: "24px",
};

const title = {
  fontSize: "52px",
  lineHeight: "0.96",
  fontWeight: "700",
  marginBottom: "24px",
  letterSpacing: "-2px",
};

const subtitle = {
  color: "rgba(255,255,255,0.64)",
  fontSize: "19px",
  lineHeight: "1.6",
  marginBottom: "34px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "16px",
};

const progressOuter = {
  width: "100%",
  height: "12px",
  background: "rgba(255,255,255,0.08)",
  borderRadius: "999px",
  overflow: "hidden",
  marginTop: "20px",
  marginBottom: "12px",
};

const progressInner = {
  height: "100%",
  background: "linear-gradient(90deg, #8B6A2E, #D4B06A, #FFF0B8)",
  borderRadius: "999px",
};

const miniText = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "13px",
  lineHeight: "22px",
};

const cardLabel = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "13px",
  letterSpacing: "2px",
  marginBottom: "14px",
};

const score = {
  color: "#D4B06A",
  fontSize: "84px",
  lineHeight: "90px",
  margin: "0 0 16px",
};

const smallScore = {
  color: "#D4B06A",
  fontSize: "42px",
  lineHeight: "48px",
  margin: 0,
};

const goldTitle = {
  color: "#D4B06A",
  fontSize: "34px",
  lineHeight: "40px",
  margin: "0 0 14px",
};

const text = {
  color: "rgba(255,255,255,0.62)",
  fontSize: "18px",
  lineHeight: "30px",
};

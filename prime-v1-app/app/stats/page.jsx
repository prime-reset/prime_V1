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

    if (!error && data) {
      setSessions(data);
    }

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

  const mentalStates = sessions
    .map((session) => session.mental_state)
    .filter(Boolean);

  const dominantMentalState =
    mentalStates.length > 0
      ? mentalStates.sort(
          (a, b) =>
            mentalStates.filter((v) => v === b).length -
            mentalStates.filter((v) => v === a).length
        )[0]
      : "Aucun";

  const disciplineLevel = getDisciplineLevel(averageScore);

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
            PRIME analyse tes vraies sessions sauvegardées dans Supabase.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
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
            <h2 style={goldTitle}>{dominantMentalState}</h2>
            <p style={text}>
              PRIME repère l’état mental qui revient le plus souvent dans tes
              sessions.
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.8}>
          <PremiumCard>
            <p style={cardLabel}>DERNIÈRE SESSION</p>

            <h2 style={goldTitle}>
              {lastSession
                ? `${lastSession.discipline_score}%`
                : "Aucune session"}
            </h2>

            <p style={text}>
              {lastSession
                ? `Mental : ${lastSession.mental_state || "non renseigné"}`
                : "Lance une session pour générer tes statistiques."}
            </p>
          </PremiumCard>
        </FadeIn>
      </div>

     <BottomNav active="Prime" />
    </main>
  );
}

function getDisciplineLevel(score) {
  if (score >= 85) return "Discipline solide. Continue de stabiliser ton process.";
  if (score >= 75) return "Bonne base. Ton enjeu est de rester constante.";
  if (score >= 65) return "Zone fragile. PRIME doit renforcer tes garde-fous.";
  if (score > 0) return "Risque élevé. Priorité au contrôle émotionnel.";
  return "Aucune donnée pour le moment.";
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

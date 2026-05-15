"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";

export default function StatsPage() {
  const [primeProfile, setPrimeProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("primeProfile");

    if (savedProfile) {
      setPrimeProfile(JSON.parse(savedProfile));
    }
  }, []);

  const disciplineScore = getDisciplineScore(primeProfile?.risk);
  const disciplineLevel = getDisciplineLevel(disciplineScore);

  return (
    <main style={main}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <FadeIn delay={0}>
          <p style={label}>STATS PRIME</p>

          <h1 style={title}>
            Ta discipline
            <br />
            en données.
          </h1>

          <p style={subtitle}>
            PRIME transforme ton profil, ton risque dominant et tes habitudes en indicateurs de progression.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PremiumCard>
            <p style={cardLabel}>SCORE DISCIPLINE ESTIMÉ</p>
            <h2 style={score}>{disciplineScore}</h2>
            <p style={text}>{disciplineLevel}</p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <PremiumCard>
            <p style={cardLabel}>PROFIL ACTIF</p>
            <h2 style={goldTitle}>
              {primeProfile?.detectedProfile || "Profil standard"}
            </h2>
            <p style={text}>
              Risque dominant :{" "}
              <strong>{primeProfile?.risk || "Anticipation / impulsivité"}</strong>
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PremiumCard>
            <p style={cardLabel}>PRESCRIPTION ACTIVE</p>
            <h2 style={cardTitle}>
              {primeProfile?.prescription ||
                "Respecter une checklist complète avant chaque entrée."}
            </h2>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.65}>
          <PremiumCard>
            <p style={cardLabel}>CHECKLIST SUIVIE</p>

            {(primeProfile?.checklist || [
              "Contexte marché validé",
              "Setup conforme au plan",
              "Risque défini avant l’entrée",
              "État émotionnel stable",
              "Invalidation claire",
            ]).map((item) => (
              <div key={item} style={listItem}>
                <span style={dot} />
                <p style={listText}>{item}</p>
              </div>
            ))}
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Setup" />
    </main>
  );
}

function getDisciplineScore(risk) {
  if (risk === "Revenge trade") return 62;
  if (risk === "Sur-exécution") return 68;
  if (risk === "Entrée impulsive") return 70;
  if (risk === "Anticipation avant confirmation") return 76;
  if (risk === "Excès de confiance") return 82;
  return 74;
}

function getDisciplineLevel(score) {
  if (score >= 85) return "Discipline solide. Continue de stabiliser ton process.";
  if (score >= 75) return "Bonne base. Ton enjeu est de rester constante.";
  if (score >= 65) return "Zone fragile. PRIME doit renforcer tes garde-fous.";
  return "Risque élevé. Priorité au contrôle émotionnel.";
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

const goldTitle = {
  color: "#D4B06A",
  fontSize: "34px",
  lineHeight: "40px",
  margin: "0 0 14px",
};

const cardTitle = {
  color: "white",
  fontSize: "24px",
  lineHeight: "36px",
  margin: 0,
};

const text = {
  color: "rgba(255,255,255,0.62)",
  fontSize: "18px",
  lineHeight: "30px",
};

const listItem = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "16px",
};

const dot = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  background: "#D4B06A",
  boxShadow: "0 0 18px rgba(212,176,106,0.25)",
};

const listText = {
  margin: 0,
  color: "rgba(255,255,255,0.82)",
  fontSize: "18px",
  lineHeight: "28px",
};

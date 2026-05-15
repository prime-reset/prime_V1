"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";

export default function CoachPage() {
  const [primeProfile, setPrimeProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("primeProfile");

    if (savedProfile) {
      setPrimeProfile(JSON.parse(savedProfile));
    }
  }, []);

  const risk = primeProfile?.risk || "Impulsivité après perte";

  const prescription =
    primeProfile?.prescription ||
    "Maximum 1 trade après une perte pendant 7 jours.";

  const errors = getErrorsByRisk(risk);

  return (
    <main style={main}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <FadeIn delay={0}>
          <p style={label}>COACH PRIME</p>

          <h1 style={title}>
            Ton cerveau
            <br />
            d’exécution.
          </h1>

          <p style={subtitle}>
            PRIME transforme ton profil, tes risques et tes erreurs en coaching
            comportemental personnalisé.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PremiumCard>
            <p style={cardLabel}>PROFIL ACTIF</p>

            <h2 style={goldTitle}>
              {primeProfile?.detectedProfile || "Profil standard"}
            </h2>

            <p style={text}>
              PRIME ajuste ses prescriptions selon ton comportement dominant.
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <PremiumCard>
            <p style={cardLabel}>RISQUE DOMINANT</p>

            <h2 style={cardTitle}>{risk}</h2>

            <p style={text}>
              C’est la zone que PRIME va surveiller en priorité pendant tes
              prochaines sessions.
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PremiumCard>
            <p style={cardLabel}>PRESCRIPTION ACTIVE</p>

            <h2 style={cardTitle}>{prescription}</h2>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.65}>
          <PremiumCard>
            <p style={cardLabel}>ERREURS À SURVEILLER</p>

            {errors.map((item) => (
              <div key={item} style={listItem}>
                <span style={dot} />
                <p style={listText}>{item}</p>
              </div>
            ))}
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Coach" />
    </main>
  );
}

function getErrorsByRisk(risk) {
  if (risk === "Revenge trade") {
    return [
      "Reprendre un trade pour se refaire",
      "Augmenter le risque après une perte",
      "Entrer sans nouvelle confirmation",
      "Ignorer la pause obligatoire",
    ];
  }

  if (risk === "Sur-exécution") {
    return [
      "Multiplier les entrées sans edge clair",
      "Trader par ennui",
      "Revenir trop vite après un trade",
      "Confondre activité et discipline",
    ];
  }

  if (risk === "Entrée impulsive") {
    return [
      "Entrer sur bougie d’impulsion",
      "Acheter/vendre un mouvement déjà parti",
      "Ignorer le pullback",
      "Confondre urgence et opportunité",
    ];
  }

  if (risk === "Anticipation avant confirmation") {
    return [
      "Entrer avant BOS / confirmation",
      "Anticiper la réaction sur zone",
      "Forcer un setup incomplet",
      "Prendre position sans invalidation nette",
    ];
  }

  if (risk === "Excès de confiance") {
    return [
      "Augmenter le risque après une série de gains",
      "Relâcher la checklist",
      "Multiplier les trades hors plan",
      "Confondre confiance et maîtrise",
    ];
  }

  return [
    "Entrée sans confirmation",
    "Risque mal défini",
    "Trade hors plan",
    "Décision prise sous émotion",
  ];
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

const goldTitle = {
  color: "#D4B06A",
  fontSize: "34px",
  lineHeight: "40px",
  margin: "0 0 14px",
};

const cardTitle = {
  color: "white",
  fontSize: "26px",
  lineHeight: "36px",
  margin: "0 0 14px",
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

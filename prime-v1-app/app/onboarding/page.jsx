"use client";

import { useState } from "react";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";

export default function OnboardingPage() {
  const [profile, setProfile] = useState({
    tradingStyle: "",
    experience: "",
    psychology: "",
    weakness: "",
    goal: "",
  });

  const [result, setResult] = useState(null);

  const updateField = (field, value) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  const generatePrimeProfile = () => {
    let detectedProfile = "Trader en construction";
    let risk = "Manque de structure";
    let prescription = "Respecter une checklist complète avant chaque entrée.";
    let checklist = [
      "Contexte marché validé",
      "Setup conforme au plan",
      "Risque défini avant l’entrée",
      "État émotionnel stable",
      "Invalidation claire",
    ];

    if (
      profile.tradingStyle === "SMC / Liquidité" &&
      profile.psychology === "Patient"
    ) {
      detectedProfile = "Structure & Liquidité";
      risk = "Anticipation avant confirmation";
      prescription =
        "Attendre une confirmation complète avant toute exécution.";
      checklist = [
        "Biais HTF validé",
        "Liquidité identifiée",
        "Sweep ou réaction confirmé",
        "BOS / CHOCH propre",
        "Risque défini avant l’entrée",
      ];
    }

    if (
      profile.tradingStyle === "Scalping" ||
      profile.weakness === "Overtrading"
    ) {
      detectedProfile = "Scalper sous pression";
      risk = "Sur-exécution";
      prescription =
        "Limiter la session à 2 trades maximum et imposer 5 minutes de pause après chaque perte.";
      checklist = [
        "Setup rapide mais validé",
        "Pas d’entrée par ennui",
        "Risque fixe respecté",
        "Maximum 2 trades aujourd’hui",
        "Pause obligatoire après perte",
      ];
    }

    if (profile.weakness === "Revenge trade") {
      detectedProfile = "Trader émotionnel après perte";
      risk = "Revenge trade";
      prescription = "Maximum 1 trade après une perte pendant 7 jours.";
      checklist = [
        "Ai-je perdu le trade précédent ?",
        "Ai-je attendu 5 minutes ?",
        "Le setup est-il réellement valide ?",
        "Mon risque est-il réduit ?",
        "Suis-je en train de me refaire ?",
      ];
    }

    if (profile.weakness === "FOMO") {
      detectedProfile = "Trader réactif au mouvement";
      risk = "Entrée impulsive";
      prescription =
        "Interdiction d’entrer sur bougie d’impulsion sans pullback ou confirmation.";
      checklist = [
        "Le mouvement est-il déjà parti ?",
        "Ai-je une zone claire ?",
        "Ai-je attendu un pullback ?",
        "Le R:R est-il encore valable ?",
        "Est-ce mon plan ou mon émotion ?",
      ];
    }

    if (profile.psychology === "Discipliné" && profile.experience === "Avancé") {
      detectedProfile = "Exécutant discipliné";
      risk = "Excès de confiance";
      prescription = "Maintenir le même risque même après une série de gains.";
      checklist = [
        "Plan respecté",
        "Setup A ou A+ uniquement",
        "Risque stable",
        "Pas d’augmentation après gain",
        "Journal rempli après session",
      ];
    }

    const generatedProfile = {
      detectedProfile,
      risk,
      prescription,
      checklist,
      answers: profile,
    };

    setResult(generatedProfile);

    localStorage.setItem("primeProfile", JSON.stringify(generatedProfile));
  };

  const isComplete =
    profile.tradingStyle &&
    profile.experience &&
    profile.psychology &&
    profile.weakness &&
    profile.goal;

  return (
    <main style={main}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <FadeIn delay={0}>
          <p style={label}>ONBOARDING PRIME</p>

          <h1 style={title}>
            Créons ton
            <br />
            profil trader.
          </h1>

          <p style={subtitle}>
            PRIME analyse ton style, ta psychologie et tes erreurs dominantes
            pour générer un coaching personnalisé.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <PremiumCard>
            <Question
              title="Quel est ton style principal ?"
              value={profile.tradingStyle}
              onChange={(value) => updateField("tradingStyle", value)}
              options={[
                "SMC / Liquidité",
                "Scalping",
                "Breakout",
                "Price Action",
                "Trend Following",
              ]}
            />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.25}>
          <PremiumCard>
            <Question
              title="Ton niveau d’expérience ?"
              value={profile.experience}
              onChange={(value) => updateField("experience", value)}
              options={[
                "Débutant",
                "Intermédiaire",
                "Avancé",
                "Prop Firm Trader",
              ]}
            />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <PremiumCard>
            <Question
              title="Ton plus gros problème émotionnel ?"
              value={profile.weakness}
              onChange={(value) => updateField("weakness", value)}
              options={[
                "Revenge trade",
                "Overtrading",
                "FOMO",
                "Stop déplacé",
                "Entrées impulsives",
              ]}
            />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.45}>
          <PremiumCard>
            <Question
              title="Comment te décrirais-tu ?"
              value={profile.psychology}
              onChange={(value) => updateField("psychology", value)}
              options={["Patient", "Impulsif", "Discipliné", "Stressé", "Agressif"]}
            />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.55}>
          <PremiumCard>
            <Question
              title="Ton objectif principal ?"
              value={profile.goal}
              onChange={(value) => updateField("goal", value)}
              options={[
                "Discipline",
                "Consistance",
                "Passer un challenge",
                "Obtenir un payout",
                "Scaler",
              ]}
            />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.65}>
          <button
            onClick={generatePrimeProfile}
            disabled={!isComplete}
            style={{
              width: "100%",
              opacity: isComplete ? 1 : 0.35,
              cursor: isComplete ? "pointer" : "not-allowed",
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          >
            <PrimaryButton>Générer mon profil PRIME</PrimaryButton>
          </button>
        </FadeIn>

        {result && (
          <FadeIn delay={0.1}>
            <PremiumCard>
              <p style={resultLabel}>PROFIL PRIME DÉTECTÉ</p>
              <h2 style={resultTitle}>{result.detectedProfile}</h2>
              <p style={resultText}>
                Risque dominant : <strong>{result.risk}</strong>
              </p>
            </PremiumCard>

            <PremiumCard>
              <p style={resultLabel}>PRESCRIPTION ACTIVE</p>
              <p style={prescriptionText}>{result.prescription}</p>
            </PremiumCard>

            <PremiumCard>
              <p style={resultLabel}>CHECKLIST PERSONNALISÉE</p>

              {result.checklist.map((item) => (
                <div key={item} style={checkItem}>
                  <span style={checkDot} />
                  <p style={checkText}>{item}</p>
                </div>
              ))}
            </PremiumCard>
          </FadeIn>
        )}
      </div>

      <BottomNav active="Profil" />
    </main>
  );
}

function Question({ title, value, onChange, options }) {
  return (
    <>
      <p style={question}>{title}</p>

      <select value={value} onChange={(e) => onChange(e.target.value)} style={select}>
        <option value="">Choisir</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
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

const question = {
  fontSize: "22px",
  lineHeight: "30px",
  margin: 0,
};

const select = {
  width: "100%",
  background: "rgba(15,15,15,0.8)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "18px",
  padding: "18px",
  fontSize: "16px",
  marginTop: "18px",
  outline: "none",
};

const resultLabel = {
  color: "#D4B06A",
  letterSpacing: "2px",
  fontSize: "12px",
  marginBottom: "14px",
};

const resultTitle = {
  color: "#D4B06A",
  fontSize: "34px",
  lineHeight: "40px",
  margin: "0 0 16px",
};

const resultText = {
  color: "rgba(255,255,255,0.65)",
  fontSize: "18px",
  lineHeight: "30px",
};

const prescriptionText = {
  color: "white",
  fontSize: "24px",
  lineHeight: "36px",
  fontWeight: "700",
};

const checkItem = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "16px",
};

const checkDot = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  background: "#D4B06A",
  boxShadow: "0 0 18px rgba(212,176,106,0.25)",
};

const checkText = {
  margin: 0,
  color: "rgba(255,255,255,0.82)",
  fontSize: "18px",
  lineHeight: "28px",
};

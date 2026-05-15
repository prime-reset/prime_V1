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
  });

  const updateField = (field, value) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #050505 0%, #0A0A0A 55%, #050505 100%)",
        color: "white",
        padding: "32px",
        paddingBottom: "140px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <FadeIn delay={0}>
          <p style={label}>ONBOARDING PRIME</p>

          <h1 style={title}>
            Créons ton
            <br />
            profil trader.
          </h1>

          <p style={subtitle}>
            PRIME adapte son coaching, ses prescriptions et ses checklists selon
            ton comportement réel.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PremiumCard>
            <p style={question}>Quel est ton style principal ?</p>

            <SelectField
              value={profile.tradingStyle}
              onChange={(value) =>
                updateField("tradingStyle", value)
              }
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

        <FadeIn delay={0.35}>
          <PremiumCard>
            <p style={question}>Ton niveau d’expérience ?</p>

            <SelectField
              value={profile.experience}
              onChange={(value) =>
                updateField("experience", value)
              }
              options={[
                "Débutant",
                "Intermédiaire",
                "Avancé",
                "Prop Firm Trader",
              ]}
            />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PremiumCard>
            <p style={question}>Ton plus gros problème émotionnel ?</p>

            <SelectField
              value={profile.weakness}
              onChange={(value) =>
                updateField("weakness", value)
              }
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

        <FadeIn delay={0.65}>
          <PremiumCard>
            <p style={question}>Comment te décrirais-tu ?</p>

            <SelectField
              value={profile.psychology}
              onChange={(value) =>
                updateField("psychology", value)
              }
              options={[
                "Patient",
                "Impulsif",
                "Discipliné",
                "Stressé",
                "Agressif",
              ]}
            />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.8}>
          <PrimaryButton>
            Générer mon profil PRIME
          </PrimaryButton>
        </FadeIn>

        <FadeIn delay={1}>
          <PremiumCard>
            <p style={resultLabel}>PROFIL EN COURS</p>

            <p style={resultText}>
              {profile.tradingStyle || "..."} •{" "}
              {profile.psychology || "..."}
            </p>

            <p style={resultSub}>
              Faiblesse dominante :{" "}
              {profile.weakness || "..."}
            </p>
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Profil" />
    </main>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: "rgba(15,15,15,0.8)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "18px",
        fontSize: "16px",
        marginTop: "18px",
        outline: "none",
      }}
    >
      <option value="">Choisir</option>

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

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
  margin: 0,
};

const resultLabel = {
  color: "#D4B06A",
  letterSpacing: "2px",
  fontSize: "12px",
  marginBottom: "14px",
};

const resultText = {
  fontSize: "24px",
  marginBottom: "10px",
};

const resultSub = {
  color: "rgba(255,255,255,0.55)",
  fontSize: "16px",
};

"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";

export default function SessionPage() {
  const [primeProfile, setPrimeProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("primeProfile");

    if (savedProfile) {
      setPrimeProfile(JSON.parse(savedProfile));
    }
  }, []);

  const checklist = primeProfile?.checklist || [
    "Contexte HTF validé",
    "Liquidité identifiée",
    "Setup conforme au plan",
    "Risque défini avant l’entrée",
    "Invalider clairement le trade",
  ];

  return (
    <main style={main}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <FadeIn delay={0}>
          <p style={label}>SESSION PRIME</p>

          <h1 style={title}>
            Prépare
            <br />
            ton exécution.
          </h1>

          <p style={subtitle}>
            PRIME vérifie ton état, ton plan, ton risque et ton niveau de
            discipline avant chaque trade.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PremiumCard>
            <p style={cardLabel}>PROFIL ACTIF</p>

            <h2 style={goldTitle}>
              {primeProfile?.detectedProfile || "Profil standard"}
            </h2>

            <p style={text}>
              Risque surveillé :{" "}
              <strong>{primeProfile?.risk || "Anticipation / impulsivité"}</strong>
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <PremiumCard>
            <p style={cardLabel}>CHECKLIST PERSONNALISÉE</p>

            {checklist.map((item) => (
              <div key={item} style={checkItem}>
                <span style={checkBox} />
                <p style={checkText}>{item}</p>
              </div>
            ))}
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PremiumCard>
            <p style={cardLabel}>PRESCRIPTION ACTIVE</p>

            <h2 style={cardTitle}>
              {primeProfile?.prescription ||
                "Attendre une confirmation complète avant toute exécution."}
            </h2>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.65}>
          <PrimaryButton>Valider ma préparation</PrimaryButton>
        </FadeIn>
      </div>

      <BottomNav active="Session" />
    </main>
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
  fontSize: "24px",
  lineHeight: "36px",
  margin: 0,
};

const text = {
  color: "rgba(255,255,255,0.62)",
  fontSize: "18px",
  lineHeight: "30px",
};

const checkItem = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "18px",
};

const checkBox = {
  width: "22px",
  height: "22px",
  borderRadius: "7px",
  border: "1px solid rgba(212,176,106,0.75)",
  boxShadow: "0 0 18px rgba(212,176,106,0.10)",
};

const checkText = {
  margin: 0,
  color: "rgba(255,255,255,0.82)",
  fontSize: "17px",
  lineHeight: "26px",
};

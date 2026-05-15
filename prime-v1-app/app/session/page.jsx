"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";

export default function SessionPage() {
  const [primeProfile, setPrimeProfile] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);

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

  const toggleItem = (item) => {
    if (checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter((i) => i !== item));
    } else {
      setCheckedItems([...checkedItems, item]);
    }
  };

  const score = Math.round((checkedItems.length / checklist.length) * 100);

  const status =
    score >= 80
      ? "Session validée"
      : score >= 50
      ? "Session fragile"
      : "Risque élevé";

  const saveSession = () => {
    const sessionResult = {
      date: new Date().toLocaleDateString("fr-FR"),
      score,
      status,
      checklist,
      checkedItems,
      profile: primeProfile?.detectedProfile || "Profil standard",
      risk: primeProfile?.risk || "Anticipation / impulsivité",
      prescription:
        primeProfile?.prescription ||
        "Attendre une confirmation complète avant toute exécution.",
    };

    const existingSessions =
      JSON.parse(localStorage.getItem("primeSessions")) || [];

    localStorage.setItem(
      "primeSessions",
      JSON.stringify([sessionResult, ...existingSessions])
    );

    alert("Session PRIME sauvegardée.");
  };

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
            Coche les éléments validés avant d’exécuter. PRIME calcule ton score
            de discipline en temps réel.
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
            <p style={cardLabel}>SCORE DISCIPLINE</p>

            <h2 style={scoreStyle}>{score}</h2>

            <p style={text}>{status}</p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PremiumCard>
            <p style={cardLabel}>CHECKLIST PERSONNALISÉE</p>

            {checklist.map((item) => {
              const isChecked = checkedItems.includes(item);

              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  style={checkButton}
                >
                  <span
                    style={{
                      ...checkBox,
                      background: isChecked ? "#D4B06A" : "transparent",
                    }}
                  />

                  <p style={checkText}>{item}</p>
                </button>
              );
            })}
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.65}>
          <PremiumCard>
            <p style={cardLabel}>PRESCRIPTION ACTIVE</p>

            <h2 style={cardTitle}>
              {primeProfile?.prescription ||
                "Attendre une confirmation complète avant toute exécution."}
            </h2>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.8}>
          <button
            onClick={saveSession}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              width: "100%",
            }}
          >
            <PrimaryButton>Sauvegarder ma session</PrimaryButton>
          </button>
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

const scoreStyle = {
  color: "#D4B06A",
  fontSize: "84px",
  lineHeight: "90px",
  margin: "0 0 12px",
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

const checkButton = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "16px",
  background: "transparent",
  border: "none",
  padding: 0,
  textAlign: "left",
  cursor: "pointer",
};

const checkBox = {
  width: "22px",
  height: "22px",
  borderRadius: "7px",
  border: "1px solid rgba(212,176,106,0.75)",
  boxShadow: "0 0 18px rgba(212,176,106,0.10)",
  flexShrink: 0,
};

const checkText = {
  margin: 0,
  color: "rgba(255,255,255,0.82)",
  fontSize: "17px",
  lineHeight: "26px",
};

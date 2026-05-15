"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";

export default function SessionPage() {
  const [primeProfile, setPrimeProfile] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);

  const [review, setReview] = useState({
    respectedPlan: "",
    movedStop: "",
    revengeTrade: "",
    emotionalLevel: "",
    impulsiveEntry: "",
  });

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
    "Invalidation claire",
  ];

  const toggleItem = (item) => {
    if (checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter((i) => i !== item));
    } else {
      setCheckedItems([...checkedItems, item]);
    }
  };

  const updateReview = (field, value) => {
    setReview({
      ...review,
      [field]: value,
    });
  };

  const checklistScore = Math.round(
    (checkedItems.length / checklist.length) * 100
  );

  const reviewPenalty = calculateReviewPenalty(review);

  const finalScore = Math.max(0, checklistScore - reviewPenalty);

  const status =
    finalScore >= 80
      ? "Session disciplinée"
      : finalScore >= 50
      ? "Session fragile"
      : "Dérive comportementale";

  const detectedError = detectBehavioralError(review);

  const prescription = generatePrescription(detectedError, primeProfile);

  const isReviewComplete =
    review.respectedPlan &&
    review.movedStop &&
    review.revengeTrade &&
    review.emotionalLevel &&
    review.impulsiveEntry;

  const saveSession = () => {
    const sessionResult = {
      date: new Date().toLocaleDateString("fr-FR"),
      score: finalScore,
      checklistScore,
      reviewPenalty,
      status,
      checklist,
      checkedItems,
      review,
      detectedError,
      prescription,
      profile: primeProfile?.detectedProfile || "Profil standard",
      risk: primeProfile?.risk || "Anticipation / impulsivité",
    };

    const existingSessions =
      JSON.parse(localStorage.getItem("primeSessions")) || [];

    localStorage.setItem(
      "primeSessions",
      JSON.stringify([sessionResult, ...existingSessions])
    );

    alert("Session PRIME sauvegardée avec analyse comportementale.");
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
            Coche ta checklist puis renseigne ton comportement post-session.
            PRIME calcule ton score réel de discipline.
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
              <strong>
                {primeProfile?.risk || "Anticipation / impulsivité"}
              </strong>
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <PremiumCard>
            <p style={cardLabel}>SCORE DISCIPLINE FINAL</p>

            <h2 style={scoreStyle}>{finalScore}</h2>

            <p style={text}>{status}</p>

            <p style={smallText}>
              Checklist : {checklistScore}/100 · Pénalité comportementale : -
              {reviewPenalty}
            </p>
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
            <p style={cardLabel}>REVIEW COMPORTEMENTALE</p>

            <ReviewSelect
              label="As-tu respecté ton plan ?"
              value={review.respectedPlan}
              onChange={(value) => updateReview("respectedPlan", value)}
              options={["Oui", "Partiellement", "Non"]}
            />

            <ReviewSelect
              label="As-tu déplacé ton stop ?"
              value={review.movedStop}
              onChange={(value) => updateReview("movedStop", value)}
              options={["Non", "Oui"]}
            />

            <ReviewSelect
              label="As-tu fait un revenge trade ?"
              value={review.revengeTrade}
              onChange={(value) => updateReview("revengeTrade", value)}
              options={["Non", "Oui"]}
            />

            <ReviewSelect
              label="Ton niveau émotionnel ?"
              value={review.emotionalLevel}
              onChange={(value) => updateReview("emotionalLevel", value)}
              options={["Calme", "Tendu", "Élevé"]}
            />

            <ReviewSelect
              label="As-tu pris une entrée impulsive ?"
              value={review.impulsiveEntry}
              onChange={(value) => updateReview("impulsiveEntry", value)}
              options={["Non", "Oui"]}
            />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.8}>
          <PremiumCard>
            <p style={cardLabel}>ANALYSE PRIME</p>

            <h2 style={cardTitle}>{detectedError}</h2>

            <p style={text}>{prescription}</p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.95}>
          <button
            onClick={saveSession}
            disabled={!isReviewComplete}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              width: "100%",
              opacity: isReviewComplete ? 1 : 0.35,
              cursor: isReviewComplete ? "pointer" : "not-allowed",
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

function ReviewSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <p style={reviewLabel}>{label}</p>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={select}
      >
        <option value="">Choisir</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function calculateReviewPenalty(review) {
  let penalty = 0;

  if (review.respectedPlan === "Partiellement") penalty += 10;
  if (review.respectedPlan === "Non") penalty += 25;
  if (review.movedStop === "Oui") penalty += 15;
  if (review.revengeTrade === "Oui") penalty += 25;
  if (review.emotionalLevel === "Tendu") penalty += 8;
  if (review.emotionalLevel === "Élevé") penalty += 18;
  if (review.impulsiveEntry === "Oui") penalty += 15;

  return penalty;
}

function detectBehavioralError(review) {
  if (review.revengeTrade === "Oui") return "Revenge trade détecté";
  if (review.movedStop === "Oui") return "Stop déplacé";
  if (review.impulsiveEntry === "Oui") return "Entrée impulsive";
  if (review.respectedPlan === "Non") return "Non-respect du plan";
  if (review.emotionalLevel === "Élevé") return "Émotion dominante élevée";

  return "Comportement stable";
}

function generatePrescription(error, primeProfile) {
  if (error === "Revenge trade détecté") {
    return "Prescription : maximum 1 trade après une perte pendant 7 jours.";
  }

  if (error === "Stop déplacé") {
    return "Prescription : interdiction de modifier le stop une fois le trade lancé.";
  }

  if (error === "Entrée impulsive") {
    return "Prescription : attendre une confirmation complète avant toute exécution.";
  }

  if (error === "Non-respect du plan") {
    return "Prescription : réduire le nombre de trades et valider la checklist avant chaque entrée.";
  }

  if (error === "Émotion dominante élevée") {
    return "Prescription : activer le Mode Reset avant toute nouvelle décision.";
  }

  return (
    primeProfile?.prescription ||
    "Prescription : conserver le même niveau d’exigence sur la prochaine session."
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
  fontSize: "26px",
  lineHeight: "36px",
  margin: "0 0 14px",
};

const text = {
  color: "rgba(255,255,255,0.62)",
  fontSize: "18px",
  lineHeight: "30px",
};

const smallText = {
  color: "rgba(255,255,255,0.42)",
  fontSize: "15px",
  lineHeight: "24px",
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

const reviewLabel = {
  color: "rgba(255,255,255,0.74)",
  fontSize: "17px",
  lineHeight: "26px",
  marginBottom: "10px",
};

const select = {
  width: "100%",
  background: "rgba(15,15,15,0.8)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "18px",
  padding: "16px",
  fontSize: "16px",
  outline: "none",
};

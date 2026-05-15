"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";

export default function CoachPage() {
  const [primeProfile, setPrimeProfile] = useState(null);
  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("primeProfile");
    const savedSessions =
      JSON.parse(localStorage.getItem("primeSessions")) || [];

    if (savedProfile) {
      setPrimeProfile(JSON.parse(savedProfile));
    }

    if (savedSessions.length > 0) {
      setLastSession(savedSessions[0]);
    }
  }, []);

  const analysis = getCoachAnalysis(lastSession, primeProfile);

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
            PRIME lit ton profil et ta dernière session pour ajuster ton
            coaching comportemental.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PremiumCard>
            <p style={cardLabel}>ANALYSE COACH</p>

            <h2 style={goldTitle}>{analysis.title}</h2>

            <p style={text}>{analysis.message}</p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <PremiumCard>
            <p style={cardLabel}>DERNIÈRE SESSION</p>

            <h2 style={cardTitle}>
              {lastSession ? `${lastSession.score}/100` : "Aucune session"}
            </h2>

            <p style={text}>
              {lastSession
                ? lastSession.status
                : "Sauvegarde une session pour activer le coaching intelligent."}
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PremiumCard>
            <p style={cardLabel}>ERREUR DÉTECTÉE</p>

            <h2 style={cardTitle}>
              {lastSession?.detectedError || primeProfile?.risk || "Profil en attente"}
            </h2>

            <p style={text}>
              {analysis.errorExplanation}
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.65}>
          <PremiumCard>
            <p style={cardLabel}>PRESCRIPTION ACTIVE</p>

            <h2 style={cardTitle}>
              {lastSession?.prescription ||
                primeProfile?.prescription ||
                "Créer ton profil PRIME pour générer une prescription personnalisée."}
            </h2>
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Coach" />
    </main>
  );
}

function getCoachAnalysis(lastSession, primeProfile) {
  if (!primeProfile && !lastSession) {
    return {
      title: "Coach en attente",
      message:
        "Commence par créer ton profil PRIME puis sauvegarde une session pour activer l’analyse comportementale.",
      errorExplanation:
        "Aucune donnée comportementale n’est encore disponible.",
    };
  }

  if (!lastSession) {
    return {
      title: "Profil prêt",
      message:
        "Ton profil PRIME est généré. La prochaine étape est de sauvegarder une session pour que le coach analyse ton comportement réel.",
      errorExplanation:
        `Risque dominant identifié : ${primeProfile?.risk || "à préciser"}.`,
    };
  }

  if (lastSession.detectedError === "Revenge trade détecté") {
    return {
      title: "Tu essayes de récupérer une émotion.",
      message:
        "Le problème n’est pas le marché. Le problème est que tu as cherché à reprendre le contrôle par l’action. PRIME te remet dans le process.",
      errorExplanation:
        "Le revenge trade apparaît quand la perte devient personnelle. La priorité est de couper la boucle émotionnelle.",
    };
  }

  if (lastSession.detectedError === "Stop déplacé") {
    return {
      title: "Ton invalidation doit rester sacrée.",
      message:
        "Déplacer ton stop détruit la logique du trade. Le stop n’est pas une suggestion, c’est la frontière entre plan et émotion.",
      errorExplanation:
        "Stop déplacé = tu as modifié le risque après l’entrée. PRIME doit renforcer ton respect de l’invalidation.",
    };
  }

  if (lastSession.detectedError === "Entrée impulsive") {
    return {
      title: "Tu as confondu urgence et opportunité.",
      message:
        "Une impulsion du marché ne justifie pas une impulsion de ta part. Ton edge vient de l’attente, pas de la réaction.",
      errorExplanation:
        "L’entrée impulsive montre une difficulté à attendre la confirmation complète.",
    };
  }

  if (lastSession.detectedError === "Non-respect du plan") {
    return {
      title: "Tu ne peux pas scorer un plan que tu ne suis pas.",
      message:
        "Le but n’est pas d’avoir raison sur un trade. Le but est d’exécuter un système répétable. PRIME te ramène à la structure.",
      errorExplanation:
        "Le non-respect du plan empêche toute analyse fiable de ton edge.",
    };
  }

  if (lastSession.detectedError === "Émotion dominante élevée") {
    return {
      title: "Ton état émotionnel a pris trop de place.",
      message:
        "Quand l’émotion monte, l’exécution baisse. Ta priorité n’est pas de trader plus, mais de redevenir neutre.",
      errorExplanation:
        "Un niveau émotionnel élevé augmente le risque d’erreurs de lecture, d’entrée et de gestion.",
    };
  }

  if (lastSession.score >= 85) {
    return {
      title: "Ton edge commence à devenir répétable.",
      message:
        "Tu as protégé ton process. Ce type de session construit la consistance, même si le PnL varie.",
      errorExplanation:
        "Aucune dérive majeure détectée. Continue de protéger ce niveau d’exécution.",
    };
  }

  if (lastSession.score >= 65) {
    return {
      title: "Base correcte, mais attention à la dérive.",
      message:
        "Tu as validé une partie du process, mais PRIME détecte encore une fragilité comportementale à surveiller.",
      errorExplanation:
        lastSession.detectedError || "Risque comportemental modéré.",
    };
  }

  return {
    title: "Session à risque.",
    message:
      "Ton score montre que la session n’était pas assez protégée par ton process. La priorité est de réduire l’exposition comportementale.",
    errorExplanation:
      lastSession.detectedError || "Plusieurs signaux de dérive sont possibles.",
  };
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
  fontSize: "32px",
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

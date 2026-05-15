"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "./components/BottomNav";
import FadeIn from "./components/FadeIn";
import PrimaryButton from "./components/PrimaryButton";
import ActionCard from "./components/ActionCard";

export default function Home() {
  const [primeProfile, setPrimeProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("primeProfile");

    if (savedProfile) {
      setPrimeProfile(JSON.parse(savedProfile));
    }
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        padding: "32px",
        paddingBottom: "140px",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(0,0,0,0.50),
            rgba(0,0,0,0.82),
            rgba(0,0,0,0.96)
          ),
          url('/background.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        animation: "backgroundMove 14s ease-in-out infinite",
      }}
    >
      <div style={goldGlow} />

      <div style={container}>
        <FadeIn delay={0}>
          <p style={logo}>PRIME.</p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 style={title}>
            Trading
            <br />
            Discipline OS
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p style={subtitle}>
            {primeProfile
              ? `Profil actif : ${primeProfile.detectedProfile}. PRIME adapte ta session selon ton risque dominant.`
              : "PRIME transforme ton comportement de trader en système d’exécution discipliné."}
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <Link href="/session" style={{ textDecoration: "none" }}>
            <PrimaryButton>
              {primeProfile
                ? "Lancer ma session personnalisée"
                : "Commencer ma session"}
            </PrimaryButton>
          </Link>
        </FadeIn>

        {primeProfile && (
          <FadeIn delay={0.55}>
            <ActionCard
              href="/profile"
              title={primeProfile.detectedProfile}
              subtitle={`Risque dominant : ${primeProfile.risk}`}
            />
          </FadeIn>
        )}

        {primeProfile && (
          <FadeIn delay={0.65}>
            <ActionCard
              href="/coach"
              title="Prescription active"
              subtitle={primeProfile.prescription}
            />
          </FadeIn>
        )}

        {!primeProfile && (
          <FadeIn delay={0.6}>
            <ActionCard
              href="/onboarding"
              title="Créer mon profil PRIME"
              subtitle="Personnalise ton coaching, ta checklist et tes prescriptions."
            />
          </FadeIn>
        )}

        <FadeIn delay={0.75}>
          <ActionCard
            href="/stats"
            title="Voir mes stats"
            subtitle="Suis ta discipline, ton streak et tes erreurs dominantes."
          />
        </FadeIn>

        <FadeIn delay={0.9}>
          <ActionCard
            href="/reset"
            title="Mode Reset"
            subtitle="Stoppe la dérive émotionnelle avant qu’elle ne coûte cher."
          />
        </FadeIn>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

const goldGlow = {
  position: "absolute",
  top: "-120px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "420px",
  height: "420px",
  background:
    "radial-gradient(circle, rgba(212,176,106,0.14), transparent 70%)",
  filter: "blur(60px)",
  zIndex: 0,
  animation: "pulseGlow 5s ease-in-out infinite",
};

const container = {
  position: "relative",
  zIndex: 2,
  maxWidth: "430px",
  margin: "0 auto",
};

const logo = {
  color: "#D4B06A",
  letterSpacing: "10px",
  fontSize: "15px",
  marginBottom: "42px",
};

const title = {
  fontSize: "60px",
  lineHeight: "0.92",
  fontWeight: "700",
  marginBottom: "34px",
  letterSpacing: "-4px",
};

const subtitle = {
  color: "rgba(255,255,255,0.72)",
  fontSize: "21px",
  lineHeight: "1.6",
  marginBottom: "42px",
  maxWidth: "380px",
};

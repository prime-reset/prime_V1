import Link from "next/link";
import BottomNav from "./components/BottomNav";
import FadeIn from "./components/FadeIn";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.58), rgba(0,0,0,0.94)), url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "430px",
          margin: "0 auto",
          padding: "32px 24px 150px",
        }}
      >
        <FadeIn>
          <p style={logo}>PRIME.</p>

          <h1 style={title}>
            Trading
            <br />
            Discipline OS
          </h1>

          <p style={subtitle}>
            PRIME transforme ton comportement de trader en système d’exécution
            discipliné.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Link href="/session">
            <button style={primaryButton}>Commencer ma session</button>
          </Link>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px", marginBottom: "34px" }}>
            <Link href="/stats">
              <button style={secondaryButton}>Voir mes stats</button>
            </Link>

            <Link href="/reset">
              <button style={secondaryButton}>Mode Reset</button>
            </Link>

            <Link href="/onboarding">
              <button style={secondaryButton}>Créer mon profil PRIME</button>
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "22px" }}>
            <div style={glassCard}>
              <p style={label}>ÉTAT</p>
              <h3 style={gold}>Focus</h3>
            </div>

            <div style={glassCard}>
              <p style={label}>RISQUE</p>
              <h3 style={gold}>Stable</h3>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.65}>
          <div style={largeCard}>
            <p style={label}>SCORE DISCIPLINE</p>
            <h2 style={{ fontSize: "76px", color: "#D4B06A", margin: 0 }}>92</h2>
            <p style={text}>Discipline excellente aujourd’hui.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.8}>
          <div style={largeCard}>
            <p style={label}>PRESCRIPTION ACTIVE</p>
            <h2 style={{ fontSize: "26px", lineHeight: "34px" }}>
              Maximum 1 trade après une perte.
            </h2>
            <p style={text}>
              Objectif : protéger ton capital émotionnel avant de protéger ton PnL.
            </p>
          </div>
        </FadeIn>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

const logo = {
  color: "#D4B06A",
  letterSpacing: "6px",
  fontSize: "12px",
  marginBottom: "42px",
};

const title = {
  fontSize: "64px",
  lineHeight: "0.95",
  marginBottom: "28px",
  fontWeight: "700",
};

const subtitle = {
  color: "rgba(255,255,255,0.72)",
  fontSize: "20px",
  lineHeight: "1.7",
  marginBottom: "42px",
};

const primaryButton = {
  width: "100%",
  padding: "20px",
  borderRadius: "22px",
  border: "none",
  background: "linear-gradient(135deg,#D4B06A,#B68B45)",
  color: "black",
  fontSize: "18px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 12px 40px rgba(212,176,106,0.28)",
};

const secondaryButton = {
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(10,10,10,0.68)",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
  backdropFilter: "blur(14px)",
};

const glassCard = {
  background: "rgba(15,15,15,0.72)",
  border: "1px solid rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
  padding: "24px",
  borderRadius: "24px",
};

const largeCard = {
  background: "rgba(12,12,12,0.78)",
  border: "1px solid rgba(255,255,255,0.07)",
  backdropFilter: "blur(16px)",
  borderRadius: "28px",
  padding: "28px",
  marginBottom: "22px",
};

const label = {
  color: "rgba(255,255,255,0.45)",
  marginBottom: "10px",
  fontSize: "13px",
  letterSpacing: "2px",
};

const gold = {
  color: "#D4B06A",
  fontSize: "20px",
};

const text = {
  color: "#A0A0A0",
  fontSize: "18px",
  lineHeight: "30px",
};

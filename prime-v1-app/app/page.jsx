import Link from "next/link";
import BottomNav from "./components/BottomNav";
import FadeIn from "./components/FadeIn";
import PremiumCard from "./components/PremiumCard";

export default function Home() {
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
      }}
    >
      <div
        style={{
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
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "430px",
          margin: "0 auto",
        }}
      >
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
            PRIME transforme ton comportement de trader en système d’exécution
            discipliné.
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <Link href="/session" style={{ textDecoration: "none" }}>
            <button style={primaryButton}>Commencer ma session</button>
          </Link>
        </FadeIn>

        <FadeIn delay={0.6}>
          <PremiumCard>
            <Link href="/stats" style={cardLink}>
              Voir mes stats
            </Link>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.75}>
          <PremiumCard>
            <Link href="/reset" style={cardLink}>
              Mode Reset
            </Link>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.9}>
          <PremiumCard>
            <Link href="/onboarding" style={cardLink}>
              Créer mon profil PRIME
            </Link>
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

const logo = {
  color: "#D4B06A",
  letterSpacing: "10px",
  fontSize: "15px",
  marginBottom: "42px",
};

const title = {
  fontSize: "68px",
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

const primaryButton = {
  width: "100%",
  padding: "24px",
  borderRadius: "30px",
  border: "none",
  background: "#D4B06A",
  color: "black",
  fontSize: "22px",
  fontWeight: "700",
  cursor: "pointer",
  marginBottom: "26px",
  boxShadow: `
  0 0 40px rgba(212,176,106,0.18),
  0 10px 30px rgba(0,0,0,0.35)
`,
transition: "all 0.3s ease",
};

const cardLink = {
  color: "white",
  textDecoration: "none",
  fontSize: "20px",
  display: "block",
};

      import Link from "next/link";
import BottomNav from "./components/BottomNav";
import FadeIn from "./components/FadeIn";
import PrimaryButton from "./components/PrimaryButton";
import ActionCard from "./components/ActionCard";

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
            PRIME transforme ton comportement de trader en système d’exécution
            discipliné.
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <Link href="/session" style={{ textDecoration: "none" }}>
            <PrimaryButton>Commencer ma session</PrimaryButton>
          </Link>
        </FadeIn>

        <FadeIn delay={0.6}>
          <ActionCard
            href="/stats"
            title="Voir mes stats"
            subtitle="Suis ta discipline, ton streak et tes erreurs dominantes."
          />
        </FadeIn>

        <FadeIn delay={0.75}>
          <ActionCard
            href="/reset"
            title="Mode Reset"
            subtitle="Stoppe la dérive émotionnelle avant qu’elle ne coûte cher."
          />
        </FadeIn>

        <FadeIn delay={0.9}>
          <ActionCard
            href="/onboarding"
            title="Créer mon profil PRIME"
            subtitle="Personnalise ton coaching, ta checklist et tes prescriptions."
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

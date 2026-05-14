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
            rgba(0,0,0,0.55),
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
      {/* LIGHT EFFECT */}
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
        {/* LOGO */}
        <FadeIn delay="0s">
          <p
            style={{
              color: "#D4B06A",
              letterSpacing: "10px",
              fontSize: "15px",
              marginBottom: "42px",
            }}
          >
            PRIME.
          </p>
        </FadeIn>

        {/* TITLE */}
        <FadeIn delay="0.15s">
          <h1
            style={{
              fontSize: "74px",
              lineHeight: "0.92",
              fontWeight: "700",
              marginBottom: "34px",
              letterSpacing: "-4px",
            }}
          >
            Trading
            <br />
            Discipline OS
          </h1>
        </FadeIn>

        {/* DESCRIPTION */}
        <FadeIn delay="0.3s">
          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "22px",
              lineHeight: "1.6",
              marginBottom: "42px",
              maxWidth: "380px",
            }}
          >
            PRIME transforme ton comportement de trader en système
            d’exécution discipliné.
          </p>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay="0.45s">
          <Link href="/session">
            <button
              style={{
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

                boxShadow: "0 0 40px rgba(212,176,106,0.25)",
                transition: "0.3s",
              }}
            >
              Commencer ma session
            </button>
          </Link>
        </FadeIn>

        {/* CARDS */}
        <FadeIn delay="0.6s">
          <PremiumCard>
            <Link
              href="/stats"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "20px",
              }}
            >
              Voir mes stats
            </Link>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay="0.75s">
          <PremiumCard>
            <Link
              href="/reset"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "20px",
              }}
            >
              Mode Reset
            </Link>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay="0.9s">
          <PremiumCard>
            <Link
              href="/onboarding"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "20px",
              }}
            >
              Créer mon profil PRIME
            </Link>
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

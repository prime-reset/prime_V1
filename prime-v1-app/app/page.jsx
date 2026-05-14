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
          "linear-gradient(to bottom, rgba(0,0,0,0.72), rgba(0,0,0,0.96)), url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Glow premium */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "420px",
          height: "420px",
          background: "rgba(212,176,106,0.12)",
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "430px",
          margin: "0 auto",
          padding: "32px 24px 120px",
        }}
      >
        <FadeIn delay={0}>
          <p
            style={{
              color: "#D4B06A",
              letterSpacing: "6px",
              fontSize: "12px",
              marginBottom: "42px",
            }}
          >
            PRIME.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h1
            style={{
              fontSize: "64px",
              lineHeight: "0.95",
              marginBottom: "28px",
              fontWeight: "700",
            }}
          >
            Trading
            <br />
            Discipline OS
          </h1>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "20px",
              lineHeight: "1.7",
              marginBottom: "42px",
            }}
          >
            PRIME transforme ton comportement de trader en
            système d’exécution discipliné.
          </p>
        </FadeIn>

        <FadeIn delay={0.6}>
          <Link href="/session">
            <button
              style={{
                width: "100%",
                padding: "20px",
                borderRadius: "22px",
                border: "none",
                background:
                  "linear-gradient(135deg,#D4B06A,#B68B45)",
                color: "black",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "28px",
                boxShadow: "0 12px 40px rgba(212,176,106,0.28)",
                transition: "0.3s",
              }}
            >
              Commencer ma session
            </button>
          </Link>
        </FadeIn>

        <FadeIn delay={0.8}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "rgba(15,15,15,0.72)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(14px)",
                padding: "24px",
                borderRadius: "24px",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: "10px",
                  fontSize: "13px",
                  letterSpacing: "2px",
                }}
              >
                ÉTAT
              </p>

              <h3
                style={{
                  color: "#D4B06A",
                  fontSize: "18px",
                }}
              >
                Focus
              </h3>
            </div>

            <div
              style={{
                background: "rgba(15,15,15,0.72)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(14px)",
                padding: "24px",
                borderRadius: "24px",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: "10px",
                  fontSize: "13px",
                  letterSpacing: "2px",
                }}
              >
                RISQUE
              </p>

              <h3
                style={{
                  color: "#D4B06A",
                  fontSize: "18px",
                }}
              >
                Stable
              </h3>
            </div>
          </div>
        </FadeIn>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

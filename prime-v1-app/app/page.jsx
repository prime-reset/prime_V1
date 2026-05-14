import Link from "next/link";
import BottomNav from "./components/BottomNav";
export default function Home() {
  return (
    <main
      style={{
        backgroundColor: "#050505",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        padding: "28px",
        paddingBottom: "140px",
      }}
    >
      <div
        style={{
          maxWidth: "430px",
          margin: "0 auto",
        }}
      >
        {/* LOGO */}

        <p
          style={{
            color: "#C8A96B",
            letterSpacing: "6px",
            fontSize: "14px",
            marginBottom: "40px",
          }}
        >
          PRIME.
        </p>

        {/* HERO */}

        <h1
          style={{
            fontSize: "76px",
            lineHeight: "76px",
            marginBottom: "30px",
            fontWeight: "700",
          }}
        >
          Trading
          <br />
          Discipline OS
        </h1>

        <p
          style={{
            color: "#8D8D8D",
            fontSize: "18px",
            lineHeight: "42px",
            marginBottom: "50px",
          }}
        >
          PRIME transforme ton comportement de
          trader en système d’exécution discipliné.
        </p>

        {/* CTA */}

        <Link
          href="/session"
          style={{
            textDecoration: "none",
          }}
        >
          <button
            style={{
              width: "100%",
              background: "#C8A96B",
              color: "#000",
              border: "none",
              padding: "22px",
              borderRadius: "24px",
              fontWeight: "700",
              fontSize: "18px",
              cursor: "pointer",
              marginBottom: "40px",
              boxShadow:
                "0 0 40px rgba(200,169,107,0.18)",
            }}
          >
            Commencer ma session
          </button>
        </Link>

        {/* CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#0E0E0E",
              padding: "26px",
              borderRadius: "28px",
              border:
                "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <p
              style={{
                color: "#666",
                fontSize: "13px",
                marginBottom: "18px",
                letterSpacing: "1px",
              }}
            >
              ÉTAT
            </p>

            <h2
              style={{
                color: "#C8A96B",
                margin: 0,
                fontSize: "24px",
              }}
            >
              Focus
            </h2>
          </div>

          <div
            style={{
              background: "#0E0E0E",
              padding: "26px",
              borderRadius: "28px",
              border:
                "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <p
              style={{
                color: "#666",
                fontSize: "13px",
                marginBottom: "18px",
                letterSpacing: "1px",
              }}
            >
              RISQUE
            </p>

            <h2
              style={{
                color: "#C8A96B",
                margin: 0,
                fontSize: "24px",
              }}
            >
              Stable
            </h2>
          </div>
        </div>

        {/* SCORE */}

        <div
          style={{
            background:
              "linear-gradient(180deg,#111111 0%,#090909 100%)",
            borderRadius: "32px",
            padding: "30px",
            marginBottom: "30px",
            border:
              "1px solid rgba(255,255,255,0.05)",
            boxShadow:
              "0 0 40px rgba(255,255,255,0.03)",
          }}
        >
          <p
            style={{
              color: "#666",
              marginBottom: "12px",
              fontSize: "13px",
              letterSpacing: "1px",
            }}
          >
            SCORE DISCIPLINE
          </p>

          <h2
            style={{
              fontSize: "82px",
              color: "#C8A96B",
              margin: 0,
              lineHeight: "90px",
            }}
          >
            92
          </h2>

          <p
            style={{
              color: "#A0A0A0",
              fontSize: "18px",
              marginTop: "16px",
              lineHeight: "34px",
            }}
          >
            Discipline excellente aujourd’hui.
          </p>
        </div>

        {/* PROFIL */}

        <div
          style={{
            background: "#0E0E0E",
            borderRadius: "32px",
            padding: "30px",
            border:
              "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              color: "#666",
              marginBottom: "20px",
              fontSize: "13px",
              letterSpacing: "1px",
            }}
          >
            PROFIL TRADER
          </p>

          <h2
            style={{
              fontSize: "28px",
              marginBottom: "20px",
            }}
          >
            Structure & Liquidité
          </h2>

          <p
            style={{
              color: "#A0A0A0",
              lineHeight: "38px",
              fontSize: "18px",
            }}
          >
            Tu trades les sweeps, les BOS et les
            réactions propres avec patience et
            précision.
          </p>
        </div>
      </div>

      {/* BOTTOM NAV */}

      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "92%",
          maxWidth: "460px",
          background: "rgba(15,15,15,0.92)",
          backdropFilter: "blur(20px)",
          borderRadius: "28px",
          padding: "20px 28px",
          display: "flex",
          justifyContent: "space-between",
          border:
            "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#C8A96B",
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "16px",
          }}
        >
          Prime
        </Link>

        <Link
          href="/session"
          style={{
            color: "#777",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Session
        </Link>

        <Link
          href="/coach"
          style={{
            color: "#777",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Coach
        </Link>

        <Link
          href="/journal"
          style={{
            color: "#777",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Journal
        </Link>
      </div>
      <BottomNav active="Prime" />
    </main>
  );
}

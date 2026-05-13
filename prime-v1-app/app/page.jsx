export default function Home() {
  return (
    <main
      style={{
        backgroundColor: "#050505",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Arial",
        paddingBottom: "140px",
      }}
    >
      <div
        style={{
          maxWidth: "430px",
          margin: "0 auto",
          padding: "28px",
        }}
      >
        {/* HERO */}

        <div
          style={{
            position: "relative",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "240px",
              height: "240px",
              background: "#C8A96B",
              filter: "blur(130px)",
              opacity: 0.12,
              top: "-100px",
              right: "-100px",
              borderRadius: "999px",
            }}
          />

          <p
            style={{
              color: "#C8A96B",
              letterSpacing: "4px",
              fontSize: "12px",
              marginBottom: "20px",
              position: "relative",
              zIndex: 2,
            }}
          >
            PRIME.
          </p>

          <h1
            style={{
              fontSize: "60px",
              lineHeight: "60px",
              marginBottom: "28px",
              fontWeight: "700",
              position: "relative",
              zIndex: 2,
            }}
          >
            Trading
            <br />
            Discipline OS
          </h1>

          <p
            style={{
              color: "#8D8D8D",
              fontSize: "20px",
              lineHeight: "34px",
              maxWidth: "360px",
              position: "relative",
              zIndex: 2,
            }}
          >
            PRIME transforme ton comportement de trader
            en système d’exécution discipliné.
          </p>
        </div>

        {/* CTA */}

        <button
          style={{
            width: "100%",
            background: "#C8A96B",
            color: "#000",
            border: "none",
            padding: "20px",
            borderRadius: "22px",
            fontWeight: "700",
            fontSize: "17px",
            marginBottom: "30px",
            cursor: "pointer",
            boxShadow: "0 0 40px rgba(200,169,107,0.18)",
          }}
        >
          Commencer ma session
        </button>

        {/* MINI CARDS */}

        <div
          style={{
            display: "flex",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#111",
              borderRadius: "24px",
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            <p
              style={{
                color: "#666",
                fontSize: "12px",
                marginBottom: "12px",
                letterSpacing: "1px",
              }}
            >
              ÉTAT
            </p>

            <h3
              style={{
                color: "#C8A96B",
                margin: 0,
                fontSize: "22px",
              }}
            >
              Focus
            </h3>
          </div>

          <div
            style={{
              flex: 1,
              background: "#111",
              borderRadius: "24px",
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            <p
              style={{
                color: "#666",
                fontSize: "12px",
                marginBottom: "12px",
                letterSpacing: "1px",
              }}
            >
              RISQUE
            </p>

            <h3
              style={{
                color: "#C8A96B",
                margin: 0,
                fontSize: "22px",
              }}
            >
              Stable
            </h3>
          </div>
        </div>

        {/* SCORE */}

        <div
          style={{
            background:
              "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "30px",
            padding: "30px",
            marginBottom: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "13px",
              marginBottom: "16px",
              letterSpacing: "1px",
            }}
          >
            SCORE DISCIPLINE
          </p>

          <h2
            style={{
              color: "#C8A96B",
              fontSize: "92px",
              margin: 0,
              lineHeight: 1,
            }}
          >
            92
          </h2>

          <p
            style={{
              color: "#999",
              marginTop: "18px",
              fontSize: "22px",
              lineHeight: "34px",
            }}
          >
            Discipline excellente aujourd’hui.
          </p>
        </div>

        {/* INSIGHT IA */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #111111 0%, #181818 100%)",
            borderRadius: "30px",
            padding: "30px",
            marginBottom: "24px",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <p
            style={{
              color: "#C8A96B",
              marginBottom: "16px",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            INSIGHT IA
          </p>

          <p
            style={{
              color: "white",
              fontSize: "26px",
              lineHeight: "40px",
              fontWeight: "600",
            }}
          >
            Tu exécutes mieux lorsque tu réduis ton rythme
            après une perte.
          </p>
        </div>

        {/* PROFIL */}

        <div
          style={{
            background:
              "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
            borderRadius: "30px",
            padding: "30px",
            border: "1px solid rgba(255,255,255,0.05)",
            marginBottom: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <p
            style={{
              color: "#666",
              marginBottom: "16px",
              fontSize: "13px",
              letterSpacing: "1px",
            }}
          >
            PROFIL TRADER
          </p>

          <h3
            style={{
              fontSize: "36px",
              marginBottom: "18px",
              lineHeight: "42px",
            }}
          >
            Structure & Liquidité
          </h3>

          <p
            style={{
              color: "#999",
              fontSize: "20px",
              lineHeight: "34px",
            }}
          >
            Tu trades les sweeps, les BOS et les réactions
            propres avec patience et précision.
          </p>
        </div>

        {/* PRESCRIPTION */}

        <div
          style={{
            background: "#111",
            borderRadius: "30px",
            padding: "30px",
            marginBottom: "24px",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <p
            style={{
              color: "#666",
              marginBottom: "16px",
              fontSize: "13px",
              letterSpacing: "1px",
            }}
          >
            PRESCRIPTION ACTIVE
          </p>

          <p
            style={{
              color: "white",
              fontSize: "24px",
              lineHeight: "38px",
              fontWeight: "600",
            }}
          >
            Maximum 1 trade après une perte pendant
            5 jours.
          </p>
        </div>

        {/* STREAK */}

        <div
          style={{
            background:
              "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
            borderRadius: "30px",
            padding: "30px",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "13px",
              letterSpacing: "1px",
              marginBottom: "16px",
            }}
          >
            STREAK
          </p>

          <h2
            style={{
              color: "white",
              fontSize: "48px",
              margin: 0,
            }}
          >
            12 jours
          </h2>

          <p
            style={{
              color: "#999",
              marginTop: "14px",
              lineHeight: "32px",
              fontSize: "18px",
            }}
          >
            Tu maintiens une discipline constante depuis
            presque deux semaines.
          </p>
        </div>
      </div>

      {/* BOTTOM NAV */}

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "430px",
          background: "rgba(15,15,15,0.92)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "28px",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        <span
          style={{
            color: "#C8A96B",
            fontWeight: "700",
          }}
        >
          Prime
        </span>

        <span style={{ color: "#777" }}>
          Session
        </span>

        <span style={{ color: "#777" }}>
          Coach
        </span>

        <span style={{ color: "#777" }}>
          Journal
        </span>
      </div>
    </main>
  );
}

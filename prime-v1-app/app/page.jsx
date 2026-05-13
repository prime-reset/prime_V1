export default function Home() {
  return (
    <main
      style={{
        backgroundColor: "#050505",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Arial",
        paddingBottom: "120px",
      }}
    >
      <div
        style={{
          maxWidth: "430px",
          margin: "0 auto",
          padding: "28px",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              color: "#C8A96B",
              letterSpacing: "4px",
              fontSize: "12px",
              marginBottom: "20px",
            }}
          >
            PRIME.
          </p>

          <h1
            style={{
              fontSize: "54px",
              lineHeight: "54px",
              marginBottom: "24px",
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
              lineHeight: "30px",
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
            padding: "18px",
            borderRadius: "20px",
            fontWeight: "700",
            fontSize: "17px",
            marginBottom: "32px",
            cursor: "pointer",
          }}
        >
          Commencer ma session
        </button>

        {/* SCORE CARD */}

        <div
          style={{
            background: "#0D0D0D",
            border: "1px solid #1A1A1A",
            borderRadius: "28px",
            padding: "28px",
            marginBottom: "24px",
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
              fontSize: "82px",
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
              fontSize: "20px",
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
            borderRadius: "28px",
            padding: "28px",
            marginBottom: "24px",
            border: "1px solid #1D1D1D",
          }}
        >
          <p
            style={{
              color: "#C8A96B",
              marginBottom: "14px",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            INSIGHT IA
          </p>

          <p
            style={{
              color: "white",
              fontSize: "24px",
              lineHeight: "38px",
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
            background: "#0D0D0D",
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #1A1A1A",
            marginBottom: "24px",
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
              fontSize: "34px",
              marginBottom: "18px",
              lineHeight: "40px",
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
      </div>

      {/* BOTTOM NAVIGATION */}

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "430px",
          background: "rgba(15,15,15,0.95)",
          border: "1px solid #222",
          borderRadius: "24px",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
        }}
      >
        <span style={{ color: "#C8A96B" }}>Prime</span>
        <span style={{ color: "#777" }}>Session</span>
        <span style={{ color: "#777" }}>Coach</span>
        <span style={{ color: "#777" }}>Journal</span>
      </div>
    </main>
  );
}

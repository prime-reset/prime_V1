export default function Home() {
  return (
    <main
      style={{
        backgroundColor: "#050505",
        color: "white",
        minHeight: "100vh",
        padding: "40px 24px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          margin: "0 auto",
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
            fontSize: "52px",
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
            color: "#999",
            fontSize: "18px",
            lineHeight: "30px",
            marginBottom: "40px",
          }}
        >
          PRIME transforme ton comportement de trader en système
          d’exécution discipliné.
        </p>

        <button
          style={{
            background: "#C8A96B",
            color: "black",
            border: "none",
            padding: "16px 24px",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
            marginBottom: "50px",
          }}
        >
          Commencer ma session
        </button>

        <div
          style={{
            background: "#111",
            border: "1px solid #1f1f1f",
            borderRadius: "24px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              color: "#666",
              marginBottom: "10px",
              fontSize: "14px",
            }}
          >
            SCORE DISCIPLINE
          </p>

          <h2
            style={{
              fontSize: "64px",
              color: "#C8A96B",
              margin: 0,
            }}
          >
            92
          </h2>

          <p
            style={{
              color: "#999",
              marginTop: "10px",
            }}
          >
            Discipline excellente aujourd’hui.
          </p>
        </div>

        <div
          style={{
            background: "#111",
            border: "1px solid #1f1f1f",
            borderRadius: "24px",
            padding: "24px",
          }}
        >
          <p
            style={{
              color: "#666",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            PROFIL TRADER
          </p>

          <h3
            style={{
              fontSize: "28px",
              marginBottom: "12px",
            }}
          >
            Structure & Liquidité
          </h3>

          <p
            style={{
              color: "#999",
              lineHeight: "28px",
            }}
          >
            Tu trades les sweeps, les BOS et les réactions propres
            avec patience et précision.
          </p>
        </div>
      </div>
    </main>
  );
}

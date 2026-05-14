export default function ProfilePage() {
  return (
    <main
      style={{
        background: "#050505",
        color: "white",
        minHeight: "100vh",
        padding: "24px",
        paddingBottom: "120px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "430px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#D4B06A",
            letterSpacing: "6px",
            fontSize: "12px",
            marginBottom: "20px",
          }}
        >
          PROFILE PRIME
        </p>

        <h1
          style={{
            fontSize: "46px",
            lineHeight: "50px",
            marginBottom: "18px",
          }}
        >
          Ton identité
          <br />
          de trader.
        </h1>

        <p
          style={{
            color: "#8A8A8A",
            fontSize: "18px",
            lineHeight: "30px",
            marginBottom: "34px",
          }}
        >
          PRIME adapte le coaching et les prescriptions
          selon ton comportement réel.
        </p>

        {/* PROFIL */}

        <div
          style={{
            background:
              "linear-gradient(180deg,#141414 0%,#0B0B0B 100%)",
            borderRadius: "30px",
            padding: "28px",
            marginBottom: "24px",
            border:
              "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              color: "#777",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            PROFIL DÉTECTÉ
          </p>

          <h2
            style={{
              fontSize: "34px",
              color: "#D4B06A",
              marginBottom: "16px",
            }}
          >
            Structure & Liquidité
          </h2>

          <p
            style={{
              color: "#A0A0A0",
              fontSize: "18px",
              lineHeight: "30px",
            }}
          >
            Tu privilégies les sweeps, les BOS et les
            réactions propres sur zones institutionnelles.
          </p>
        </div>

        {/* FORCES */}

        <div
          style={{
            background: "#0D0D0D",
            borderRadius: "30px",
            padding: "28px",
            marginBottom: "24px",
            border:
              "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              color: "#777",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            FORCES DOMINANTES
          </p>

          {[
            "Patience avant exécution",
            "Bonne lecture structurelle",
            "Respect des zones HTF",
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "14px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  background: "#D4B06A",
                  marginTop: "8px",
                }}
              />

              <p
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#EAEAEA",
                }}
              >
                {item}
              </p>
            </div>
          ))}
        </div>

        {/* POINTS FAIBLES */}

        <div
          style={{
            background: "#0D0D0D",
            borderRadius: "30px",
            padding: "28px",
            marginBottom: "24px",
            border:
              "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              color: "#777",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            POINTS À CORRIGER
          </p>

          {[
            "Impulsivité après perte",
            "Entrée parfois prématurée",
            "Risque d’overtrading",
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "14px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  background: "#B85C5C",
                  marginTop: "8px",
                }}
              />

              <p
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#EAEAEA",
                }}
              >
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* NAVIGATION */}

      <div
        style={{
          position: "fixed",
          bottom: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "92%",
          maxWidth: "520px",
          background: "rgba(15,15,15,0.95)",
          border: "1px solid #1F1F1F",
          borderRadius: "24px",
          display: "flex",
          justifyContent: "space-around",
          padding: "18px 10px",
          backdropFilter: "blur(12px)",
        }}
      >
        {[
          ["Prime", "/"],
          ["Session", "/session"],
          ["Coach", "/coach"],
          ["Journal", "/journal"],
        ].map(([label, link]) => (
          <a
            key={label}
            href={link}
            style={{
              color:
                label === "Prime"
                  ? "#D4B06A"
                  : "#8B8B8B",
              textDecoration: "none",
              fontSize: "17px",
              fontWeight:
                label === "Prime" ? "700" : "500",
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </main>
  );
}

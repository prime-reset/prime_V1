export default function Session() {
  return (
    <main
      style={{
        background: "#050505",
        minHeight: "100vh",
        color: "white",
        fontFamily: "Arial",
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
        <p
          style={{
            color: "#C8A96B",
            letterSpacing: "4px",
            fontSize: "12px",
            marginBottom: "20px",
          }}
        >
          SESSION PRIME
        </p>

        <h1
          style={{
            fontSize: "48px",
            lineHeight: "52px",
            marginBottom: "18px",
          }}
        >
          Prépare
          <br />
          ton exécution.
        </h1>

        <p
          style={{
            color: "#888",
            lineHeight: "32px",
            fontSize: "18px",
            marginBottom: "36px",
          }}
        >
          PRIME analyse ton état, ton risque et ton
          comportement avant toute exécution.
        </p>

        {/* ÉTAT */}

        <div
          style={{
            background: "#111",
            borderRadius: "28px",
            padding: "26px",
            marginBottom: "22px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              color: "#666",
              marginBottom: "14px",
              fontSize: "13px",
            }}
          >
            ÉTAT ÉMOTIONNEL
          </p>

          <h2
            style={{
              color: "#C8A96B",
              margin: 0,
              fontSize: "34px",
            }}
          >
            Concentré
          </h2>
        </div>

        {/* CHECKLIST */}

        <div
          style={{
            background:
              "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
            borderRadius: "28px",
            padding: "26px",
            marginBottom: "22px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              color: "#C8A96B",
              marginBottom: "18px",
              fontSize: "13px",
              letterSpacing: "1px",
            }}
          >
            CHECKLIST
          </p>

          {[
            "Contexte HTF validé",
            "Liquidité identifiée",
            "Setup confirmé",
            "Risque respecté",
            "Pas d’émotion détectée",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "6px",
                  background: "#C8A96B",
                  marginRight: "14px",
                }}
              />

              <p
                style={{
                  color: "white",
                  margin: 0,
                  fontSize: "18px",
                }}
              >
                {item}
              </p>
            </div>
          ))}
        </div>

        {/* ANALYSE IA */}

        <div
          style={{
            background: "#111",
            borderRadius: "28px",
            padding: "26px",
            marginBottom: "22px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              color: "#666",
              marginBottom: "14px",
              fontSize: "13px",
            }}
          >
            ANALYSE PRIME
          </p>

          <p
            style={{
              color: "white",
              fontSize: "22px",
              lineHeight: "36px",
              margin: 0,
            }}
          >
            Ton comportement est stable aujourd’hui.
            Le risque d’overtrading est faible.
          </p>
        </div>

        {/* BOUTON */}

        <button
          style={{
            width: "100%",
            background: "#C8A96B",
            color: "black",
            border: "none",
            padding: "20px",
            borderRadius: "22px",
            fontWeight: "700",
            fontSize: "18px",
            marginTop: "20px",
            boxShadow: "0 0 40px rgba(200,169,107,0.15)",
          }}
        >
          Commencer la session
        </button>
      </div>
    </main>
  );
}

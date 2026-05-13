export default function SessionPage() {
  return (
    <main
      style={{
        background: "#050505",
        color: "white",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "120px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: "32px",
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
          PRIME.
        </p>

        <h1
          style={{
            fontSize: "42px",
            lineHeight: "44px",
            fontWeight: "700",
            marginBottom: "18px",
          }}
        >
          Session
          <br />
          Trader
        </h1>

        <p
          style={{
            color: "#8A8A8A",
            fontSize: "18px",
            lineHeight: "30px",
          }}
        >
          Prépare ton exécution avant l’ouverture du marché.
        </p>
      </div>

      {/* ETAT */}

      <div
        style={{
          background: "#0D0D0D",
          border: "1px solid #1A1A1A",
          borderRadius: "28px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            color: "#777",
            fontSize: "14px",
            marginBottom: "12px",
          }}
        >
          ÉTAT DU TRADER
        </p>

        <h2
          style={{
            color: "#D4B06A",
            fontSize: "36px",
            marginBottom: "12px",
          }}
        >
          Focus
        </h2>

        <p
          style={{
            color: "#A0A0A0",
            lineHeight: "28px",
          }}
        >
          Tu sembles disciplinée aujourd’hui. Continue de privilégier
          la patience et les confirmations propres.
        </p>
      </div>

      {/* CHECKLIST */}

      <div
        style={{
          background: "#0D0D0D",
          border: "1px solid #1A1A1A",
          borderRadius: "28px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            color: "#777",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          CHECKLIST SESSION
        </p>

        {[
          "Ai-je mon biais HTF ?",
          "Les zones de liquidité sont-elles identifiées ?",
          "Ai-je une invalidation claire ?",
          "Le marché est-il en condition propre ?",
          "Mon état émotionnel est-il stable ?",
        ].map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                border: "1px solid #D4B06A",
              }}
            />

            <p
              style={{
                fontSize: "17px",
                color: "#EAEAEA",
              }}
            >
              {item}
            </p>
          </div>
        ))}
      </div>

      {/* PSYCHO */}

      <div
        style={{
          background:
            "linear-gradient(180deg, #151515 0%, #0B0B0B 100%)",
          borderRadius: "28px",
          padding: "24px",
          marginBottom: "24px",
          border: "1px solid #1A1A1A",
        }}
      >
        <p
          style={{
            color: "#777",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          RAPPEL PSYCHOLOGIQUE
        </p>

        <p
          style={{
            fontSize: "24px",
            lineHeight: "38px",
            fontWeight: "600",
          }}
        >
          Ton edge ne vient pas de l’action.
          <br />
          Il vient de ta capacité à attendre.
        </p>
      </div>

      {/* BOUTON */}

      <button
        style={{
          width: "100%",
          background: "#D4B06A",
          color: "black",
          border: "none",
          borderRadius: "20px",
          padding: "20px",
          fontSize: "18px",
          fontWeight: "700",
          marginTop: "10px",
          cursor: "pointer",
        }}
      >
        Valider ma préparation
      </button>

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
        ].map(([label, link], index) => (
          <a
            key={index}
            href={link}
            style={{
              color:
                label === "Session"
                  ? "#D4B06A"
                  : "#8B8B8B",
              textDecoration: "none",
              fontSize: "17px",
              fontWeight:
                label === "Session" ? "700" : "500",
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </main>
  );
}

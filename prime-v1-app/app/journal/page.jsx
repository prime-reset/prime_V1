export default function JournalPage() {
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
          JOURNAL PRIME
        </p>

        <h1
          style={{
            fontSize: "46px",
            lineHeight: "50px",
            marginBottom: "18px",
          }}
        >
          Ton évolution
          <br />
          comportementale.
        </h1>

        <p
          style={{
            color: "#8A8A8A",
            fontSize: "18px",
            lineHeight: "30px",
            marginBottom: "34px",
          }}
        >
          Analyse tes comportements, tes émotions et
          ta discipline au fil du temps.
        </p>

        {/* TIMELINE */}

        {[
          {
            date: "13 MAI",
            score: "92",
            emotion: "Focus",
            insight:
              "Excellente patience avant exécution.",
          },

          {
            date: "12 MAI",
            score: "68",
            emotion: "Impulsif",
            insight:
              "Entrée prise sans confirmation complète.",
          },

          {
            date: "11 MAI",
            score: "81",
            emotion: "Stable",
            insight:
              "Bonne gestion émotionnelle malgré volatilité.",
          },
        ].map((session, index) => (
          <div
            key={index}
            style={{
              background:
                "linear-gradient(180deg,#121212 0%,#0A0A0A 100%)",
              borderRadius: "30px",
              padding: "26px",
              marginBottom: "22px",
              border:
                "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "22px",
              }}
            >
              <p
                style={{
                  color: "#777",
                  fontSize: "13px",
                  letterSpacing: "1px",
                }}
              >
                {session.date}
              </p>

              <p
                style={{
                  color: "#D4B06A",
                  fontWeight: "700",
                }}
              >
                {session.score}/100
              </p>
            </div>

            <h2
              style={{
                fontSize: "30px",
                marginBottom: "14px",
              }}
            >
              {session.emotion}
            </h2>

            <p
              style={{
                color: "#A0A0A0",
                fontSize: "18px",
                lineHeight: "30px",
              }}
            >
              {session.insight}
            </p>
          </div>
        ))}
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
                label === "Journal"
                  ? "#D4B06A"
                  : "#8B8B8B",
              textDecoration: "none",
              fontSize: "17px",
              fontWeight:
                label === "Journal" ? "700" : "500",
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </main>
  );
}

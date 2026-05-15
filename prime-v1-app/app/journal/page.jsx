import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";

export default function JournalPage() {
  const sessions = [
    {
      date: "13 MAI",
      score: "92",
      emotion: "Focus",
      insight: "Excellente patience avant exécution.",
    },
    {
      date: "12 MAI",
      score: "68",
      emotion: "Impulsif",
      insight: "Entrée prise sans confirmation complète.",
    },
    {
      date: "11 MAI",
      score: "81",
      emotion: "Stable",
      insight: "Bonne gestion émotionnelle malgré volatilité.",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #050505 0%, #0A0A0A 55%, #050505 100%)",
        color: "white",
        padding: "32px",
        paddingBottom: "140px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <FadeIn delay={0}>
          <p style={label}>JOURNAL PRIME</p>

          <h1 style={title}>
            Ton évolution
            <br />
            comportementale.
          </h1>

          <p style={subtitle}>
            Suis tes émotions, tes erreurs, ta discipline et les patterns qui se
            répètent dans ton trading.
          </p>
        </FadeIn>

        {sessions.map((session, index) => (
          <FadeIn key={session.date} delay={0.2 + index * 0.15}>
            <PremiumCard>
              <div style={topLine}>
                <p style={cardLabel}>{session.date}</p>
                <p style={score}>{session.score}/100</p>
              </div>

              <h2 style={cardTitle}>{session.emotion}</h2>

              <p style={text}>{session.insight}</p>
            </PremiumCard>
          </FadeIn>
        ))}
      </div>

      <BottomNav active="Journal" />
    </main>
  );
}

const label = {
  color: "#D4B06A",
  letterSpacing: "6px",
  fontSize: "12px",
  marginBottom: "24px",
};

const title = {
  fontSize: "52px",
  lineHeight: "0.96",
  fontWeight: "700",
  marginBottom: "24px",
  letterSpacing: "-2px",
};

const subtitle = {
  color: "rgba(255,255,255,0.64)",
  fontSize: "19px",
  lineHeight: "1.6",
  marginBottom: "34px",
};

const topLine = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
};

const cardLabel = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "13px",
  letterSpacing: "2px",
  margin: 0,
};

const score = {
  color: "#D4B06A",
  fontWeight: "700",
  margin: 0,
};

const cardTitle = {
  fontSize: "32px",
  margin: "0 0 14px",
};

const text = {
  color: "rgba(255,255,255,0.58)",
  fontSize: "18px",
  lineHeight: "30px",
};

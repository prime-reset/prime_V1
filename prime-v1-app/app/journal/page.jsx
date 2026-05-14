import BottomNav from "../components/BottomNav";

export default function JournalPage() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px", paddingBottom: "120px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <p style={{ color: "#D4B06A", letterSpacing: "6px", fontSize: "12px", marginBottom: "20px" }}>JOURNAL PRIME</p>

        <h1 style={{ fontSize: "46px", lineHeight: "50px", marginBottom: "18px" }}>
          Ton évolution<br />comportementale.
        </h1>

        <p style={{ color: "#8A8A8A", fontSize: "18px", lineHeight: "30px", marginBottom: "34px" }}>
          Analyse tes comportements, tes émotions et ta discipline au fil du temps.
        </p>

        {[
          ["13 MAI", "92", "Focus", "Excellente patience avant exécution."],
          ["12 MAI", "68", "Impulsif", "Entrée prise sans confirmation complète."],
          ["11 MAI", "81", "Stable", "Bonne gestion émotionnelle malgré volatilité."],
        ].map(([date, score, emotion, insight]) => (
          <div key={date} style={{ background: "linear-gradient(180deg,#121212 0%,#0A0A0A 100%)", borderRadius: "30px", padding: "26px", marginBottom: "22px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "22px" }}>
              <p style={{ color: "#777", fontSize: "13px", letterSpacing: "1px" }}>{date}</p>
              <p style={{ color: "#D4B06A", fontWeight: "700" }}>{score}/100</p>
            </div>
            <h2 style={{ fontSize: "30px", marginBottom: "14px" }}>{emotion}</h2>
            <p style={{ color: "#A0A0A0", fontSize: "18px", lineHeight: "30px" }}>{insight}</p>
          </div>
        ))}
      </div>

      <BottomNav active="Journal" />
    </main>
  );
}

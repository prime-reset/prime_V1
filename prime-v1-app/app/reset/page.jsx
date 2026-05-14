import BottomNav from "../components/BottomNav";

export default function ResetPage() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px", paddingBottom: "120px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <p style={{ color: "#D4B06A", letterSpacing: "6px", fontSize: "12px", marginBottom: "20px" }}>MODE RESET</p>

        <h1 style={{ fontSize: "46px", lineHeight: "50px", marginBottom: "18px" }}>
          Stoppe la dérive<br />avant qu’elle coûte cher.
        </h1>

        <p style={{ color: "#8A8A8A", fontSize: "18px", lineHeight: "30px", marginBottom: "34px" }}>
          Quand l’émotion prend le contrôle, PRIME te force à revenir au process.
        </p>

        <div style={{ background: "linear-gradient(180deg,#1A1111,#0B0B0B)", border: "1px solid rgba(184,92,92,0.35)", borderRadius: "30px", padding: "28px", marginBottom: "24px" }}>
          <p style={{ color: "#B85C5C", fontSize: "13px", letterSpacing: "1px", marginBottom: "14px" }}>ALERTE COMPORTEMENTALE</p>
          <h2 style={{ fontSize: "32px", lineHeight: "40px", marginBottom: "14px" }}>
            Risque de revenge trade détecté.
          </h2>
          <p style={{ color: "#A0A0A0", fontSize: "18px", lineHeight: "30px" }}>
            Tu dois suspendre toute nouvelle exécution pendant quelques minutes.
          </p>
        </div>

        <div style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "30px", padding: "28px", marginBottom: "24px" }}>
          <p style={{ color: "#777", fontSize: "13px", letterSpacing: "1px", marginBottom: "18px" }}>PROTOCOLE RESET</p>

          {[
            "Ferme ton carnet d’ordres pendant 3 minutes.",
            "Respire lentement : 4 secondes inspiration, 6 secondes expiration.",
            "Relis ton plan avant toute nouvelle décision.",
            "Aucun trade tant qu’une nouvelle confirmation propre n’apparaît.",
          ].map((item) => (
            <p key={item} style={{ color: "#EAEAEA", fontSize: "18px", lineHeight: "30px", marginBottom: "16px" }}>
              • {item}
            </p>
          ))}
        </div>

        <button style={{ width: "100%", background: "#D4B06A", color: "black", border: "none", borderRadius: "22px", padding: "20px", fontSize: "18px", fontWeight: "700", cursor: "pointer" }}>
          Reprendre proprement
        </button>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

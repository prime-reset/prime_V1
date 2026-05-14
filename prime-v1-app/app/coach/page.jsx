import BottomNav from "../components/BottomNav";

export default function CoachPage() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px", paddingBottom: "120px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <p style={{ color: "#D4B06A", letterSpacing: "6px", fontSize: "12px", marginBottom: "20px" }}>COACH PRIME</p>

        <h1 style={{ fontSize: "46px", lineHeight: "50px", marginBottom: "18px" }}>
          Ton cerveau<br />d’exécution.
        </h1>

        <p style={{ color: "#8A8A8A", fontSize: "18px", lineHeight: "30px", marginBottom: "30px" }}>
          PRIME détecte tes patterns et transforme tes erreurs en prescriptions concrètes.
        </p>

        <div style={{ background: "linear-gradient(180deg,#151515,#0A0A0A)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "30px", padding: "28px", marginBottom: "24px" }}>
          <p style={{ color: "#777", fontSize: "13px", letterSpacing: "1px" }}>PATTERN DÉTECTÉ</p>
          <h2 style={{ color: "#D4B06A", fontSize: "34px", marginBottom: "14px" }}>Impulsivité après perte</h2>
          <p style={{ color: "#A0A0A0", fontSize: "18px", lineHeight: "30px" }}>
            Tu as tendance à reprendre une position trop vite après un trade perdant.
          </p>
        </div>

        <div style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "30px", padding: "28px" }}>
          <p style={{ color: "#777", fontSize: "13px", letterSpacing: "1px" }}>PRESCRIPTION 7 JOURS</p>
          <h2 style={{ fontSize: "28px", lineHeight: "38px" }}>Maximum 1 trade après une perte.</h2>
        </div>
      </div>

      <BottomNav active="Coach" />
    </main>
  );
}

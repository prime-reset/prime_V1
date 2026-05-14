import BottomNav from "../components/BottomNav";

export default function ProfilePage() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px", paddingBottom: "120px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <p style={{ color: "#D4B06A", letterSpacing: "6px", fontSize: "12px", marginBottom: "20px" }}>PROFILE PRIME</p>

        <h1 style={{ fontSize: "46px", lineHeight: "50px", marginBottom: "18px" }}>
          Ton identité<br />de trader.
        </h1>

        <p style={{ color: "#8A8A8A", fontSize: "18px", lineHeight: "30px", marginBottom: "34px" }}>
          PRIME adapte le coaching selon ton comportement réel.
        </p>

        <div style={{ background: "linear-gradient(180deg,#141414 0%,#0B0B0B 100%)", borderRadius: "30px", padding: "28px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ color: "#777", fontSize: "13px", marginBottom: "14px" }}>PROFIL DÉTECTÉ</p>
          <h2 style={{ fontSize: "34px", color: "#D4B06A", marginBottom: "16px" }}>Structure & Liquidité</h2>
          <p style={{ color: "#A0A0A0", fontSize: "18px", lineHeight: "30px" }}>
            Tu privilégies les sweeps, les BOS et les réactions propres sur zones institutionnelles.
          </p>
        </div>

        <div style={{ background: "#0D0D0D", borderRadius: "30px", padding: "28px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ color: "#777", fontSize: "13px", marginBottom: "18px" }}>POINTS À CORRIGER</p>
          <p style={{ color: "#EAEAEA", fontSize: "18px" }}>• Impulsivité après perte</p>
          <p style={{ color: "#EAEAEA", fontSize: "18px" }}>• Entrée parfois prématurée</p>
          <p style={{ color: "#EAEAEA", fontSize: "18px" }}>• Risque d’overtrading</p>
        </div>
      </div>

      <BottomNav active="Profil" />
    </main>
  );
}

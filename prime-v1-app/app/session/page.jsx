import BottomNav from "../components/BottomNav";

export default function SessionPage() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px", paddingBottom: "120px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <p style={{ color: "#D4B06A", letterSpacing: "6px", fontSize: "12px", marginBottom: "20px" }}>PRIME.</p>

        <h1 style={{ fontSize: "42px", lineHeight: "44px", fontWeight: "700", marginBottom: "18px" }}>
          Session<br />Trader
        </h1>

        <p style={{ color: "#8A8A8A", fontSize: "18px", lineHeight: "30px", marginBottom: "32px" }}>
          Prépare ton exécution avant l’ouverture du marché.
        </p>

        <div style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "28px", padding: "24px", marginBottom: "24px" }}>
          <p style={{ color: "#777", fontSize: "14px", marginBottom: "12px" }}>ÉTAT DU TRADER</p>
          <h2 style={{ color: "#D4B06A", fontSize: "36px", marginBottom: "12px" }}>Focus</h2>
          <p style={{ color: "#A0A0A0", lineHeight: "28px" }}>
            Tu sembles disciplinée aujourd’hui. Continue de privilégier la patience.
          </p>
        </div>

        <div style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "28px", padding: "24px" }}>
          <p style={{ color: "#777", fontSize: "14px", marginBottom: "24px" }}>CHECKLIST SESSION</p>

          {["Biais HTF validé", "Liquidité identifiée", "Invalidation claire", "Risque respecté", "État émotionnel stable"].map((item) => (
            <p key={item} style={{ fontSize: "17px", color: "#EAEAEA", marginBottom: "18px" }}>
              □ {item}
            </p>
          ))}
        </div>
      </div>

      <BottomNav active="Session" />
    </main>
  );
}

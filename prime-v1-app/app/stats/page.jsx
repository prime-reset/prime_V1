import BottomNav from "../components/BottomNav";

export default function StatsPage() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px", paddingBottom: "120px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <p style={{ color: "#D4B06A", letterSpacing: "6px", fontSize: "12px", marginBottom: "20px" }}>
          STATS PRIME
        </p>

        <h1 style={{ fontSize: "46px", lineHeight: "50px", marginBottom: "18px" }}>
          Ta discipline<br />en données.
        </h1>

        <p style={{ color: "#8A8A8A", fontSize: "18px", lineHeight: "30px", marginBottom: "34px" }}>
          Suis ton évolution, tes erreurs dominantes et ton niveau d’exécution.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "28px", padding: "24px" }}>
            <p style={{ color: "#777", fontSize: "13px" }}>MOYENNE</p>
            <h2 style={{ color: "#D4B06A", fontSize: "42px", margin: "12px 0" }}>84</h2>
            <p style={{ color: "#999" }}>Score discipline</p>
          </div>

          <div style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "28px", padding: "24px" }}>
            <p style={{ color: "#777", fontSize: "13px" }}>STREAK</p>
            <h2 style={{ color: "#D4B06A", fontSize: "42px", margin: "12px 0" }}>12j</h2>
            <p style={{ color: "#999" }}>Routine active</p>
          </div>
        </div>

        <div style={{ background: "linear-gradient(180deg,#141414,#0A0A0A)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "30px", padding: "28px", marginBottom: "24px" }}>
          <p style={{ color: "#777", fontSize: "13px", letterSpacing: "1px", marginBottom: "18px" }}>ERREUR DOMINANTE</p>
          <h2 style={{ color: "#D4B06A", fontSize: "32px", marginBottom: "14px" }}>Entrée prématurée</h2>
          <p style={{ color: "#A0A0A0", fontSize: "18px", lineHeight: "30px" }}>
            Cette erreur apparaît dans 38% de tes sessions récentes.
          </p>
        </div>

        <div style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "30px", padding: "28px", marginBottom: "24px" }}>
          <p style={{ color: "#777", fontSize: "13px", letterSpacing: "1px", marginBottom: "20px" }}>PROGRESSION HEBDO</p>

          {[
            ["Lun", "78%"],
            ["Mar", "82%"],
            ["Mer", "69%"],
            ["Jeu", "91%"],
            ["Ven", "84%"],
          ].map(([day, value]) => (
            <div key={day} style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <p style={{ margin: 0, color: "#EAEAEA" }}>{day}</p>
                <p style={{ margin: 0, color: "#D4B06A" }}>{value}</p>
              </div>

              <div style={{ height: "8px", background: "#1A1A1A", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: value, height: "100%", background: "#D4B06A", borderRadius: "999px" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "30px", padding: "28px" }}>
          <p style={{ color: "#777", fontSize: "13px", letterSpacing: "1px", marginBottom: "16px" }}>NIVEAU PRIME</p>
          <h2 style={{ fontSize: "34px", color: "#D4B06A", marginBottom: "14px" }}>Exécutante disciplinée</h2>
          <p style={{ color: "#A0A0A0", fontSize: "18px", lineHeight: "30px" }}>
            Ton score montre une vraie progression dans le respect du plan.
          </p>
        </div>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

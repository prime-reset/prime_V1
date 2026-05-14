import BottomNav from "../components/BottomNav";

export default function OnboardingPage() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px", paddingBottom: "120px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <p style={{ color: "#D4B06A", letterSpacing: "6px", fontSize: "12px", marginBottom: "20px" }}>ONBOARDING PRIME</p>

        <h1 style={{ fontSize: "46px", lineHeight: "50px", marginBottom: "18px" }}>
          Construis ton profil<br />de trader.
        </h1>

        <p style={{ color: "#8A8A8A", fontSize: "18px", lineHeight: "30px", marginBottom: "34px" }}>
          Réponds à quelques questions pour personnaliser ta checklist, ton coaching et tes prescriptions.
        </p>

        {[
          ["STYLE DE TRADING", "Scalping", "Day trading", "Swing trading"],
          ["ERREUR DOMINANTE", "Overtrading", "Revenge trade", "Entrée prématurée"],
          ["ÉTAT SOUS PRESSION", "Calme", "Impulsif", "Douteux"],
          ["OBJECTIF PRINCIPAL", "Discipline", "Consistance", "Scaling"],
        ].map(([title, option1, option2, option3]) => (
          <div key={title} style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "30px", padding: "28px", marginBottom: "24px" }}>
            <p style={{ color: "#777", fontSize: "13px", letterSpacing: "1px", marginBottom: "18px" }}>{title}</p>

            {[option1, option2, option3].map((option) => (
              <button key={option} style={{ width: "100%", background: "#111", color: "white", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "16px", marginBottom: "12px", fontSize: "17px", textAlign: "left" }}>
                {option}
              </button>
            ))}
          </div>
        ))}

        <button style={{ width: "100%", background: "#D4B06A", color: "black", border: "none", borderRadius: "22px", padding: "20px", fontSize: "18px", fontWeight: "700", cursor: "pointer" }}>
          Générer mon profil PRIME
        </button>
      </div>

      <BottomNav active="Profil" />
    </main>
  );
}

import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";

export default function ProfilePage() {
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
          <p style={label}>PROFIL PRIME</p>

          <h1 style={title}>
            Ton identité
            <br />
            de trader.
          </h1>

          <p style={subtitle}>
            PRIME analyse ton comportement réel pour personnaliser ton coaching,
            ta checklist et tes prescriptions.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PremiumCard>
            <p style={cardLabel}>PROFIL DÉTECTÉ</p>
            <h2 style={goldTitle}>Structure & Liquidité</h2>
            <p style={text}>
              Tu privilégies les sweeps, les BOS et les réactions propres sur
              zones institutionnelles.
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <PremiumCard>
            <p style={cardLabel}>FORCES DOMINANTES</p>

            {[
              "Lecture structurelle",
              "Patience avant exécution",
              "Respect des zones HTF",
            ].map((item) => (
              <div key={item} style={listItem}>
                <span style={goldDot} />
                <p style={listText}>{item}</p>
              </div>
            ))}
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PremiumCard>
            <p style={cardLabel}>POINTS À CORRIGER</p>

            {[
              "Impulsivité après perte",
              "Entrée parfois prématurée",
              "Risque d’overtrading",
            ].map((item) => (
              <div key={item} style={listItem}>
                <span style={redDot} />
                <p style={listText}>{item}</p>
              </div>
            ))}
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Profil" />
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

const cardLabel = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "13px",
  letterSpacing: "2px",
  marginBottom: "14px",
};

const goldTitle = {
  color: "#D4B06A",
  fontSize: "34px",
  lineHeight: "40px",
  margin: "0 0 14px",
};

const text = {
  color: "rgba(255,255,255,0.58)",
  fontSize: "18px",
  lineHeight: "30px",
};

const listItem = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "16px",
};

const goldDot = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  background: "#D4B06A",
  boxShadow: "0 0 18px rgba(212,176,106,0.25)",
};

const redDot = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  background: "#B85C5C",
  boxShadow: "0 0 18px rgba(184,92,92,0.25)",
};

const listText = {
  margin: 0,
  color: "rgba(255,255,255,0.82)",
  fontSize: "18px",
};

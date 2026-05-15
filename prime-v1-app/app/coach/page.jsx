import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";

export default function CoachPage() {
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
          <p style={label}>COACH PRIME</p>

          <h1 style={title}>
            Ton cerveau
            <br />
            d’exécution.
          </h1>

          <p style={subtitle}>
            PRIME détecte tes patterns, transforme tes erreurs en prescriptions
            et t’aide à protéger ton capital émotionnel.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PremiumCard>
            <p style={cardLabel}>PATTERN DÉTECTÉ</p>
            <h2 style={goldTitle}>Impulsivité après perte</h2>
            <p style={text}>
              Tu as tendance à reprendre une position trop vite après un trade
              perdant. C’est une zone de risque comportemental.
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <PremiumCard>
            <p style={cardLabel}>PRESCRIPTION 7 JOURS</p>
            <h2 style={cardTitle}>Maximum 1 trade après une perte.</h2>
            <p style={text}>
              Objectif : casser la boucle émotionnelle avant qu’elle ne devienne
              une dérive.
            </p>
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PremiumCard>
            <p style={cardLabel}>ERREURS À SURVEILLER</p>

            {[
              "Revenge trade",
              "Entrée sans confirmation",
              "Stop déplacé",
              "Trade hors plan",
            ].map((item) => (
              <div key={item} style={listItem}>
                <span style={dot} />
                <p style={listText}>{item}</p>
              </div>
            ))}
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.65}>
          <PremiumCard>
            <p style={cardLabel}>INSIGHT PRIME</p>
            <h2 style={cardTitle}>Tu ne dois pas reprendre le contrôle par l’action.</h2>
            <p style={text}>
              Après une perte, ton meilleur trade est souvent l’absence de trade.
            </p>
          </PremiumCard>
        </FadeIn>
      </div>

      <BottomNav active="Coach" />
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

const cardTitle = {
  color: "white",
  fontSize: "26px",
  lineHeight: "36px",
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

const dot = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  background: "#D4B06A",
  boxShadow: "0 0 18px rgba(212,176,106,0.25)",
};

const listText = {
  margin: 0,
  color: "rgba(255,255,255,0.82)",
  fontSize: "18px",
};

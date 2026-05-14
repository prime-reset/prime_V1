import Link from "next/link";
import BottomNav from "./components/BottomNav";

export default function Home() {
  return (
    <main
      style={{
        backgroundColor: "#050505",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        padding: "28px",
        paddingBottom: "150px",
      }}
    >
      <div
        style={{
          maxWidth: "430px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#C8A96B",
            letterSpacing: "6px",
            fontSize: "14px",
            marginBottom: "40px",
          }}
        >
          PRIME.
        </p>

        <h1
          style={{
            fontSize: "72px",
            lineHeight: "72px",
            marginBottom: "30px",
            fontWeight: "700",
          }}
        >
          Trading
          <br />
          Discipline OS
        </h1>

        <p
          style={{
            color: "#8D8D8D",
            fontSize: "18px",
            lineHeight: "36px",
            marginBottom: "40px",
          }}
        >
          PRIME transforme ton comportement de trader en système d’exécution
          discipliné.
        </p>

        <Link href="/session" style={{ textDecoration: "none" }}>
          <button style={primaryButton}>Commencer ma session</button>
        </Link>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "16px",
            marginBottom: "34px",
          }}
        >
          <Link href="/stats" style={{ textDecoration: "none" }}>
            <button style={secondaryButton}>Voir mes stats</button>
          </Link>

          <Link href="/reset" style={{ textDecoration: "none" }}>
            <button style={secondaryButton}>Mode Reset</button>
          </Link>

          <Link href="/onboarding" style={{ textDecoration: "none" }}>
            <button style={secondaryButton}>Créer mon profil PRIME</button>
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={miniCard}>
            <p style={label}>ÉTAT</p>
            <h2 style={goldTitle}>Focus</h2>
          </div>

          <div style={miniCard}>
            <p style={label}>RISQUE</p>
            <h2 style={goldTitle}>Stable</h2>
          </div>
        </div>

        <div style={mainCard}>
          <p style={label}>SCORE DISCIPLINE</p>

          <h2
            style={{
              fontSize: "82px",
              color: "#C8A96B",
              margin: 0,
              lineHeight: "90px",
            }}
          >
            92
          </h2>

          <p
            style={{
              color: "#A0A0A0",
              fontSize: "18px",
              marginTop: "16px",
              lineHeight: "34px",
            }}
          >
            Discipline excellente aujourd’hui.
          </p>
        </div>

        <div style={mainCard}>
          <p style={label}>PRESCRIPTION ACTIVE</p>

          <h2
            style={{
              fontSize: "28px",
              lineHeight: "38px",
              color: "white",
              marginBottom: "14px",
            }}
          >
            Maximum 1 trade après une perte.
          </h2>

          <p
            style={{
              color: "#A0A0A0",
              fontSize: "18px",
              lineHeight: "30px",
            }}
          >
            Objectif : protéger ton capital émotionnel avant de protéger ton
            PnL.
          </p>
        </div>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

const primaryButton = {
  width: "100%",
  background: "#C8A96B",
  color: "#000",
  border: "none",
  padding: "22px",
  borderRadius: "24px",
  fontWeight: "700",
  fontSize: "18px",
  cursor: "pointer",
  boxShadow: "0 0 40px rgba(200,169,107,0.18)",
};

const secondaryButton = {
  width: "100%",
  background: "#111",
  color: "white",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "18px",
  padding: "18px",
  fontSize: "16px",
  cursor: "pointer",
};

const miniCard = {
  background: "#0E0E0E",
  padding: "24px",
  borderRadius: "28px",
  border: "1px solid rgba(255,255,255,0.04)",
};

const mainCard = {
  background: "linear-gradient(180deg,#111111 0%,#090909 100%)",
  borderRadius: "32px",
  padding: "30px",
  marginBottom: "24px",
  border: "1px solid rgba(255,255,255,0.05)",
};

const label = {
  color: "#666",
  fontSize: "13px",
  marginBottom: "14px",
  letterSpacing: "1px",
};

const goldTitle = {
  color: "#C8A96B",
  margin: 0,
  fontSize: "24px",
};

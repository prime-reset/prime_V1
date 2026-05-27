"use client";

import BottomNav from "../components/BottomNav";

export default function CoachPage() {
  return (
    <main style={main}>
      <div style={container}>
        <p style={label}>COACH PRIME</p>

        <h1 style={title}>
          Ton cerveau
          <br />
          d’exécution.
        </h1>

        <section style={card}>
          <p style={cardLabel}>ANALYSE COACH</p>
          <h2 style={goldTitle}>Coach actif</h2>
          <p style={text}>
            PRIME analyse ton comportement, ton état mental et tes erreurs
            dominantes pour te donner une prescription claire.
          </p>
        </section>

        <section style={card}>
          <p style={cardLabel}>PRESCRIPTION ACTIVE</p>
          <h2 style={cardTitle}>Respecte ton plan avant ton envie.</h2>
          <p style={text}>
            Pendant ta prochaine session, ton objectif n’est pas de gagner plus.
            Ton objectif est d’exécuter proprement.
          </p>
        </section>
      </div>

      <BottomNav active="Coach" />
    </main>
  );
}

const main = {
  minHeight: "100vh",
  background: "#000",
  color: "white",
  padding: "32px",
  paddingBottom: "140px",
  fontFamily: "Arial, sans-serif",
};

const container = {
  maxWidth: "430px",
  margin: "0 auto",
};

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
  marginBottom: "34px",
  letterSpacing: "-2px",
};

const card = {
  borderRadius: "28px",
  padding: "24px",
  marginBottom: "18px",
  background: "rgba(10,10,10,0.86)",
  border: "1px solid rgba(212,176,106,0.22)",
};

const cardLabel = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "13px",
  letterSpacing: "2px",
  marginBottom: "14px",
};

const goldTitle = {
  color: "#D4B06A",
  fontSize: "32px",
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
  color: "rgba(255,255,255,0.68)",
  fontSize: "18px",
  lineHeight: "30px",
};

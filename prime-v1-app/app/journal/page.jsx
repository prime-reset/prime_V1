"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import FadeIn from "../components/FadeIn";
import PremiumCard from "../components/PremiumCard";

export default function JournalPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const savedSessions =
      JSON.parse(localStorage.getItem("primeSessions")) || [];

    setSessions(savedSessions);
  }, []);

  return (
    <main style={main}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>
        <FadeIn delay={0}>
          <p style={label}>JOURNAL PRIME</p>

          <h1 style={title}>
            Ton évolution
            <br />
            comportementale.
          </h1>

          <p style={subtitle}>
            Chaque session sauvegardée devient une trace de ton comportement, de
            ta discipline et de ton évolution.
          </p>
        </FadeIn>

        {sessions.length === 0 && (
          <FadeIn delay={0.2}>
            <PremiumCard>
              <p style={cardLabel}>AUCUNE SESSION</p>

              <h2 style={cardTitle}>Ton journal est encore vide.</h2>

              <p style={text}>
                Va dans Session, coche ta checklist, puis sauvegarde ta première
                session PRIME.
              </p>
            </PremiumCard>
          </FadeIn>
        )}

        {sessions.map((session, index) => (
          <FadeIn key={index} delay={0.2 + index * 0.12}>
            <PremiumCard>
              <div style={topLine}>
                <p style={cardLabel}>{session.date}</p>

                <p style={score}>{session.score}/100</p>
              </div>

              <h2 style={cardTitle}>{session.status}</h2>

              <p style={text}>
                Profil : <strong>{session.profile}</strong>
              </p>

              <p style={text}>
                Risque surveillé : <strong>{session.risk}</strong>
              </p>

              <p style={smallLabel}>ÉLÉMENTS VALIDÉS</p>

              {session.checkedItems.map((item) => (
                <div key={item} style={listItem}>
                  <span style={dot} />
                  <p style={listText}>{item}</p>
                </div>
              ))}
            </PremiumCard>
          </FadeIn>
        ))}
      </div>

      <BottomNav active="Journal" />
    </main>
  );
}

const main = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #0A0A0A 55%, #050505 100%)",
  color: "white",
  padding: "32px",
  paddingBottom: "140px",
  fontFamily: "Arial, sans-serif",
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
  marginBottom: "24px",
  letterSpacing: "-2px",
};

const subtitle = {
  color: "rgba(255,255,255,0.64)",
  fontSize: "19px",
  lineHeight: "1.6",
  marginBottom: "34px",
};

const topLine = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
};

const cardLabel = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "13px",
  letterSpacing: "2px",
  margin: 0,
};

const smallLabel = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "12px",
  letterSpacing: "2px",
  marginTop: "24px",
  marginBottom: "14px",
};

const score = {
  color: "#D4B06A",
  fontWeight: "700",
  margin: 0,
};

const cardTitle = {
  color: "white",
  fontSize: "30px",
  lineHeight: "38px",
  margin: "0 0 16px",
};

const text = {
  color: "rgba(255,255,255,0.62)",
  fontSize: "18px",
  lineHeight: "30px",
  margin: "0 0 10px",
};

const listItem = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "14px",
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
  fontSize: "17px",
  lineHeight: "26px",
};

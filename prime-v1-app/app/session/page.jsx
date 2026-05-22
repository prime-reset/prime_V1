"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SessionPage() {
  const [discipline, setDiscipline] = useState(false);
  const [mentalState, setMentalState] = useState("");
  const [checked, setChecked] = useState({});
  const [disciplineScore, setDisciplineScore] = useState(0);

  const checklist = [
    "J’ai identifié la tendance HTF",
    "J’ai repéré les zones de liquidité",
    "J’ai défini mon scénario principal",
    "J’ai défini mon invalidation",
    "Je connais mon risque max",
    "Je ne trade pas par impatience",
  ];

  const activateDiscipline = async () => {
    setDiscipline(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Utilisateur non connecté");
      return;
    }

    const { error } = await supabase.from("sessions").insert([
      {
        user_id: user.id,
        discipline_active: true,
        discipline_score: 0,
        streak_gain: 1,
        xp_gain: 40,
        status: "active",
      },
    ]);

    if (error) {
      alert("Erreur création session : " + error.message);
    }
  };

  const handleMentalState = async (state) => {
    setMentalState(state);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("sessions")
      .update({ mental_state: state })
      .eq("user_id", user.id)
      .eq("status", "active");
  };

  const toggleCheck = async (item) => {
    const updated = {
      ...checked,
      [item]: !checked[item],
    };

    setChecked(updated);

    const checkedCount = Object.values(updated).filter(Boolean).length;
    const score = Math.round((checkedCount / checklist.length) * 100);

    setDisciplineScore(score);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("sessions")
      .update({ discipline_score: score })
      .eq("user_id", user.id)
      .eq("status", "active");
  };

  return (
    <main style={page}>
      <div style={container}>
        <p style={eyebrow}>PRIME SESSION</p>

        <h1 style={heading}>
          Session
          <br />
          Trading
        </h1>

        <section style={card}>
          <h2 style={title}>Discipline</h2>
          <p style={text}>
            Active ton mode discipline avant de commencer ta session de trading.
          </p>

          <button
            onClick={activateDiscipline}
            style={{
              ...button,
              background: discipline ? "#123d22" : "#D4B06A",
              color: discipline ? "#7DFFA1" : "#000",
            }}
          >
            {discipline ? "🟢 Discipline activée" : "Activer ma discipline"}
          </button>
        </section>

        <section style={card}>
          <h2 style={title}>État mental</h2>
          <p style={text}>Dans quel état tu arrives sur les marchés ?</p>

          {["Calme", "Focus", "Stressée", "Impatiente", "Fatiguée"].map(
            (state) => (
              <button
                key={state}
                onClick={() => handleMentalState(state)}
                style={{
                  ...pill,
                  background:
                    mentalState === state
                      ? "#D4B06A"
                      : "rgba(255,255,255,0.06)",
                  color: mentalState === state ? "#000" : "#fff",
                }}
              >
                {state}
              </button>
            )
          )}
        </section>

        <section style={card}>
          <h2 style={title}>Discipline Score</h2>

          <p
            style={{
              fontSize: "54px",
              fontWeight: "900",
              color: "#D4B06A",
              margin: "10px 0",
            }}
          >
            {disciplineScore}%
          </p>

          <p style={text}>Ton score évolue selon le respect de ton process.</p>
        </section>

        <section style={card}>
          <h2 style={title}>Checklist pré-trade</h2>
          <p style={text}>Tu ne cherches pas un trade. Tu valides un plan.</p>

          {checklist.map((item) => (
            <div key={item} onClick={() => toggleCheck(item)} style={checkItem}>
              <span>{checked[item] ? "✅" : "⬜"}</span>
              <span>{item}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background: "#000",
  color: "white",
  padding: "42px 20px 120px",
};

const container = {
  maxWidth: "680px",
  margin: "0 auto",
};

const eyebrow = {
  color: "#D4B06A",
  letterSpacing: "5px",
  fontSize: "14px",
};

const heading = {
  fontSize: "64px",
  lineHeight: "0.95",
  margin: "20px 0 36px",
  fontWeight: "800",
};

const card = {
  background: "rgba(20,20,20,0.95)",
  border: "1px solid rgba(212,176,106,0.18)",
  borderRadius: "32px",
  padding: "28px",
  marginBottom: "24px",
};

const title = {
  color: "#D4B06A",
  fontSize: "22px",
  marginBottom: "14px",
};

const text = {
  color: "#A5A5A5",
  fontSize: "18px",
  lineHeight: "1.6",
  marginBottom: "22px",
};

const button = {
  width: "100%",
  border: "none",
  borderRadius: "18px",
  padding: "18px",
  fontSize: "16px",
  fontWeight: "800",
  cursor: "pointer",
};

const pill = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "999px",
  padding: "12px 16px",
  margin: "6px",
  fontWeight: "700",
  cursor: "pointer",
};

const checkItem = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  padding: "16px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer",
};

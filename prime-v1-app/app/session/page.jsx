"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SessionPage() {
  const [discipline, setDiscipline] = useState(false);
  const [mentalState, setMentalState] = useState("");
  const [checked, setChecked] = useState({});

  const checklist = [
    "J’ai identifié la tendance HTF",
    "J’ai repéré les zones de liquidité",
    "J’ai défini mon scénario principal",
    "J’ai défini mon invalidation",
    "Je connais mon risque max",
    "Je ne trade pas par impatience",
  ];

  // ACTIVATION DISCIPLINE + CREATION SESSION
  const activateDiscipline = async () => {
    setDiscipline(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("sessions").insert([
      {
        user_id: user.id,
        discipline_active: true,
        discipline_score: 100,
        streak_gain: 1,
        xp_gain: 40,
        status: "active",
      },
    ]);
  };

  // ETAT MENTAL
  const handleMentalState = async (state) => {
    setMentalState(state);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("sessions")
      .update({
        mental_state: state,
      })
      .eq("user_id", user.id)
      .eq("status", "active");
  };

  // CHECKLIST
  const toggleCheck = (item) => {
    setChecked((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "white",
        padding: "42px 20px 120px",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <p
          style={{
            color: "#D4B06A",
            letterSpacing: "5px",
            fontSize: "14px",
          }}
        >
          PRIME SESSION
        </p>

        <h1
          style={{
            fontSize: "64px",
            lineHeight: "0.95",
            margin: "20px 0 36px",
            fontWeight: "800",
          }}
        >
          Session
          <br />
          Trading
        </h1>

        {/* DISCIPLINE */}
        <section style={card}>
          <h2 style={title}>Discipline</h2>

          <p style={text}>
            Active ton mode discipline avant de commencer ta
            session de trading.
          </p>

          <button
            onClick={activateDiscipline}
            style={{
              ...button,
              background: discipline ? "#123d22" : "#D4B06A",
              color: discipline ? "#7DFFA1" : "#000",
            }}
          >
            {discipline
              ? "🟢 Discipline activée"
              : "Activer ma discipline"}
          </button>
        </section>

        {/* ETAT MENTAL */}
        <section style={card}>
          <h2 style={title}>État mental</h2>

          <p style={text}>
            Dans quel état tu arrives sur les marchés ?
          </p>

          <div>
            {[
              "Calme",
              "Focus",
              "Stressée",
              "Impatiente",
              "Fatiguée",
            ].map((state) => (
              <button
                key={state}
                onClick={() => handleMentalState(state)}
                style={{
                  ...pill,
                  background:
                    mentalState === state
                      ? "#D4B06A"
                      : "rgba(255,255,255,0.06)",
                  color:
                    mentalState === state
                      ? "#000"
                      : "#fff",
                }}
              >
                {state}
              </button>
            ))}
          </div>
        </section>

        {/* CHECKLIST */}
        <section style={card}>
          <h2 style={title}>Checklist pré-trade</h2>

          <p style={text}>
            Tu ne cherches pas un trade. Tu valides un plan.
          </p>

          {checklist.map((item) => (
            <div
              key={item}
              onClick={() => toggleCheck(item)}
              style={checkItem}
            >
              <span>
                {checked[item] ? "✅" : "⬜"}
              </span>

              <span>{item}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

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

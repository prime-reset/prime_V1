"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Play, Lock, CheckCircle2 } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../../lib/supabase";

const fallbackChecklist = [
  {
    id: "fallback-1",
    question: "Mon entrée respecte-t-elle réellement mon setup principal ?",
    category: "execution",
    weight: 3,
    checked: false,
  },
  {
    id: "fallback-2",
    question: "Suis-je en train de trader pour récupérer une perte ?",
    category: "psychology",
    weight: 5,
    checked: false,
  },
  {
    id: "fallback-3",
    question: "Ai-je identifié la liquidité, le contexte et l’invalidation ?",
    category: "context",
    weight: 4,
    checked: false,
  },
  {
    id: "fallback-4",
    question: "Est-ce que ce trade respecte ma prescription active ?",
    category: "discipline",
    weight: 5,
    checked: false,
  },
];

export default function SessionPage() {
  const [disciplineActive, setDisciplineActive] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    async function loadUserSession() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setDisciplineActive(false);
        setChecklistItems(fallbackChecklist);
        return;
      }

      const saved = localStorage.getItem(`prime_discipline_active_${user.id}`);
      setDisciplineActive(saved === "true");
    }

    async function loadChecklist() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setChecklistItems(fallbackChecklist);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_type, strategy_type")
        .eq("id", user.id)
        .single();

      const profileType = profile?.profile_type || "disciplined";
      const strategyType = profile?.strategy_type || "smc";

      const { data: templates, error } = await supabase
        .from("checklist_templates")
        .select("*")
        .eq("profile_type", profileType)
        .eq("strategy_type", strategyType)
        .eq("is_active", true);

      if (error || !templates || templates.length === 0) {
        setChecklistItems(fallbackChecklist);
        return;
      }

      setChecklistItems(
        templates.map((item) => ({
          ...item,
          checked: false,
        }))
      );
    }

    loadUserSession();
    loadChecklist();
  }, []);

  function toggleChecklist(index) {
    setChecklistItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  }

  const allChecked =
    checklistItems.length > 0 && checklistItems.every((item) => item.checked);

  async function activateDiscipline() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      alert("Tu dois être connectée.");
      return;
    }

    localStorage.setItem(`prime_discipline_active_${user.id}`, "true");
    localStorage.setItem(
      `prime_session_started_at_${user.id}`,
      new Date().toISOString()
    );

    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: user.id,
          discipline_active: true,
          discipline_score: 100,
          xp_gain: 40,
          streak_gain: 1,
          status: "active",
        },
      ])
      .select();

    console.log("SESSION INSERT DATA:", data);
    console.log("SESSION INSERT ERROR:", error);

    setDisciplineActive(true);
  }

  return (
    <main className="session-page">
      <div className="session-card">
        <div className="session-header">
          <div className="shield-box">
            <ShieldCheck size={28} />
          </div>

          <div>
            <p className="subtitle">CHECKLIST PRÉ-TRADE</p>
            <h1>Verrou de discipline</h1>
          </div>
        </div>

        <div className="checklist">
          {checklistItems.map((item, index) => (
            <button
              key={item.id || index}
              className={`check-item ${item.checked ? "done" : ""}`}
              onClick={() => toggleChecklist(index)}
              type="button"
            >
              <CheckCircle2
                size={22}
                color={item.checked ? "#d6b25f" : "rgba(255,255,255,0.28)"}
              />

              <div>
                <h3>{item.question}</h3>
                <p>
                  {item.category} • poids {item.weight}
                </p>
              </div>
            </button>
          ))}
        </div>

        {!disciplineActive ? (
          <button
            className={`discipline-btn ${!allChecked ? "disabled" : ""}`}
            disabled={!allChecked}
            onClick={activateDiscipline}
            type="button"
          >
            <Play size={18} />
            {allChecked ? "ACTIVER MA DISCIPLINE" : "COMPLÈTE TA CHECKLIST"}
          </button>
        ) : (
          <button className="discipline-btn active" type="button">
            <Lock size={18} />
            DISCIPLINE ACTIVÉE
          </button>
        )}

        {disciplineActive && (
          <div className="confirmation">
            <ShieldCheck size={18} color="#d6b25f" />
            <p>
              Session lancée. Chaque action alimentera désormais ton score
              discipline, ton streak et tes XP.
            </p>
          </div>
        )}
      </div>

      <BottomNav />

      <style jsx>{`
        .session-page {
          min-height: 100vh;
          background: #000;
          color: white;
          padding: 28px 18px 120px;
          font-family: Inter, Arial, sans-serif;
        }

        .session-card {
          border-radius: 32px;
          padding: 22px;
          background: linear-gradient(
            180deg,
            rgba(214, 178, 95, 0.12),
            rgba(0, 0, 0, 0.82)
          );
          border: 1px solid rgba(214, 178, 95, 0.22);
        }

        .session-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
        }

        .shield-box {
          width: 72px;
          height: 72px;
          border-radius: 22px;
          background: rgba(214, 178, 95, 0.1);
          border: 1px solid rgba(214, 178, 95, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d6b25f;
        }

        .subtitle {
          color: #d6b25f;
          letter-spacing: 2px;
          font-size: 13px;
          margin: 0 0 8px;
        }

        h1 {
          font-size: 42px;
          line-height: 1;
          margin: 0;
        }

        .checklist {
          display: grid;
          gap: 12px;
          margin-top: 22px;
        }

        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          border-radius: 22px;
          padding: 18px;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .check-item.done {
          border-color: rgba(214, 178, 95, 0.42);
          background: rgba(214, 178, 95, 0.08);
        }

        .check-item h3 {
          font-size: 18px;
          margin: 0 0 6px;
        }

        .check-item p {
          opacity: 0.65;
          font-size: 14px;
          margin: 0;
        }

        .discipline-btn {
          width: 100%;
          height: 68px;
          border-radius: 24px;
          border: none;
          margin-top: 24px;
          background: linear-gradient(90deg, #b88a32, #f5e3a1);
          color: black;
          font-weight: 800;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
        }

        .discipline-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .discipline-btn.active {
          background: black;
          border: 1px solid rgba(214, 178, 95, 0.24);
          color: #d6b25f;
        }

        .confirmation {
          margin-top: 18px;
          border-radius: 20px;
          padding: 18px;
          background: rgba(214, 178, 95, 0.12);
          border: 1px solid rgba(214, 178, 95, 0.22);
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .confirmation p {
          opacity: 0.82;
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </main>
  );
}

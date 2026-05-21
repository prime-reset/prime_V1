"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ShieldCheck,
  Play,
  Lock,
  CheckCircle2,
} from "lucide-react";

import BottomNav from "../components/BottomNav";
import { supabase } from "../../lib/supabase";

export default function SessionPage() {
  const [disciplineActive, setDisciplineActive] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    async function loadUserSession() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setDisciplineActive(false);
        return;
      }

      const saved = localStorage.getItem(
        `prime_discipline_active_${user.id}`
      );

      setDisciplineActive(saved === "true");
    }

    async function loadChecklist() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_type, strategy_type")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const { data: templates } = await supabase
        .from("checklist_templates")
        .select("*")
        .eq("profile_type", profile.profile_type)
        .eq("strategy_type", profile.strategy_type)
        .eq("is_active", true);

      if (templates) {
        setChecklistItems(
          templates.map((item) => ({
            ...item,
            checked: false,
          }))
        );
      }
    }

    loadUserSession();
    loadChecklist();
  }, []);

  function toggleChecklist(index) {
    setChecklistItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              checked: !item.checked,
            }
          : item
      )
    );
  }

  const allChecked =
    checklistItems.length > 0 &&
    checklistItems.every((item) => item.checked);

  async function activateDiscipline() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      alert("Tu dois être connecté.");
      return;
    }

    localStorage.setItem(
      `prime_discipline_active_${user.id}`,
      "true"
    );

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
            <p className="subtitle">
              CHECKLIST PRÉ-TRADE
            </p>

            <h1>Verrou de discipline</h1>
          </div>
        </div>

        <div className="checklist">
          {checklistItems.map((item, index) => (
            <button
              key={index}
              className={`check-item ${
                item.checked ? "done" : ""
              }`}
              onClick={() => toggleChecklist(index)}
            >
              <CheckCircle2
                size={22}
                color={
                  item.checked
                    ? "#d6b25f"
                    : "rgba(255,255,255,0.28)"
                }
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
            className={`discipline-btn ${
              !allChecked ? "disabled" : ""
            }`}
            disabled={!allChecked}
            onClick={activateDiscipline}
          >
            <Play size={18} />

            {allChecked
              ? "ACTIVER MA DISCIPLINE"
              : "COMPLETE TA CHECKLIST"}
          </button>
        ) : (
          <button className="discipline-btn active">
            <Lock size={18} />
            DISCIPLINE ACTIVÉE
          </button>
        )}

        {disciplineActive && (
          <div className="confirmation">
            <ShieldCheck
              size={18}
              color="#d6b25f"
            />

            <p>
              Session lancée. Chaque action alimentera
              désormais ton score discipline, ton streak
              et tes XP.
            </p>
          </div>
        )}
      </div>

      <BottomNav />

      <style jsx>{`
        .session-page {
          min-height: 100vh;
          background: black;
          color: white;
          padding: 28px 18px 120px;
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
        }

        h1 {
          font-size: 42px;
          line-height: 1;
          margin-top: 4px;
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
        }

        .check-item.done {
          border-color: rgba(214, 178, 95, 0.42);
          background: rgba(214, 178, 95, 0.08);
        }

        .check-item h3 {
          font-size: 18px;
          margin-bottom: 6px;
        }

        .check-item p {
          opacity: 0.65;
          font-size: 14px;
        }

        .discipline-btn {
          width: 100%;
          height: 68px;
          border-radius: 24px;
          border: none;

          margin-top: 24px;

          background: linear-gradient(
            90deg,
            #b88a32,
            #f5e3a1
          );

          color: black;
          font-weight: 700;
          font-size: 18px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .discipline-btn.disabled {
          opacity: 0.4;
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
        }
      `}</style>
    </main>
  );
}

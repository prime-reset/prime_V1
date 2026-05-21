"use client";

import { useEffect, useState } from "react";

import {
  Brain,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Activity,
} from "lucide-react";

import BottomNav from "../components/BottomNav";
import { supabase } from "../../lib/supabase";

export default function StatsPage() {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    async function loadStats() {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user =
        sessionData?.session?.user;

      if (!user) return;

      const { data: profileData } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

      setProfile(profileData);

      const { data: sessionsData } =
        await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(10);

      setSessions(
        sessionsData || []
      );

      const { data: errorsData } =
        await supabase
          .from("trade_errors")
          .select("*")
          .eq("user_id", user.id);

      setErrors(errorsData || []);
    }

    loadStats();
  }, []);

  const averageDiscipline =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (sum, session) =>
              sum +
              (session.discipline_score ||
                0),
            0
          ) / sessions.length
        )
      : 0;

  const dominantErrors = {};

  errors.forEach((error) => {
    dominantErrors[
      error.category
    ] =
      (dominantErrors[
        error.category
      ] || 0) + 1;
  });

  const sortedErrors =
    Object.entries(
      dominantErrors
    ).sort(
      (a, b) => b[1] - a[1]
    );

  return (
    <main className="stats-page">
      <div className="stats-container">
        <div className="hero">
          <p className="subtitle">
            PRIME ANALYTICS
          </p>

          <h1>
            Tableau
            <span>de bord</span>
          </h1>
        </div>

        <div className="grid">
          <div className="card">
            <div className="card-top">
              <Brain size={24} />
              <p>DISCIPLINE</p>
            </div>

            <h2>
              {averageDiscipline}%
            </h2>

            <span>
              Score moyen
            </span>
          </div>

          <div className="card">
            <div className="card-top">
              <Flame size={24} />
              <p>STREAK</p>
            </div>

            <h2>
              {profile?.streak || 0}
            </h2>

            <span>
              jours consécutifs
            </span>
          </div>

          <div className="card">
            <div className="card-top">
              <ShieldCheck size={24} />
              <p>XP</p>
            </div>

            <h2>
              {profile?.xp || 0}
            </h2>

            <span>
              progression PRIME
            </span>
          </div>

          <div className="card">
            <div className="card-top">
              <Activity size={24} />
              <p>SESSIONS</p>
            </div>

            <h2>
              {sessions.length}
            </h2>

            <span>
              sessions récentes
            </span>
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            <AlertTriangle size={18} />

            <h3>
              Erreurs dominantes
            </h3>
          </div>

          {sortedErrors.length === 0 ? (
            <p className="empty">
              Aucune erreur détectée.
            </p>
          ) : (
            sortedErrors.map(
              ([category, count]) => (
                <div
                  key={category}
                  className="error-item"
                >
                  <span>
                    {category}
                  </span>

                  <strong>
                    {count}x
                  </strong>
                </div>
              )
            )
          )}
        </div>

        <div className="section">
          <div className="section-title">
            <Brain size={18} />

            <h3>
              États mentaux récents
            </h3>
          </div>

          <div className="mental-list">
            {sessions
              .slice(0, 5)
              .map((session) => (
                <div
                  key={session.id}
                  className="mental-item"
                >
                  <span>
                    {
                      session.mental_state
                    }
                  </span>

                  <small>
                    {
                      session.discipline_score
                    }
                    %
                  </small>
                </div>
              ))}
          </div>
        </div>
      </div>

      <BottomNav />

      <style jsx>{`
        .stats-page {
          min-height: 100vh;
          background: black;
          color: white;
          padding: 28px 18px 120px;
          font-family: Inter,
            Arial, sans-serif;
        }

        .stats-container {
          max-width: 520px;
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 28px;
        }

        .subtitle {
          color: #d6b25f;
          letter-spacing: 3px;
          font-size: 13px;
          margin-bottom: 8px;
        }

        h1 {
          font-size: 52px;
          line-height: 0.95;
          margin: 0;
        }

        h1 span {
          display: block;
          color: #d6b25f;
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);

          gap: 14px;
        }

        .card {
          border-radius: 26px;
          padding: 22px;

          background: linear-gradient(
            180deg,
            rgba(
                214,
                178,
                95,
                0.12
              )
              0%,
            rgba(
                255,
                255,
                255,
                0.03
              )
              100%
          );

          border: 1px solid
            rgba(
              214,
              178,
              95,
              0.16
            );
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 10px;

          color: #d6b25f;
          margin-bottom: 18px;
        }

        .card-top p {
          margin: 0;
          font-size: 12px;
          letter-spacing: 2px;
        }

        .card h2 {
          margin: 0;
          font-size: 38px;
        }

        .card span {
          opacity: 0.65;
          font-size: 13px;
        }

        .section {
          margin-top: 30px;

          border-radius: 28px;
          padding: 22px;

          background: rgba(
            255,
            255,
            255,
            0.03
          );

          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.05
            );
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 20px;

          color: #d6b25f;
        }

        .section-title h3 {
          margin: 0;
          font-size: 18px;
        }

        .error-item,
        .mental-item {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 14px 0;

          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
        }

        .error-item:last-child,
        .mental-item:last-child {
          border-bottom: none;
        }

        .error-item span,
        .mental-item span {
          font-size: 15px;
        }

        .error-item strong {
          color: #d6b25f;
        }

        .mental-item small {
          color: #d6b25f;
        }

        .empty {
          opacity: 0.6;
        }
      `}</style>
    </main>
  );
}

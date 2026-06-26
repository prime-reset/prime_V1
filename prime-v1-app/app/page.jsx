"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  ChevronRight,
  Sparkles,
  Crown,
  BookOpen,
  User,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  BarChart3,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import BottomNav from "./components/BottomNav";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Trader");
  const [profile, setProfile] = useState("Trader en construction");
  const [averageScore, setAverageScore] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [activePrescription, setActivePrescription] = useState(null);
  const [risk, setRisk] = useState({
    level: "observation",
    label: "Sous observation",
    message: "PRIME collecte encore assez de données pour lire ton comportement.",
  });
  const [focus, setFocus] = useState("Respecter le process avant le résultat.");

  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("email", user.email)
      .maybeSingle();

    if (profileData?.display_name) {
      setDisplayName(profileData.display_name);
    }

    const { data: identityData } = await supabase
      .from("prime_identity_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (identityData) {
      setProfile(identityData.profile || "Trader en construction");
      setAverageScore(identityData.discipline_average || 0);
    }

    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "closed")
      .order("created_at", { ascending: false });

    if (sessionsData) {
      setSessions(sessionsData);
      setSessionsCount(sessionsData.length);

      const scores = sessionsData
        .map((s) => Number(s.discipline_score))
        .filter((score) => !Number.isNaN(score));

      if (!identityData && scores.length > 0) {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        setAverageScore(avg);
      }

      setRisk(getRiskFromSessions(sessionsData));
    }

    const { data: prescriptionData } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (prescriptionData) {
      setActivePrescription(prescriptionData);
    }

    setFocus(getFocusByProfile(identityData?.profile));
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <style>{`
          .loading-screen {
            min-height: 100vh;
            background: #000;
            color: #D4B06A;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, Arial, sans-serif;
            letter-spacing: 4px;
            text-transform: uppercase;
          }
        `}</style>
        Chargement PRIME...
      </main>
    );
  }

  const lastSession = sessions[0] || null;
  const weekDays = getCurrentWeekData(sessions);
  const weekPnl = weekDays.reduce((sum, day) => sum + day.pnl, 0);
  const weekPlanRate = getWeekPlanRate(weekDays);

  const prescriptionProgress = activePrescription
    ? (activePrescription.compliance_days || 0) +
      (activePrescription.missed_days || 0)
    : 0;

  const prescriptionDuration = activePrescription?.duration_days || 7;

  const prescriptionPercent = activePrescription
    ? Math.min(Math.round((prescriptionProgress / prescriptionDuration) * 100), 100)
    : 0;

  const chartData = getDisciplineChartData(sessions, averageScore);
  const structure = getBehaviorStructure(chartData);
  const scoreTrend = getScoreTrend(chartData);

  const primeMessage = getPrimeMessage({
    score: averageScore,
    risk,
    activePrescription,
    sessionsCount,
  });

  return (
    <main className="prime-home">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }

        .prime-home {
          min-height: 100vh;
          padding: 28px 16px 124px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(circle at 86% 4%, rgba(212,176,106,0.11), transparent 28%),
            radial-gradient(circle at 12% 22%, rgba(255,255,255,0.035), transparent 18%),
            linear-gradient(180deg, #020202 0%, #000 48%, #000 100%);
          overflow-x: hidden;
        }

        .page {
          max-width: 1024px;
          margin: 0 auto;
        }

        .hero-shell {
          position: relative;
          min-height: 560px;
          margin: -6px 0 22px;
          padding: 18px 10px 0;
          overflow: hidden;
          isolation: isolate;
        }

        .panther {
          position: absolute;
          top: 38px;
          right: -38px;
          width: 570px;
          height: auto;
          opacity: 0.42;
          filter: brightness(0.55) contrast(1.65) saturate(0.9);
          mix-blend-mode: screen;
          pointer-events: none;
          z-index: 0;
          transform: translateZ(0);

          -webkit-mask-image:
            radial-gradient(circle at 48% 43%, #000 0%, #000 32%, rgba(0,0,0,0.74) 48%, rgba(0,0,0,0.18) 68%, transparent 84%),
            linear-gradient(90deg, transparent 0%, #000 20%, #000 76%, transparent 100%);
          mask-image:
            radial-gradient(circle at 48% 43%, #000 0%, #000 32%, rgba(0,0,0,0.74) 48%, rgba(0,0,0,0.18) 68%, transparent 84%),
            linear-gradient(90deg, transparent 0%, #000 20%, #000 76%, transparent 100%);
        }

        .hero {
          position: relative;
          z-index: 1;
          animation: fadeUp .55s ease both;
        }

        .brand-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 22px;
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 8px;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .live-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border-radius: 999px;
          background: rgba(212,176,106,0.055);
          border: 1px solid rgba(212,176,106,0.32);
          color: #D4B06A;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 1.7px;
          text-transform: uppercase;
          box-shadow: inset 0 0 18px rgba(212,176,106,0.05);
          white-space: nowrap;
        }

        .bell {
          color: #D4B06A;
          filter: drop-shadow(0 0 10px rgba(212,176,106,0.24));
        }

        .pulse {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #D4B06A;
          box-shadow: 0 0 18px rgba(212,176,106,0.9);
          animation: pulse 1.8s infinite;
        }

        .title {
          margin: 0;
          max-width: 390px;
          font-size: 58px;
          line-height: 0.96;
          font-weight: 1000;
          letter-spacing: -2.8px;
        }

        .subtitle {
          max-width: 390px;
          margin-top: 20px;
          font-size: 17px;
          line-height: 1.55;
          color: rgba(255,255,255,0.68);
        }

        .prime-says {
          position: relative;
          z-index: 1;
          margin-top: 20px;
          padding: 20px;
          max-width: 410px;
          border-radius: 26px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015)),
            rgba(5,5,5,0.84);
          border: 1px solid rgba(212,176,106,0.24);
          box-shadow: 0 20px 55px rgba(0,0,0,0.62);
          backdrop-filter: blur(14px);
        }

        .prime-says-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #D4B06A;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2.7px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .prime-says-text {
          margin: 0;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 750;
          color: rgba(255,255,255,0.93);
        }

        .card,
        .score-panel,
        .chart-card,
        .mini-card,
        .action-card {
          background:
            linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.018)),
            rgba(8,8,8,0.9);
          border: 1px solid rgba(255,255,255,0.095);
          box-shadow: 0 22px 70px rgba(0,0,0,0.62);
          backdrop-filter: blur(18px);
        }


        .top-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .top-grid .score-panel,
        .top-grid .workspace-card {
          text-decoration: none;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          padding: 22px;
          border-radius: 30px;
          background:
            linear-gradient(145deg, rgba(212,176,106,0.12), rgba(255,255,255,0.02)),
            rgba(8,8,8,0.92);
          border: 1px solid rgba(212,176,106,0.30);
          box-shadow: 0 18px 50px rgba(0,0,0,0.58);
          cursor: pointer;
        }
        .score-panel {
          border-radius: 30px;
          padding: 21px;
          margin-bottom: 16px;
          animation: fadeUp .7s ease both;
        }

        .score-grid {
          display: grid;
          grid-template-columns: 1fr 122px;
          gap: 18px;
          align-items: center;
        }

        .label {
          color: rgba(212,176,106,0.92);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 3.4px;
          text-transform: uppercase;
          margin: 0 0 12px;
        }

        .score-line {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .score-big {
          font-size: 55px;
          font-weight: 1000;
          line-height: .92;
          letter-spacing: -2.8px;
        }

        .score-outof {
          padding-bottom: 7px;
          color: #D4B06A;
          font-size: 20px;
          font-weight: 950;
        }

        .trend-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 14px;
          padding: 7px 10px;
          border-radius: 10px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 12px;
          color: rgba(255,255,255,0.72);
        }

        .trend-up { color: #7DFFA1; }
        .trend-down { color: #ff6b6b; }

        .score-ring {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#D4B06A ${averageScore * 3.6}deg, rgba(255,255,255,0.075) 0deg);
          box-shadow: 0 0 42px rgba(212,176,106,0.15);
        }

        .score-ring-inner {
          width: 94px;
          height: 94px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 50% 35%, rgba(212,176,106,0.12), transparent 45%),
            #030303;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.08);
          color: #D4B06A;
        }

        .cta-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px;
          border-radius: 28px;
          margin-bottom: 16px;
          text-decoration: none;
          color: #000;
          background: linear-gradient(95deg, #9d742f, #d6b25f 50%, #fff2b8);
          border: none;
          box-shadow: 0 20px 50px rgba(212,176,106,0.18);
        }

        .cta-title {
          margin: 0;
          font-size: 19px;
          font-weight: 1000;
          letter-spacing: -0.4px;
        }

        .cta-subtitle {
          margin: 6px 0 0;
          color: rgba(0,0,0,0.62);
          font-size: 13px;
          font-weight: 850;
        }

        .workspace-card {
          text-decoration: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px;
          border-radius: 26px;
          margin-bottom: 16px;
          background:
            linear-gradient(145deg, rgba(212,176,106,0.10), rgba(255,255,255,0.02)),
            rgba(8,8,8,0.92);
          border: 1px solid rgba(212,176,106,0.24);
          box-shadow: 0 18px 50px rgba(0,0,0,0.58);
        }

        .workspace-checks {
          display: grid;
          gap: 8px;
          margin-top: 14px;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          font-weight: 750;
        }

        .workspace-checks span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .workspace-checks b {
          color: #D4B06A;
          font-size: 14px;
        }

        .workspace-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 15px;
          background: linear-gradient(95deg, #9d742f, #d6b25f 50%, #fff2b8);
          color: #000;
          font-size: 16px;
          font-weight: 1000;
          letter-spacing: -0.2px;
        }

        .workspace-title {
          margin: 0;
          color: #D4B06A;
          font-size: 11px;
          letter-spacing: 3px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .workspace-main {
          margin: 7px 0 0;
          font-size: 18px;
          font-weight: 950;
        }

        .workspace-sub {
          margin: 5px 0 0;
          color: rgba(255,255,255,0.58);
          font-size: 13px;
          line-height: 1.35;
        }

        .chart-card {
          border-radius: 30px;
          padding: 20px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 12px;
        }

        .chart-title {
          margin: 0;
          color: #D4B06A;
          font-size: 11px;
          letter-spacing: 3.4px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 10px;
          color: rgba(255,255,255,0.58);
          font-size: 12px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D4B06A;
          display: inline-block;
          margin-right: 6px;
        }

        .legend-line {
          display: inline-block;
          width: 15px;
          height: 1px;
          background: rgba(255,255,255,0.55);
          margin-right: 6px;
          vertical-align: middle;
        }

        .range-pill {
          padding: 8px 11px;
          border-radius: 11px;
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(212,176,106,0.18);
          background: rgba(0,0,0,0.24);
          font-size: 12px;
          white-space: nowrap;
        }

        .chart-wrap {
          position: relative;
          height: 250px;
          margin-top: 12px;
          border-radius: 18px;
          background:
            linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 100% 20%, 16.6% 100%;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }

        .chart-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .chart-score-badge {
          position: absolute;
          top: 8px;
          right: 0;
          color: #D4B06A;
          font-size: 25px;
          font-weight: 1000;
          text-shadow: 0 0 18px rgba(212,176,106,0.45);
        }

        .chart-score-badge small {
          font-size: 12px;
        }

        .structure-box {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 14px;
          padding: 13px;
          border-radius: 18px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .tv-badge {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          border: 1px solid rgba(212,176,106,0.24);
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 1000;
          background: rgba(0,0,0,0.35);
          flex-shrink: 0;
        }

        .structure-label {
          margin: 0 0 4px;
          color: #D4B06A;
          font-size: 11px;
          letter-spacing: 2.4px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .structure-title {
          margin: 0;
          font-size: 15px;
          font-weight: 950;
        }

        .structure-title span {
          color: #7DFFA1;
        }

        .structure-copy {
          margin: 5px 0 0;
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          line-height: 1.35;
        }

        .card {
          border-radius: 28px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .card-title {
          margin: 0;
          font-size: 26px;
          line-height: 1.08;
          font-weight: 1000;
          color: #D4B06A;
          letter-spacing: -0.8px;
        }

        .text {
          margin: 14px 0 0;
          color: rgba(255,255,255,0.68);
          font-size: 15px;
          line-height: 1.55;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .dashboard-grid .card {
          margin: 0;
          min-height: 185px;
        }

        .small-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }

        .mini-card {
          min-height: 104px;
          padding: 16px;
          border-radius: 22px;
        }

        .mini-label {
          margin-top: 12px;
          color: rgba(212,176,106,0.86);
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 2px;
          text-transform: uppercase;
          line-height: 1.25;
        }

        .mini-value {
          margin-top: 7px;
          font-size: 23px;
          font-weight: 1000;
          line-height: 1.05;
          letter-spacing: -0.5px;
        }

        .progress-track {
          margin-top: 18px;
          height: 10px;
          width: 100%;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #9d742f, #D4B06A, #fff2b8);
          transition: width .8s ease;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .action-card {
          min-height: 120px;
          padding: 17px;
          border-radius: 24px;
          color: white;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .action-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .action-icon { color: #D4B06A; }
        .arrow { color: rgba(255,255,255,0.34); }

        .action-label {
          color: rgba(212,176,106,0.82);
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 8px;
          font-weight: 950;
        }

        .action-title {
          margin: 0;
          font-size: 18px;
          line-height: 1.15;
          font-weight: 950;
        }

        .green { color: #7DFFA1; }
        .red { color: #ff6868; }
        .gold { color: #D4B06A; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }

        @media(max-width: 760px) {
          .prime-home { padding-left: 14px; padding-right: 14px; }
          .page { max-width: 480px; }
          .title { font-size: 40px; max-width: 250px; }
          .subtitle { max-width: 285px; font-size: 16px; }
          .panther { width: 350px; right: -125px; top: 64px; opacity: .36; }
          .hero-shell { min-height: 390px; }
          .prime-says { max-width: 300px; }
          .top-grid { grid-template-columns: 1fr; }
          .score-grid { grid-template-columns: 1fr; }
          .score-ring { justify-self: center; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .small-grid { grid-template-columns: 1fr; }
          .actions-grid { grid-template-columns: 1fr 1fr; }
          .chart-wrap { height: 232px; }
        }
      `}</style>

      <div className="page">
        <section className="hero-shell">
          <img className="panther" src="/prime-panther.png" alt="" aria-hidden="true" />

          <div className="hero">
            <div className="brand-row">
              <div className="brand">PRIME</div>

              <div className="hero-actions">
                <div className="live-pill">
                  <span className="pulse" />
                  Analyse live
                </div>
              </div>
            </div>

            <h1 className="title">Bonjour {displayName}</h1>

            <p className="subtitle">
              Ton cockpit est prêt. PRIME analyse ton état, ton risque et ton objectif du jour.
            </p>

            <section className="prime-says">
              <div className="prime-says-label">
                <Brain size={17} />
                PRIME parle
              </div>
              <p className="prime-says-text">{primeMessage}</p>
            </section>
          </div>
        </section>

        <section className="top-grid">
          <section className="score-panel">
            <div className="score-grid">
              <div>
                <p className="label">Discipline Score</p>

                <div className="score-line">
                  <div className="score-big">{averageScore}</div>
                  <div className="score-outof">/100</div>
                </div>

                <div className="trend-pill">
                  <span className={scoreTrend.value >= 0 ? "trend-up" : "trend-down"}>
                    {scoreTrend.value >= 0 ? "↗" : "↘"} {scoreTrend.value >= 0 ? "+" : ""}
                    {scoreTrend.value} pts
                  </span>
                  <span>{scoreTrend.label}</span>
                </div>
              </div>

              <div className="score-ring">
                <div className="score-ring-inner">
                  <TrendingUp size={32} />
                </div>
              </div>
            </div>
          </section>

          <a
            className="workspace-card"
            href="https://www.tradingview.com/chart/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
              <p className="workspace-title">Workspace</p>
              <p className="workspace-main">TradingView</p>
              <div className="workspace-checks">
                <span><b>✓</b> Checklist validée</span>
                <span><b>✓</b> Mental renseigné</span>
                <span><b>✓</b> Plan validé</span>
              </div>
            </div>
            <div className="workspace-button">
              <BarChart3 size={21} />
              Ouvrir TradingView
            </div>
          </a>
        </section>

        <Link href="/session" className="cta-card">
          <div>
            <p className="cta-title">Commencer ma session</p>
            <p className="cta-subtitle">Prépare, exécute, débriefe.</p>
          </div>
          <PlayCircle size={34} />
        </Link>

        <section className="chart-card">
          <div className="chart-header">
            <div>
              <p className="chart-title">Évolution discipline</p>
              <div className="chart-legend">
                <span><i className="legend-dot" />Score discipline</span>
                <span><i className="legend-line" />Moyenne</span>
              </div>
            </div>

            <div className="range-pill">7 dernières sessions</div>
          </div>

          <DisciplineTradingChart data={chartData} score={averageScore} />

          <div className="structure-box">
            <div className="tv-badge"><TrendingUp size={22} /></div>
            <div>
              <p className="structure-label">Structure comportementale</p>
              <p className="structure-title">
                <span>{structure.title}</span> {structure.icon}
              </p>
              <p className="structure-copy">{structure.message}</p>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <section className="card">
            <p className="label">Risque actuel</p>
            <h2 className="card-title">{getRiskIcon(risk.level)} {risk.label}</h2>
            <p className="text">{risk.message}</p>
          </section>

          <section className="card">
            <p className="label">Dernière session</p>
            <h2 className="card-title">
              Discipline : {lastSession?.discipline_score ?? 0}%
            </h2>

            <p className="text">
              Mental : <strong className="green">{lastSession?.mental_state || "Non renseigné"}</strong>
              <br />
              Erreur dominante : <strong className="green">{lastSession?.dominant_error || "Aucune"}</strong>
            </p>

            <p
              className={
                lastSession?.plan_respected === false ? "text red" : "text green"
              }
              style={{ fontWeight: 950 }}
            >
              {lastSession?.plan_respected === true
                ? "✓ Plan respecté"
                : lastSession?.plan_respected === false
                ? "✗ Hors plan"
                : "Plan non renseigné"}
            </p>
          </section>

          <section className="card">
            <p className="label">Prescription active</p>
            <h2 className="card-title">
              {activePrescription ? activePrescription.title : "Aucune prescription"}
            </h2>

            <p className="text">
              {activePrescription
                ? activePrescription.rule
                : "PRIME activera une prescription lorsqu’un vrai pattern comportemental sera détecté."}
            </p>

            {activePrescription && (
              <>
                <div className="progress-track">
                  <div
                    className="progress-bar"
                    style={{ width: `${prescriptionPercent}%` }}
                  />
                </div>

                <p className="text">
                  Progression : <strong className="gold">{prescriptionProgress} / {prescriptionDuration}</strong> jours
                </p>
              </>
            )}
          </section>

          <section className="card">
            <p className="label">Identité PRIME</p>
            <h2 className="card-title">{profile}</h2>

            <p className="text">
              Niveau : <strong className="gold">{getPrimeLevel(averageScore, sessionsCount)}</strong>
              <br />
              Sessions analysées : <strong className="gold">{sessionsCount}</strong>
              <br />
              Force dominante : <strong className="gold">{getProfileStrength(profile)}</strong>
              <br />
              À surveiller : <strong className="gold">{getProfileWeakness(profile)}</strong>
            </p>
          </section>
        </section>

        <section className="small-grid">
          <div className="mini-card">
            <TrendingUp size={25} color="#D4B06A" />
            <div className="mini-label">PnL semaine</div>
            <div
              className="mini-value"
              style={{
                color:
                  weekPnl > 0 ? "#7DFFA1" : weekPnl < 0 ? "#FF7D7D" : "#fff",
              }}
            >
              {weekPnl > 0 ? "+" : ""}
              {weekPnl}€
            </div>
          </div>

          <div className="mini-card">
            <CheckCircle size={25} color="#D4B06A" />
            <div className="mini-label">Plans respectés</div>
            <div className="mini-value">{weekPlanRate}%</div>
          </div>

          <div className="mini-card">
            <Sparkles size={25} color="#D4B06A" />
            <div className="mini-label">Sessions lues</div>
            <div className="mini-value">{sessionsCount}</div>
          </div>
        </section>

        <section className="actions-grid">
          <ActionButton
            href="/coach"
            icon={<Brain size={24} />}
            label="Analyse"
            title="Lire mon coach"
          />

          <ActionButton
            href="/journal"
            icon={<BookOpen size={24} />}
            label="Historique"
            title="Voir mon évolution"
          />

          <ActionButton
            href="/onboarding"
            icon={<Crown size={24} />}
            label="Identité"
            title="Mon profil PRIME"
          />

          <ActionButton
            href="/profile"
            icon={<User size={24} />}
            label="Compte"
            title="Mon espace"
          />
        </section>
      </div>

      <BottomNav active="Prime" />
    </main>
  );
}

function ActionButton({ href, icon, label, title }) {
  return (
    <Link href={href} className="action-card">
      <div className="action-top">
        <div className="action-icon">{icon}</div>
        <ChevronRight size={20} className="arrow" />
      </div>

      <div>
        <p className="action-label">{label}</p>
        <h3 className="action-title">{title}</h3>
      </div>
    </Link>
  );
}

function DisciplineTradingChart({ data, score }) {
  const width = 360;
  const height = 210;
  const padding = 26;
  const minY = 35;
  const maxY = 100;

  const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);

  const y = (value) => {
    const clamped = Math.max(minY, Math.min(maxY, value));
    return padding + ((maxY - clamped) / (maxY - minY)) * (height - padding * 2);
  };

  const x = (index) => padding + index * xStep;

  const maPoints = data
    .map((item, index) => `${x(index)},${y(item.ma)}`)
    .join(" ");

  return (
    <div className="chart-wrap">
      <div className="chart-score-badge">
        {score}<small>/100</small>
      </div>

      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[40, 50, 60, 70, 80, 90, 100].map((level) => (
          <g key={level}>
            <text x="0" y={y(level) + 4} fill="rgba(255,255,255,0.55)" fontSize="9">
              {level}
            </text>
            {level === 70 && (
              <line
                x1={padding}
                x2={width - padding}
                y1={y(level)}
                y2={y(level)}
                stroke="rgba(212,176,106,0.72)"
                strokeDasharray="2 5"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        ))}

        <polyline
          points={maPoints}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />

        {data.map((item, index) => {
          const cx = x(index);
          const candleWidth = 8;
          const openY = y(item.open);
          const closeY = y(item.close);
          const highY = y(item.high);
          const lowY = y(item.low);
          const bullish = item.close >= item.open;
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(closeY - openY), 4);

          return (
            <g key={item.label}>
              <line
                x1={cx}
                x2={cx}
                y1={highY}
                y2={lowY}
                stroke={bullish ? "#D4B06A" : "rgba(212,176,106,0.62)"}
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x={cx - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={bullish ? "#D4B06A" : "rgba(212,176,106,0.22)"}
                stroke="#D4B06A"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={cx}
                y={height - 5}
                fill="rgba(255,255,255,0.62)"
                fontSize="9"
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}

        {data.length > 0 && (
          <circle
            cx={x(data.length - 1)}
            cy={y(data[data.length - 1].close)}
            r="5"
            fill="#fff2b8"
            stroke="#D4B06A"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}

function getFocusByProfile(profile) {
  switch (profile) {
    case "Trader Impulsif":
      return "Ralentir avant d’agir.";
    case "Trader FOMO":
      return "Laisser passer ce qui n’est pas parfait.";
    case "Trader Désorganisé":
      return "Structurer ton plan avant l’exécution.";
    case "Trader Patient":
      return "Maintenir ton cadre sans excès de confiance.";
    case "Trader Agressif":
      return "Rendre ton invalidation non négociable.";
    default:
      return "Respecter le process avant le résultat.";
  }
}

function getPrimeMessage({ score, risk, activePrescription, sessionsCount }) {
  if (sessionsCount === 0) {
    return "Aujourd’hui, PRIME commence à construire ton identité de trader. La première donnée importante sera ton respect du process.";
  }

  if (risk.level === "high") {
    return "Aujourd’hui je vais être exigeant avec toi. Une dérive comportementale est détectée : ton objectif n’est pas de gagner plus, mais de reprendre le contrôle.";
  }

  if (activePrescription) {
    return "Ta priorité est claire : suivre ta prescription jusqu’au bout. Pas d’improvisation, pas de négociation avec ton plan.";
  }

  if (score >= 85) {
    return "Tu construis un comportement stable. Continue à privilégier la qualité d’exécution plutôt que la quantité d’opportunités.";
  }

  if (score >= 70) {
    return "Ta base est solide, mais PRIME voit encore une marge de progression. Aujourd’hui, cherche une exécution propre.";
  }

  return "Ton objectif du jour est simple : ralentir, suivre ton setup et éviter les décisions prises sous émotion.";
}

function getPrimeLevel(score, count) {
  if (count < 5) return "En construction";
  if (score >= 85) return "Consistant";
  if (score >= 70) return "Confirmé";
  if (score >= 55) return "Intermédiaire";
  return "À stabiliser";
}

function getProfileStrength(profile) {
  if (profile.includes("Patient")) return "Attente";
  if (profile.includes("Impulsif")) return "Énergie";
  if (profile.includes("FOMO")) return "Réactivité";
  if (profile.includes("Agressif")) return "Décision";
  if (profile.includes("Désorganisé")) return "Adaptabilité";
  return "Construction";
}

function getProfileWeakness(profile) {
  if (profile.includes("Patient")) return "Excès de confiance";
  if (profile.includes("Impulsif")) return "Entrées trop rapides";
  if (profile.includes("FOMO")) return "Peur de rater";
  if (profile.includes("Agressif")) return "Risque excessif";
  if (profile.includes("Désorganisé")) return "Manque de structure";
  return "Manque de données";
}

function getRiskIcon(level) {
  if (level === "low") return "🟢";
  if (level === "medium") return "🟠";
  if (level === "high") return "🔴";
  return "⚪";
}

function getRiskFromSessions(sessions) {
  const closedSessions = sessions
    .filter((s) => s.status === "closed")
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  const lastThree = closedSessions.slice(0, 3);
  const lastFive = closedSessions.slice(0, 5);

  const lowDiscipline =
    lastThree.length === 3 &&
    lastThree.every((s) => Number(s.discipline_score) < 65);

  if (lowDiscipline) {
    return {
      level: "high",
      label: "Risque élevé",
      message: "Tes trois dernières sessions montrent une discipline en baisse. PRIME recommande de réduire la taille et de viser une exécution parfaite.",
    };
  }

  const revengeCount = lastFive.filter(
    (s) => s.dominant_error === "Revenge trade"
  ).length;

  if (revengeCount >= 2) {
    return {
      level: "high",
      label: "Revenge détecté",
      message: "Deux signaux de revenge trading ont été détectés récemment. Après une perte, ton objectif est de t’arrêter avant de vouloir récupérer.",
    };
  }

  const overtradingCount = lastFive.filter(
    (s) => s.dominant_error === "Overtrading"
  ).length;

  if (overtradingCount >= 2) {
    return {
      level: "medium",
      label: "Overtrading",
      message: "PRIME détecte une tendance à multiplier les décisions. Aujourd’hui, limite-toi aux opportunités les plus propres.",
    };
  }

  const fomoCount = lastFive.filter(
    (s) => s.dominant_error === "Entrée FOMO"
  ).length;

  if (fomoCount >= 2) {
    return {
      level: "medium",
      label: "FOMO à surveiller",
      message: "Tu as récemment poursuivi des opportunités au lieu d’attendre ton setup. Ton edge est dans l’attente.",
    };
  }

  if (closedSessions.length >= 3) {
    return {
      level: "low",
      label: "Risque faible",
      message: "Aucune dérive majeure détectée sur tes dernières sessions. Continue à protéger ton cadre.",
    };
  }

  return {
    level: "observation",
    label: "Sous observation",
    message: "PRIME collecte encore assez de données pour établir ton risque comportemental.",
  };
}

function getDisciplineChartData(sessions, averageScore) {
  const recent = sessions
    .slice(0, 7)
    .reverse()
    .map((session) => Number(session.discipline_score || 0))
    .filter((score) => !Number.isNaN(score) && score > 0);

  const scores = recent.length > 0 ? recent : [52, 57, 63, 61, 70, 76, averageScore || 69];

  return scores.map((score, index) => {
    const previous = index === 0 ? Math.max(score - 5, 40) : scores[index - 1];
    const open = previous;
    const close = score;
    const high = Math.min(Math.max(open, close) + 5 + (index % 3), 100);
    const low = Math.max(Math.min(open, close) - 5 - (index % 2), 35);
    const slice = scores.slice(Math.max(0, index - 2), index + 1);
    const ma = Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);

    return {
      label: `S${index + 1}`,
      open,
      close,
      high,
      low,
      ma,
    };
  });
}

function getScoreTrend(data) {
  if (!data || data.length < 2) {
    return { value: 0, label: "depuis la dernière session" };
  }

  const last = data[data.length - 1].close;
  const previous = data[0].close;

  return {
    value: last - previous,
    label: "sur les 7 dernières sessions",
  };
}

function getBehaviorStructure(data) {
  if (!data || data.length < 4) {
    return {
      title: "En observation",
      icon: "◎",
      message: "PRIME collecte encore assez de sessions pour lire ta structure comportementale.",
    };
  }

  const closes = data.map((item) => item.close);
  const last = closes[closes.length - 1];
  const previous = closes[closes.length - 2];
  const before = closes[closes.length - 3];
  const start = closes[0];

  if (last > previous && previous >= before && last > start) {
    return {
      title: "Higher High",
      icon: "↗",
      message: "Tes dernières sessions montrent une amélioration de ton exécution.",
    };
  }

  if (last < previous && previous <= before) {
    return {
      title: "Lower Low",
      icon: "↘",
      message: "La qualité de ton exécution se dégrade. Reviens au setup et réduis les décisions impulsives.",
    };
  }

  if (Math.abs(last - previous) <= 4) {
    return {
      title: "Range",
      icon: "→",
      message: "Ta discipline est stable. Le prochain objectif est de sortir du range par le haut.",
    };
  }

  return {
    title: "Pullback sain",
    icon: "↗",
    message: "La structure reste constructive. Continue à protéger tes règles principales.",
  };
}

function getCurrentWeekData(sessions) {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const daySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.created_at);
      return sessionDate.toDateString() === date.toDateString();
    });

    const pnl = daySessions.reduce(
      (sum, session) => sum + Number(session.session_pnl || 0),
      0
    );

    const hasSession = daySessions.length > 0;

    const respectedCount = daySessions.filter(
      (session) => session.plan_respected === true
    ).length;

    const notRespectedCount = daySessions.filter(
      (session) => session.plan_respected === false
    ).length;

    return {
      label,
      pnl,
      hasSession,
      planRespected: hasSession && notRespectedCount === 0 && respectedCount > 0,
      planNotRespected: hasSession && notRespectedCount > 0,
    };
  });
}

function getWeekPlanRate(days) {
  const tradedDays = days.filter((day) => day.hasSession);
  if (tradedDays.length === 0) return 0;

  const respectedDays = tradedDays.filter((day) => day.planRespected).length;
  return Math.round((respectedDays / tradedDays.length) * 100);
}


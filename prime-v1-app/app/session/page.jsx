"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle,
  Target,
  ShieldAlert,
  TrendingUp,
  Save,
  RotateCcw,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function SessionPage() {
  const [mentalState, setMentalState] = useState("");
  const [postMentalState, setPostMentalState] = useState("");
  const [planRespected, setPlanRespected] = useState(null);
  const [improvementNote, setImprovementNote] = useState("");
  const [sessionPnl, setSessionPnl] = useState("");
  const [checked, setChecked] = useState({});
  const [mistakes, setMistakes] = useState({});
  const [disciplineScore, setDisciplineScore] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [activePrescription, setActivePrescription] = useState(null);
  const [prescriptionAnswered, setPrescriptionAnswered] = useState(false);
  const [primeProfile, setPrimeProfile] = useState(null);
  const [todaySessionCount, setTodaySessionCount] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profileData } = await supabase
      .from("prime_identity_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profileData) setPrimeProfile(profileData.profile);

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
      setPrescriptionAnswered(prescriptionData.last_check_date === today);
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const { data: todaySessions } = await supabase
      .from("sessions")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", start.toISOString());

    setTodaySessionCount(todaySessions?.length || 0);
  };

  const checklist = getChecklistByProfile(primeProfile);

  const mistakesList = [
    "Revenge trade",
    "Overtrading",
    "Entrée FOMO",
    "Stop déplacé",
    "Trade hors plan",
  ];

  const focus = getFocusMessage(primeProfile);

  const calculateScore = (
    updatedChecks,
    updatedMistakes,
    respectedPlan = planRespected
  ) => {
    const checkedCount = Object.values(updatedChecks).filter(Boolean).length;
    const baseScore = Math.round((checkedCount / checklist.length) * 100);

    let malus = 0;

    Object.entries(updatedMistakes).forEach(([mistake, active]) => {
      if (!active) return;

      if (primeProfile === "Trader Impulsif") {
        if (mistake === "Revenge trade") malus += 25;
        else if (mistake === "Overtrading") malus += 20;
        else if (mistake === "Entrée FOMO") malus += 10;
        else malus += 15;
      } else if (primeProfile === "Trader FOMO") {
        if (mistake === "Entrée FOMO") malus += 25;
        else if (mistake === "Revenge trade") malus += 10;
        else malus += 15;
      } else if (primeProfile === "Trader Désorganisé") {
        if (mistake === "Trade hors plan") malus += 25;
        else if (mistake === "Stop déplacé") malus += 20;
        else malus += 15;
      } else {
        malus += 15;
      }
    });

    if (respectedPlan === false) malus += 20;

    return Math.max(baseScore - malus, 0);
  };

  const getActiveSessionId = async () => {
    if (activeSessionId) return activeSessionId;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Utilisateur non connecté");
      return null;
    }

    const { data: existingSession } = await supabase
      .from("sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      setActiveSessionId(existingSession.id);
      return existingSession.id;
    }

    const { data: newSession, error } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: user.id,
          discipline_active: true,
          discipline_score: 0,
          streak_gain: 1,
          xp_gain: 40,
          status: "active",
          mental_state: null,
          dominant_error: null,
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Erreur création session : " + error.message);
      return null;
    }

    setActiveSessionId(newSession.id);
    setTodaySessionCount((prev) => prev + 1);
    return newSession.id;
  };

  const updatePrescriptionCompliance = async (respected) => {
    if (!activePrescription) return;

    if (activePrescription.last_check_date === today) {
      alert("Tu as déjà renseigné ta prescription aujourd’hui.");
      setPrescriptionAnswered(true);
      return;
    }

    const newComplianceDays =
      (activePrescription.compliance_days || 0) + (respected ? 1 : 0);

    const newMissedDays =
      (activePrescription.missed_days || 0) + (respected ? 0 : 1);

    const totalCheckedDays = newComplianceDays + newMissedDays;
    const durationDays = activePrescription.duration_days || 7;
    const shouldComplete = totalCheckedDays >= durationDays;

    let result = null;

    if (shouldComplete) {
      const successRate = newComplianceDays / durationDays;
      if (successRate >= 0.8) result = "success";
      else if (successRate >= 0.6) result = "partial";
      else result = "failed";
    }

    const { data, error } = await supabase
      .from("prescriptions")
      .update({
        compliance_days: newComplianceDays,
        missed_days: newMissedDays,
        last_check_date: today,
        status: shouldComplete ? "completed" : "active",
        completed_at: shouldComplete ? new Date().toISOString() : null,
        result,
      })
      .eq("id", activePrescription.id)
      .select()
      .single();

    if (error) {
      alert("Erreur prescription : " + error.message);
      return;
    }

    setActivePrescription(data);
    setPrescriptionAnswered(true);
  };

  const handleMentalState = async (state) => {
    const sessionId = await getActiveSessionId();
    if (!sessionId) return;

    setMentalState(state);

    await supabase
      .from("sessions")
      .update({ mental_state: state })
      .eq("id", sessionId);
  };

  const handleChecklist = async (item) => {
    const sessionId = await getActiveSessionId();
    if (!sessionId) return;

    const updatedChecks = { ...checked, [item]: !checked[item] };
    setChecked(updatedChecks);

    const score = calculateScore(updatedChecks, mistakes);
    setDisciplineScore(score);

    await supabase
      .from("sessions")
      .update({ discipline_score: score })
      .eq("id", sessionId);
  };

  const handleMistake = async (mistake) => {
    const sessionId = await getActiveSessionId();
    if (!sessionId) return;

    const updatedMistakes = { ...mistakes, [mistake]: !mistakes[mistake] };
    setMistakes(updatedMistakes);

    const score = calculateScore(checked, updatedMistakes);
    setDisciplineScore(score);

    const activeMistakes = Object.keys(updatedMistakes).filter(
      (key) => updatedMistakes[key]
    );

    const dominantError =
      activeMistakes.length > 0
        ? activeMistakes[activeMistakes.length - 1]
        : null;

    await supabase
      .from("sessions")
      .update({
        discipline_score: score,
        dominant_error: dominantError,
      })
      .eq("id", sessionId);
  };

  const handlePlanRespected = async (value) => {
    const sessionId = await getActiveSessionId();
    if (!sessionId) return;

    setPlanRespected(value);

    const score = calculateScore(checked, mistakes, value);
    setDisciplineScore(score);

    await supabase
      .from("sessions")
      .update({
        plan_respected: value,
        discipline_score: score,
      })
      .eq("id", sessionId);
  };

  const finishSession = async () => {
    const sessionId = await getActiveSessionId();

    if (!sessionId) {
      alert("Aucune session active");
      return;
    }

    const { error } = await supabase
      .from("sessions")
      .update({
        status: "closed",
        discipline_score: disciplineScore,
        mental_state: mentalState || null,
        post_mental_state: postMentalState || null,
        plan_respected: planRespected,
        improvement_note: improvementNote || null,
        session_pnl: sessionPnl === "" ? null : Number(sessionPnl),
      })
      .eq("id", sessionId);

    if (error) {
      alert("Erreur sauvegarde session : " + error.message);
      return;
    }

    setSessionFinished(true);
  };

  const startNewSession = () => {
    setMentalState("");
    setPostMentalState("");
    setPlanRespected(null);
    setImprovementNote("");
    setSessionPnl("");
    setChecked({});
    setMistakes({});
    setDisciplineScore(0);
    setActiveSessionId(null);
    setSessionFinished(false);
    setPrescriptionAnswered(activePrescription?.last_check_date === today);
  };

  const selectedMistakes = Object.values(mistakes).filter(Boolean).length;
  const checklistProgress = Math.round(
    (Object.values(checked).filter(Boolean).length / checklist.length) * 100
  );

  if (sessionFinished) {
    return (
      <main className="session-page">
        <BaseStyles />

        <div className="page">
          <section className="hero">
            <p className="brand">SESSION ENREGISTRÉE</p>

            <h1 className="title">
              Résultat
              <span>PRIME.</span>
            </h1>

            <p className="subtitle">
              Ta trace psycho-financière est sauvegardée.
            </p>
          </section>

          <section className="score-card">
            <div className="score-ring">
              <div className="score-number">{disciplineScore}%</div>
            </div>

            <div>
              <p className="label">SCORE D’EXÉCUTION</p>
              <h2 className="card-title">Résumé de session</h2>

              <p className="text">
                PnL :{" "}
                <strong
                  style={{
                    color:
                      Number(sessionPnl || 0) > 0
                        ? "#6BE28B"
                        : Number(sessionPnl || 0) < 0
                        ? "#F05B5B"
                        : "#fff",
                  }}
                >
                  {sessionPnl !== ""
                    ? `${Number(sessionPnl) > 0 ? "+" : ""}${sessionPnl}€`
                    : "Non renseigné"}
                </strong>
                <br />
                Plan :{" "}
                <strong
                  style={{
                    color:
                      planRespected === true
                        ? "#6BE28B"
                        : planRespected === false
                        ? "#F05B5B"
                        : "#fff",
                  }}
                >
                  {planRespected === true
                    ? "Respecté"
                    : planRespected === false
                    ? "Hors plan"
                    : "Non renseigné"}
                </strong>
                <br />
                Mental post-session : <strong>{postMentalState || "Non renseigné"}</strong>
              </p>
            </div>
          </section>

          <section className="cta-stack">
            <button className="gold-button" onClick={startNewSession}>
              <RotateCcw size={20} />
              Enregistrer une nouvelle session
            </button>

            <button className="secondary-button" onClick={() => (window.location.href = "/coach")}>
              Voir mon Coach
            </button>

            <button className="secondary-button" onClick={() => (window.location.href = "/journal")}>
              Voir mon Journal
            </button>

            <button className="secondary-button" onClick={() => (window.location.href = "/")}>
              Terminer ma journée
            </button>
          </section>
        </div>

        <BottomNav active="Session" />
      </main>
    );
  }

  return (
    <main className="session-page">
      <BaseStyles />

      <div className="page">
        <section className="hero">
          <p className="brand">COCKPIT D’EXÉCUTION</p>

          <h1 className="title">
            Session #{todaySessionCount + (activeSessionId ? 0 : 1)}
            <span>Aujourd’hui.</span>
          </h1>

          <p className="subtitle">
            Prépare ta décision, exécute ton plan, puis débriefe ton comportement.
          </p>
        </section>

        <section className="status-card">
          <div>
            <p className="label">IDENTITÉ ACTIVE</p>
            <h2 className="card-title">{primeProfile || "Profil en analyse"}</h2>
            <p className="text">{focus}</p>
          </div>

          <div className="score-pill">
            {disciplineScore}%
          </div>
        </section>

        <div className="section-heading">
          <span>AVANT TRADE</span>
        </div>

        <section className="card compact-card">
          <div className="card-top">
            <Brain size={23} className="icon" />
            <p className="label">ÉTAT MENTAL</p>
          </div>

          <div className="pill-grid">
            {["Calme", "Focus", "Stressée", "Impatiente", "Fatiguée"].map(
              (state) => (
                <button
                  key={state}
                  onClick={() => handleMentalState(state)}
                  className={mentalState === state ? "pill active" : "pill"}
                >
                  {state}
                </button>
              )
            )}
          </div>
        </section>

        <section className="card">
          <div className="card-top">
            <CheckCircle size={23} className="icon" />
            <p className="label">CHECKLIST PRÉ-TRADE</p>
          </div>

          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${checklistProgress}%` }} />
          </div>

          <div className="checklist-grid">
            {checklist.map((item) => (
              <button
                key={item}
                onClick={() => handleChecklist(item)}
                className={checked[item] ? "check active" : "check"}
              >
                <span>{checked[item] ? "✓" : ""}</span>
                {item}
              </button>
            ))}
          </div>
        </section>

        <div className="section-heading">
          <span>APRÈS TRADE</span>
        </div>

        <section className="grid">
          <div className="card mini">
            <TrendingUp size={24} className="icon" />
            <p className="label">PNL</p>
            <input
              type="number"
              value={sessionPnl}
              onChange={(e) => setSessionPnl(e.target.value)}
              placeholder="0"
              className="pnl-input"
            />
          </div>

          <div className="card mini">
            <Target size={24} className="icon" />
            <p className="label">PLAN</p>
            <div className="two-buttons">
              <button
                className={planRespected === true ? "choice success active" : "choice"}
                onClick={() => handlePlanRespected(true)}
              >
                Oui
              </button>
              <button
                className={planRespected === false ? "choice danger active" : "choice"}
                onClick={() => handlePlanRespected(false)}
              >
                Non
              </button>
            </div>
          </div>
        </section>

        <section className="card compact-card">
          <div className="card-top">
            <Brain size={23} className="icon" />
            <p className="label">MENTAL POST-SESSION</p>
          </div>

          <div className="pill-grid">
            {["Satisfaite", "Neutre", "Frustrée", "Stressée", "Fière", "Déçue"].map(
              (state) => (
                <button
                  key={state}
                  onClick={() => setPostMentalState(state)}
                  className={postMentalState === state ? "pill active" : "pill"}
                >
                  {state}
                </button>
              )
            )}
          </div>
        </section>

        <section className="card compact-card">
          <div className="card-top">
            <ShieldAlert size={23} className="icon" />
            <p className="label">ERREURS COMPORTEMENTALES</p>
            <span className="count">{selectedMistakes}</span>
          </div>

          <div className="pill-grid">
            {mistakesList.map((mistake) => (
              <button
                key={mistake}
                onClick={() => handleMistake(mistake)}
                className={mistakes[mistake] ? "pill danger active" : "pill"}
              >
                {mistake}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-top">
            <Sparkles size={23} className="icon" />
            <p className="label">AMÉLIORATION</p>
          </div>

          <textarea
            value={improvementNote}
            onChange={(e) => setImprovementNote(e.target.value)}
            placeholder="Ce que je dois corriger à la prochaine session..."
            className="note"
          />
        </section>

        {activePrescription && (
          <section className="card">
            <div className="card-top">
              <Target size={23} className="icon" />
              <p className="label">PRESCRIPTION ACTIVE</p>
            </div>

            <h2 className="card-title small">{activePrescription.title}</h2>
            <p className="text">{activePrescription.rule}</p>

            <p className="text">
              Progression : {activePrescription.compliance_days || 0} /{" "}
              {activePrescription.duration_days || 7} jours
            </p>

            {prescriptionAnswered ? (
              <p className="success-text">Prescription renseignée aujourd’hui ✓</p>
            ) : (
              <div className="two-buttons">
                <button
                  className="choice success"
                  onClick={() => updatePrescriptionCompliance(true)}
                >
                  Respectée
                </button>

                <button
                  className="choice danger"
                  onClick={() => updatePrescriptionCompliance(false)}
                >
                  Non respectée
                </button>
              </div>
            )}
          </section>
        )}

        <section className="save-card">
          <div>
            <p className="label">SCORE ACTUEL</p>
            <h2>{disciplineScore}%</h2>
          </div>

          <button className="save-button" onClick={finishSession}>
            <Save size={20} />
            Enregistrer
          </button>
        </section>
      </div>

      <BottomNav active="Session" />
    </main>
  );
}

function BaseStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: #050505;
      }

      .session-page {
        min-height: 100vh;
        padding: 30px 18px 128px;
        color: white;
        font-family: Inter, Arial, sans-serif;
        background: #050505;
      }

      .page {
        max-width: 460px;
        margin: 0 auto;
      }

      .brand {
        color: #D4B06A;
        letter-spacing: 6px;
        font-size: 13px;
        text-transform: uppercase;
        margin-bottom: 18px;
      }

      .title {
        margin: 0;
        font-size: 46px;
        line-height: 1;
        font-weight: 950;
        letter-spacing: -2.6px;
      }

      .title span {
        display: block;
        color: rgba(255,255,255,0.88);
      }

      .subtitle {
        margin-top: 14px;
        font-size: 17px;
        line-height: 1.5;
        color: rgba(255,255,255,0.62);
      }

      .hero {
        margin-bottom: 22px;
      }

      .card,
      .status-card,
      .save-card,
      .score-card {
        border-radius: 26px;
        background: #101010;
        border: 1px solid rgba(255,255,255,0.07);
        box-shadow: 0 18px 45px rgba(0,0,0,0.38);
      }

      .card {
        padding: 20px;
        margin-bottom: 14px;
      }

      .compact-card {
        padding-bottom: 18px;
      }

      .status-card {
        padding: 22px;
        margin-bottom: 18px;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }

      .score-pill {
        width: 68px;
        height: 68px;
        border-radius: 22px;
        background: rgba(212,176,106,0.10);
        border: 1px solid rgba(212,176,106,0.22);
        color: #D4B06A;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 950;
        font-size: 20px;
        flex: 0 0 auto;
      }

      .label {
        color: #D4B06A;
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 900;
        margin: 0 0 12px;
      }

      .card-title {
        margin: 0;
        color: #D4B06A;
        font-size: 25px;
        line-height: 1.12;
        font-weight: 950;
      }

      .card-title.small {
        font-size: 21px;
      }

      .text {
        margin: 12px 0 0;
        color: rgba(255,255,255,0.68);
        font-size: 15px;
        line-height: 1.6;
      }

      .section-heading {
        margin: 20px 0 12px;
        color: rgba(255,255,255,0.42);
        font-size: 12px;
        letter-spacing: 3px;
        text-transform: uppercase;
        font-weight: 950;
      }

      .card-top {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }

      .card-top .label {
        margin: 0;
      }

      .icon {
        color: #D4B06A;
        flex: 0 0 auto;
      }

      .count {
        margin-left: auto;
        min-width: 28px;
        height: 28px;
        border-radius: 999px;
        background: rgba(255,255,255,0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,0.68);
        font-weight: 900;
      }

      .pill-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .pill {
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.045);
        color: rgba(255,255,255,0.82);
        padding: 11px 13px;
        border-radius: 999px;
        font-weight: 850;
        font-size: 14px;
        cursor: pointer;
      }

      .pill.active {
        background: #D4B06A;
        border-color: #D4B06A;
        color: #050505;
      }

      .pill.danger.active {
        background: rgba(240,91,91,0.18);
        border-color: rgba(240,91,91,0.38);
        color: #F05B5B;
      }

      .progress-track {
        height: 8px;
        width: 100%;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        overflow: hidden;
        margin-bottom: 16px;
      }

      .progress-bar {
        height: 100%;
        border-radius: 999px;
        background: #D4B06A;
      }

      .checklist-grid {
        display: grid;
        gap: 9px;
      }

      .check {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
        padding: 13px;
        border-radius: 17px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.035);
        color: rgba(255,255,255,0.80);
        font-weight: 750;
        cursor: pointer;
      }

      .check span {
        width: 22px;
        height: 22px;
        border-radius: 7px;
        border: 1px solid rgba(255,255,255,0.14);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #050505;
        font-size: 13px;
        font-weight: 950;
        flex: 0 0 auto;
      }

      .check.active {
        border-color: rgba(212,176,106,0.35);
        background: rgba(212,176,106,0.08);
        color: white;
      }

      .check.active span {
        background: #D4B06A;
        border-color: #D4B06A;
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 14px;
      }

      .mini {
        min-height: 154px;
      }

      .pnl-input {
        width: 100%;
        margin-top: 12px;
        border: none;
        background: transparent;
        color: white;
        font-size: 34px;
        font-weight: 950;
        outline: none;
      }

      .pnl-input::placeholder {
        color: rgba(255,255,255,0.25);
      }

      .two-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 14px;
      }

      .choice {
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.045);
        color: white;
        border-radius: 16px;
        padding: 13px;
        font-weight: 900;
        cursor: pointer;
      }

      .choice.success.active,
      .choice.success {
        border-color: rgba(107,226,139,0.28);
      }

      .choice.success.active {
        background: rgba(107,226,139,0.16);
        color: #6BE28B;
      }

      .choice.danger.active,
      .choice.danger {
        border-color: rgba(240,91,91,0.28);
      }

      .choice.danger.active {
        background: rgba(240,91,91,0.16);
        color: #F05B5B;
      }

      .note {
        width: 100%;
        min-height: 94px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.035);
        color: white;
        border-radius: 18px;
        padding: 15px;
        font-size: 15px;
        line-height: 1.5;
        outline: none;
        resize: vertical;
        font-family: Inter, Arial, sans-serif;
      }

      .success-text {
        margin-top: 14px;
        color: #6BE28B;
        font-weight: 900;
      }

      .save-card {
        padding: 20px;
        margin-top: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .save-card h2 {
        margin: 0;
        color: #D4B06A;
        font-size: 36px;
        font-weight: 950;
      }

      .save-button,
      .gold-button,
      .secondary-button {
        border: none;
        border-radius: 18px;
        padding: 15px 18px;
        font-weight: 950;
        cursor: pointer;
      }

      .save-button,
      .gold-button {
        background: #D4B06A;
        color: #050505;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
      }

      .secondary-button {
        width: 100%;
        background: #101010;
        color: white;
        border: 1px solid rgba(255,255,255,0.08);
      }

      .cta-stack {
        display: grid;
        gap: 12px;
      }

      .score-card {
        padding: 22px;
        display: grid;
        grid-template-columns: 116px 1fr;
        gap: 18px;
        align-items: center;
        margin-bottom: 18px;
      }

      .score-ring {
        width: 116px;
        height: 116px;
        border-radius: 50%;
        background:
          conic-gradient(#D4B06A var(--score), rgba(255,255,255,0.10) 0deg);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .score-ring::before {
        content: "";
        position: absolute;
        width: 92px;
        height: 92px;
        border-radius: 50%;
        background: #050505;
      }

      .score-number {
        position: relative;
        z-index: 1;
        font-size: 30px;
        font-weight: 950;
      }

      @media(max-width:390px) {
        .title { font-size: 40px; }
        .grid,
        .two-buttons,
        .score-card {
          grid-template-columns: 1fr;
        }
        .score-ring {
          margin: 0 auto;
        }
      }
    `}</style>
  );
}

function getChecklistByProfile(profile) {
  switch (profile) {
    case "Trader Impulsif":
      return [
        "J’ai attendu mon setup complet",
        "Je ne trade pas une émotion",
        "Je ne suis pas en revenge trade",
        "Mon risque est défini",
        "Mon invalidation est définie",
        "Je respecte mon cadre",
      ];

    case "Trader Désorganisé":
      return [
        "Mon scénario est écrit",
        "Mon invalidation est définie",
        "Mon risque est calculé",
        "J’ai identifié la tendance HTF",
        "J’ai identifié les liquidités",
        "Je sais exactement pourquoi j'entre",
      ];

    case "Trader FOMO":
      return [
        "J’ai attendu la confirmation",
        "Je n’anticipe pas le mouvement",
        "Le setup est complet",
        "J’accepte de rater un trade",
        "Mon entrée est validée",
        "Je respecte mon plan",
      ];

    default:
      return [
        "J’ai identifié la tendance HTF",
        "J’ai repéré les zones de liquidité",
        "J’ai défini mon scénario principal",
        "J’ai défini mon invalidation",
        "Je connais mon risque max",
        "Je ne trade pas par impatience",
      ];
  }
}

function getFocusMessage(profile) {
  switch (profile) {
    case "Trader Impulsif":
      return "Ralentis avant d'agir. Tu ne cherches pas une opportunité, tu valides une décision.";
    case "Trader Désorganisé":
      return "Structure ton plan avant l’exécution. Pas de cadre, pas de trade.";
    case "Trader FOMO":
      return "Laisse partir les opportunités incomplètes. Ton edge est dans l’attente.";
    default:
      return "Respecte le process avant le résultat.";
  }
}


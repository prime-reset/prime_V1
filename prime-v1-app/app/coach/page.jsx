"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  ShieldAlert,
  Flame,
  Activity,
  Sparkles,
  Target,
  Crown,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function CoachPage() {
  const [sessions, setSessions] = useState([]);
  const [activePrescription, setActivePrescription] = useState(null);
  const [completedPrescription, setCompletedPrescription] = useState(null);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creationChecked, setCreationChecked] = useState(false);
  const [identitySnapshotChecked, setIdentitySnapshotChecked] = useState(false);
  const [identityHistory, setIdentityHistory] = useState([]);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetReflection, setResetReflection] = useState("");
  const [resetCommitment, setResetCommitment] = useState(false);

  useEffect(() => {
    loadCoachData();
  }, []);

  useEffect(() => {
    if (!loading && sessions.length > 0 && !creationChecked) {
      createPrescriptionIfNeeded();
      setCreationChecked(true);
    }
  }, [loading, sessions, creationChecked]);

  useEffect(() => {
    if (!loading && sessions.length >= 5 && !identitySnapshotChecked) {
      saveIdentitySnapshot();
      setIdentitySnapshotChecked(true);
    }
  }, [loading, sessions, identitySnapshotChecked]);

  const loadCoachData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (sessionsData) setSessions(sessionsData);

    const { data: identityData } = await supabase
      .from("prime_identity_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2);

    if (identityData) setIdentityHistory(identityData);

    const { data: activeData } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeData) setActivePrescription(activeData);

    const { data: completedData } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (completedData) setCompletedPrescription(completedData);

    const { data: historyData } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5);

    if (historyData) setPrescriptionHistory(historyData);

    setLoading(false);
  };

  const createPrescriptionIfNeeded = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    if (activePrescription) return;

    const pattern = detectPrimePattern(sessions);

    if (
      pattern.type !== "revenge_trading" &&
      pattern.type !== "overtrading" &&
      pattern.type !== "low_discipline_streak"
    ) {
      return;
    }

    const { data: existingPrescription } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (existingPrescription) {
      setActivePrescription(existingPrescription);
      return;
    }

    let prescription = null;

    if (pattern.type === "revenge_trading") {
      prescription = {
        trigger_error: "Revenge trade",
        title: "Prescription Revenge Trading",
        text:
          "Tu cherches à récupérer une émotion après une perte. PRIME veut casser cette boucle comportementale.",
        rule:
          "Après une perte : pause obligatoire de 20 minutes. Aucun nouveau trade sans setup A clair.",
        duration_days: 7,
      };
    }

    if (pattern.type === "overtrading") {
      prescription = {
        trigger_error: "Overtrading",
        title: "Prescription Overtrading",
        text:
          "Tu multiplies les décisions et tu réduis la qualité de ton exécution.",
        rule: "Maximum 2 trades par session pendant 7 jours.",
        duration_days: 7,
      };
    }

    if (pattern.type === "low_discipline_streak") {
      prescription = {
        trigger_error: "Low Discipline",
        title: "Prescription Discipline",
        text:
          "Le problème principal n’est pas ta stratégie, mais le respect de ton cadre.",
        rule:
          "Checklist complète obligatoire avant chaque trade pendant 7 jours.",
        duration_days: 7,
      };
    }

    if (!prescription) return;

    const { data: createdPrescription, error } = await supabase
      .from("prescriptions")
      .insert([
        {
          user_id: user.id,
          session_id: sessions[0]?.id || null,
          trigger_error: prescription.trigger_error,
          title: prescription.title,
          text: prescription.text,
          rule: prescription.rule,
          duration_days: prescription.duration_days,
          status: "active",
        },
      ])
      .select()
      .single();

    if (!error && createdPrescription) {
      setActivePrescription(createdPrescription);
    }

    if (error) {
      console.error("Erreur création prescription :", error.message);
    }
  };

  const saveIdentitySnapshot = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    if (sessions.length < 5) return;

    const currentScores = sessions
      .map((s) => Number(s.discipline_score))
      .filter((score) => !Number.isNaN(score));

    const currentAverage =
      currentScores.length > 0
        ? Math.round(
            currentScores.reduce((a, b) => a + b, 0) / currentScores.length
          )
        : 0;

    const currentDominantError = getDominantValue(
      sessions.map((s) => s.dominant_error).filter(Boolean)
    );

    const currentIdentity = getPrimeIdentity(
      sessions,
      currentAverage,
      currentDominantError
    );

    const { data: lastIdentity } = await supabase
      .from("prime_identity_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      lastIdentity?.profile === currentIdentity.profile &&
      Math.abs(
        currentAverage -
        Number(lastIdentity?.discipline_average || 0)
      ) < 5
    ) {
      return;
    }

    const progression =
      currentAverage - Number(lastIdentity?.discipline_average || 0);

    const { error } = await supabase.from("prime_identity_history").insert([
      {
        user_id: user.id,
        profile: currentIdentity.profile,
        previous_profile: lastIdentity?.profile || null,
        progression: Math.round(progression),
        confidence_score: currentAverage,
        total_sessions: sessions.length,
        discipline_average: currentAverage,
        dominant_error: currentDominantError || null,
      },
    ]);

    if (error) {
      console.error("Erreur sauvegarde identité PRIME :", error.message);
    }
  };

  const scores = sessions
    .map((s) => Number(s.discipline_score))
    .filter((score) => !Number.isNaN(score));

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const dominantMentalState = getDominantValue(
    sessions.map((s) => s.post_mental_state || s.mental_state).filter(Boolean)
  );

  const dominantError = getDominantValue(
    sessions.map((s) => s.dominant_error).filter(Boolean)
  );

  const detectedPattern = detectPrimePattern(sessions);
  const primeIdentity = getPrimeIdentity(sessions, averageScore, dominantError);

  const coach = getCoachAnalysis({
    averageScore,
    dominantMentalState,
    dominantError,
    sessionsCount: sessions.length,
    detectedPattern,
    primeIdentity,
  });

  const displayedPrescription = activePrescription || completedPrescription;

  const complianceDays = displayedPrescription?.compliance_days || 0;
  const missedDays = displayedPrescription?.missed_days || 0;
  const durationDays = displayedPrescription?.duration_days || 7;
  const checkedDays = complianceDays + missedDays;
  const isCompleted = displayedPrescription?.status === "completed";
  const prescriptionPercent = displayedPrescription
    ? Math.min(Math.round((checkedDays / durationDays) * 100), 100)
    : 0;

  const totalCompleted = prescriptionHistory.length;

  const totalCompliance = prescriptionHistory.reduce(
    (sum, p) => sum + (p.compliance_days || 0),
    0
  );

  const totalDays = prescriptionHistory.reduce(
    (sum, p) => sum + ((p.compliance_days || 0) + (p.missed_days || 0)),
    0
  );

  const prescriptionSuccessRate =
    totalDays > 0 ? Math.round((totalCompliance / totalDays) * 100) : 0;

  const resetSignal = getResetSignal({
    sessions,
    averageScore,
    detectedPattern,
    dominantError,
  });

  const stability = getStabilityLevel({
    averageScore,
    detectedPattern,
    resetSignal,
  });

  let rootCause = "Stabilité";
  let symptom = dominantError || "Aucun";
  let risk = "Faible";

  if (detectedPattern?.type === "low_discipline_streak") {
    rootCause = "Discipline";
    risk = "Perte de contrôle émotionnel";
  }

  if (detectedPattern?.type === "revenge_trading") {
    rootCause = "Gestion émotionnelle";
    risk = "Revenge trading chronique";
  }

  if (detectedPattern?.type === "overtrading") {
    rootCause = "Suractivité";
    risk = "Dégradation de l’edge";
  }

  return (
    <main className="coach-page">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #050505;
        }

        .coach-page {
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
          letter-spacing: 7px;
          font-size: 13px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .hero {
          margin-bottom: 22px;
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

        .card,
        .metric-card,
        .reset-card {
          border-radius: 26px;
          background: #101010;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 18px 45px rgba(0,0,0,0.38);
        }

        .card {
          padding: 22px;
          margin-bottom: 14px;
        }

        .reset-card {
          padding: 22px;
          margin-bottom: 14px;
          border-color: rgba(240,91,91,0.26);
          background:
            radial-gradient(circle at top right, rgba(240,91,91,0.14), transparent 38%),
            #101010;
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
          font-size: 25px;
          line-height: 1.16;
          font-weight: 950;
          color: #D4B06A;
        }

        .text {
          margin-top: 14px;
          color: rgba(255,255,255,0.68);
          font-size: 15px;
          line-height: 1.6;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        .metric-card {
          min-height: 128px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .metric-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .icon {
          color: #D4B06A;
        }

        .danger-icon {
          color: #F05B5B;
        }

        .metric-title {
          margin: 0;
          color: #D4B06A;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-weight: 900;
        }

        .metric-value {
          margin: 10px 0 0;
          font-size: 24px;
          font-weight: 950;
          line-height: 1.08;
          letter-spacing: -0.4px;
        }

        .metric-caption {
          margin: 9px 0 0;
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          line-height: 1.45;
        }

        .diagnostic {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 18px;
        }

        .box {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .box-label {
          color: rgba(212,176,106,0.78);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 900;
        }

        .box-value {
          color: white;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 900;
        }

        .split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 18px;
        }

        .mini-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .mini-list li {
          color: rgba(255,255,255,0.72);
          font-size: 14px;
          line-height: 1.45;
          margin-top: 10px;
        }

        .mission {
          margin-top: 18px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(212,176,106,0.08);
          border: 1px solid rgba(212,176,106,0.16);
          color: white;
          font-weight: 850;
          line-height: 1.5;
          font-size: 15px;
        }

        .progress-track {
          margin-top: 16px;
          height: 8px;
          width: 100%;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 999px;
          background: #D4B06A;
        }

        .history-list {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .history-item {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .history-title {
          color: white;
          font-weight: 900;
          font-size: 15px;
          margin: 0;
        }

        .history-meta {
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          margin: 7px 0 0;
          line-height: 1.4;
        }

        .reset-actions {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .gold-button,
        .secondary-button,
        .danger-button {
          border: none;
          border-radius: 18px;
          padding: 15px 18px;
          font-weight: 950;
          cursor: pointer;
          width: 100%;
        }

        .gold-button {
          background: #D4B06A;
          color: #050505;
        }

        .danger-button {
          background: rgba(240,91,91,0.16);
          color: #F05B5B;
          border: 1px solid rgba(240,91,91,0.32);
        }

        .secondary-button {
          background: rgba(255,255,255,0.045);
          color: white;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .reset-step {
          margin-top: 18px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .textarea {
          width: 100%;
          min-height: 110px;
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
          margin-top: 14px;
        }

        .check-row {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.76);
          font-weight: 850;
          cursor: pointer;
        }

        .check-square {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #050505;
          font-weight: 950;
        }

        .check-square.active {
          background: #D4B06A;
          border-color: #D4B06A;
        }

        @media(max-width:390px) {
          .title { font-size: 40px; }
          .grid,
          .diagnostic,
          .split {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <p className="brand">PRIME COACH</p>

          <h1 className="title">
            Centre
            <span>d’analyse.</span>
          </h1>

          <p className="subtitle">
            PRIME lit tes données et déclenche une intervention quand ton exécution se dégrade.
          </p>
        </section>

        <section className="card">
          <p className="label">ANALYSE PRIME</p>
          <h2 className="card-title">
            {loading ? "Analyse en cours..." : coach.title}
          </h2>

          <p className="text">{coach.analysis}</p>

          <div className="diagnostic">
            <div className="box">
              <div className="box-label">Cause</div>
              <div className="box-value">{rootCause}</div>
            </div>

            <div className="box">
              <div className="box-label">Symptôme</div>
              <div className="box-value">{symptom}</div>
            </div>

            <div className="box">
              <div className="box-label">Risque</div>
              <div className="box-value">{risk}</div>
            </div>

            <div className="box">
              <div className="box-label">Stabilité</div>
              <div
                className="box-value"
                style={{ color: getStabilityColor(stability.level) }}
              >
                {stability.label}
              </div>
            </div>
          </div>
        </section>

        {resetSignal.show && (
          <section className="reset-card">
            <div className="metric-top">
              <div>
                <p className="label">MODE RESET</p>
                <h2 className="card-title" style={{ color: "#F05B5B" }}>
                  Reset conseillé.
                </h2>
              </div>

              <AlertTriangle size={30} className="danger-icon" />
            </div>

            <p className="text">{resetSignal.message}</p>

            {!resetOpen && (
              <div className="reset-actions">
                <button className="danger-button" onClick={() => setResetOpen(true)}>
                  Activer le reset anti-cramage
                </button>
              </div>
            )}

            {resetOpen && (
              <ResetFlow
                step={resetStep}
                setStep={setResetStep}
                reflection={resetReflection}
                setReflection={setResetReflection}
                commitment={resetCommitment}
                setCommitment={setResetCommitment}
              />
            )}
          </section>
        )}

        <section className="grid">
          <div className="metric-card">
            <div className="metric-top">
              <Activity size={22} className="icon" />
            </div>
            <div>
              <p className="metric-title">Mental dominant</p>
              <p className="metric-value">{dominantMentalState || "Aucun"}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <Flame size={22} className="icon" />
            </div>
            <div>
              <p className="metric-title">Erreur dominante</p>
              <p className="metric-value">{dominantError || "Aucune"}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <p className="label">IDENTITÉ PRIME</p>
          <h2 className="card-title">{primeIdentity.profile}</h2>
          <p className="text">{primeIdentity.description}</p>

          <div className="diagnostic">
            <div className="box">
              <div className="box-label">Score moyen</div>
              <div className="box-value">{averageScore}%</div>
            </div>

            <div className="box">
              <div className="box-label">Sessions lues</div>
              <div className="box-value">{sessions.length}</div>
            </div>

            <div className="box">
              <div className="box-label">Ancien profil</div>
              <div className="box-value">
                {identityHistory[1]?.profile || "Premier profil"}
              </div>
            </div>

            <div className="box">
              <div className="box-label">Profil actuel</div>
              <div className="box-value">
                {identityHistory[0]?.profile || primeIdentity.profile}
              </div>
            </div>
          </div>

          <div className="split">
            <div className="box">
              <div className="box-label">Forces</div>
              <ul className="mini-list">
                {primeIdentity.strengths.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>

            <div className="box">
              <div className="box-label">Vigilances</div>
              <ul className="mini-list">
                {primeIdentity.weaknesses.map((item) => (
                  <li key={item}>✗ {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mission">{primeIdentity.mission}</div>
        </section>

        <section className="card">
          <p className="label">
            {isCompleted ? "PRESCRIPTION TERMINÉE" : "PRESCRIPTION ACTIVE"}
          </p>

          <h2 className="card-title">
            {displayedPrescription
              ? displayedPrescription.title
              : "Aucune prescription active"}
          </h2>

          <p className="text">
            {displayedPrescription
              ? displayedPrescription.rule
              : coach.prescription}
          </p>

          {displayedPrescription && (
            <>
              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{ width: `${prescriptionPercent}%` }}
                />
              </div>

              <p className="text">
                {isCompleted
                  ? `${complianceDays} / ${durationDays} jours respectés`
                  : `Jour ${checkedDays} / ${durationDays}`}{" "}
                · {missedDays} jour(s) non respecté(s)
              </p>

              {isCompleted && (
                <p
                  className="text"
                  style={{
                    color:
                      displayedPrescription.result === "success"
                        ? "#6BE28B"
                        : displayedPrescription.result === "partial"
                        ? "#D4B06A"
                        : "#F05B5B",
                    fontWeight: 900,
                  }}
                >
                  {displayedPrescription.result === "success"
                    ? "Prescription réussie"
                    : displayedPrescription.result === "partial"
                    ? "Prescription partiellement respectée"
                    : "Prescription échouée"}
                </p>
              )}
            </>
          )}
        </section>

        {prescriptionHistory.length > 0 && (
          <section className="card">
            <p className="label">HISTORIQUE COMPORTEMENTAL</p>
            <h2 className="card-title">
              Taux de respect : {prescriptionSuccessRate}%
            </h2>

            <p className="text">
              {totalCompleted} prescription(s) terminée(s). PRIME mesure ta capacité à tenir une règle dans le temps.
            </p>

            <div className="history-list">
              {prescriptionHistory.map((p) => {
                const historyCompliance = p.compliance_days || 0;
                const historyDuration = p.duration_days || 7;
                const historyPercent = Math.round(
                  (historyCompliance / historyDuration) * 100
                );

                return (
                  <div key={p.id} className="history-item">
                    <p className="history-title">
                      {p.result === "success"
                        ? "✅"
                        : p.result === "partial"
                        ? "⚠️"
                        : "❌"}{" "}
                      {p.title}
                    </p>

                    <p className="history-meta">
                      {historyCompliance} / {historyDuration} jours · {historyPercent}%
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="card">
          <p className="label">FOCUS DU JOUR</p>
          <h2 className="card-title">{coach.focusTitle}</h2>
          <p className="text">{coach.focus}</p>
        </section>
      </div>

      <BottomNav active="Coach" />
    </main>
  );
}

function ResetFlow({
  step,
  setStep,
  reflection,
  setReflection,
  commitment,
  setCommitment,
}) {
  if (step === 1) {
    return (
      <div className="reset-step">
        <p className="label">ÉTAPE 1 — STOP</p>
        <h2 className="card-title">Tu ne trades plus maintenant.</h2>
        <p className="text">
          Pendant 60 secondes, ton seul objectif est de couper l’impulsion.
          Respire. Regarde l’écran. Ne cherche pas à récupérer.
        </p>

        <div className="reset-actions">
          <button className="gold-button" onClick={() => setStep(2)}>
            J’ai coupé l’impulsion
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="reset-step">
        <p className="label">ÉTAPE 2 — LUCIDITÉ</p>
        <h2 className="card-title">Pourquoi veux-tu continuer ?</h2>
        <p className="text">
          Note ce qui se passe vraiment : frustration, envie de récupérer, peur de rater, colère, ego.
        </p>

        <textarea
          className="textarea"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Ce que je ressens maintenant..."
        />

        <div className="reset-actions">
          <button
            className="gold-button"
            onClick={() => setStep(3)}
            disabled={!reflection.trim()}
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="reset-step">
        <p className="label">ÉTAPE 3 — ENGAGEMENT</p>
        <h2 className="card-title">Protéger le compte est une victoire.</h2>
        <p className="text">
          Aujourd’hui, ton objectif n’est plus de gagner. Ton objectif est de ne pas cramer ton capital mental et financier.
        </p>

        <div className="check-row" onClick={() => setCommitment(!commitment)}>
          <span className={commitment ? "check-square active" : "check-square"}>
            {commitment ? "✓" : ""}
          </span>
          Je m’engage à arrêter ou à reprendre uniquement avec un setup A clair.
        </div>

        <div className="reset-actions">
          <button
            className="gold-button"
            onClick={() => setStep(4)}
            disabled={!commitment}
          >
            Valider mon reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-step">
      <p className="label">RESET VALIDÉ</p>
      <h2 className="card-title">Tu as repris le contrôle.</h2>
      <p className="text">
        Tu n’as pas besoin de récupérer maintenant. Tu viens de protéger ton compte, ton énergie et ta discipline. C’est une vraie victoire PRIME.
      </p>

      <div className="reset-actions">
        <button className="secondary-button" onClick={() => window.location.href = "/"}>
          Retour au cockpit
        </button>
      </div>
    </div>
  );
}

function getResetSignal({ sessions, averageScore, detectedPattern, dominantError }) {
  const closedSessions = sessions
    .filter((s) => s.status === "closed")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const lastThree = closedSessions.slice(0, 3);
  const negativeOffPlan = lastThree.filter(
    (s) => s.plan_respected === false && Number(s.session_pnl || 0) < 0
  ).length;

  const repeatedLosses = lastThree.filter(
    (s) => Number(s.session_pnl || 0) < 0
  ).length;

  if (
    detectedPattern?.type === "revenge_trading" ||
    dominantError === "Revenge trade"
  ) {
    return {
      show: true,
      level: "critical",
      message:
        "PRIME détecte un risque de récupération émotionnelle. Le danger n’est plus le marché : c’est la volonté de réparer une perte.",
    };
  }

  if (detectedPattern?.type === "overtrading") {
    return {
      show: true,
      level: "warning",
      message:
        "PRIME détecte une suractivité. Tu risques de confondre présence au marché et qualité d’exécution.",
    };
  }

  if (detectedPattern?.type === "low_discipline_streak" || averageScore < 55) {
    return {
      show: true,
      level: "warning",
      message:
        "PRIME détecte une baisse de discipline. Le Reset est conseillé pour éviter une dérive plus coûteuse.",
    };
  }

  if (negativeOffPlan >= 1 || repeatedLosses >= 3) {
    return {
      show: true,
      level: "warning",
      message:
        "Tes dernières traces montrent un risque de perte de contrôle. Le Reset peut empêcher une mauvaise session de devenir une mauvaise journée.",
    };
  }

  return {
    show: false,
    level: "stable",
    message: "",
  };
}

function getStabilityLevel({ averageScore, detectedPattern, resetSignal }) {
  if (resetSignal.level === "critical") {
    return { level: "critical", label: "Critique" };
  }

  if (
    resetSignal.level === "warning" ||
    detectedPattern?.type === "low_discipline_streak"
  ) {
    return { level: "warning", label: "Vigilance" };
  }

  if (averageScore >= 75) {
    return { level: "stable", label: "Stable" };
  }

  return { level: "neutral", label: "Sous observation" };
}

function getStabilityColor(level) {
  if (level === "stable") return "#6BE28B";
  if (level === "warning") return "#D4B06A";
  if (level === "critical") return "#F05B5B";
  return "#fff";
}

function getDominantValue(values) {
  if (!values || values.length === 0) return null;

  return values.sort(
    (a, b) =>
      values.filter((value) => value === b).length -
      values.filter((value) => value === a).length
  )[0];
}

function getPrimeIdentity(sessions, averageScore, dominantError) {
  const errors = sessions.map((s) => s.dominant_error).filter(Boolean);
  const count = (value) => errors.filter((e) => e === value).length;

  const revengeCount = count("Revenge trade");
  const overtradingCount = count("Overtrading");
  const fomoCount = count("Entrée FOMO");
  const stopMovedCount = count("Stop déplacé");
  const offPlanCount = count("Trade hors plan");

  if (averageScore >= 85 && errors.length <= 2) {
    return {
      profile: "Trader Patient",
      description:
        "Ton profil montre une bonne stabilité comportementale. Tu sembles capable de respecter ton cadre sans chercher à forcer le marché.",
      strengths: [
        "Discipline stable",
        "Bonne patience",
        "Capacité à respecter le plan",
      ],
      weaknesses: [
        "Risque de relâchement",
        "Excès de confiance après une bonne série",
      ],
      mission: "Mission PRIME : maintenir ton cadre sans accélérer trop vite.",
    };
  }

  if (
    revengeCount + overtradingCount >=
    fomoCount + offPlanCount + stopMovedCount
  ) {
    return {
      profile: "Trader Impulsif",
      description:
        "Ton profil montre une tendance à réagir vite sous pression. Tu peux être décisif, mais le risque est de transformer une émotion en décision de marché.",
      strengths: ["Réactivité", "Capacité à agir", "Énergie d’exécution"],
      weaknesses: [
        "Revenge trading",
        "Suractivité",
        "Décisions prises sous émotion",
      ],
      mission: "Mission PRIME : apprendre à ralentir avant d’agir.",
    };
  }

  if (fomoCount >= revengeCount && fomoCount >= offPlanCount) {
    return {
      profile: "Trader FOMO",
      description:
        "Ton profil montre une sensibilité aux mouvements déjà lancés. Tu risques d’entrer pour ne pas rater, plutôt que parce que ton setup est complet.",
      strengths: ["Lecture rapide du momentum", "Réactivité au mouvement"],
      weaknesses: [
        "Entrées précipitées",
        "Difficulté à laisser partir un mouvement",
      ],
      mission:
        "Mission PRIME : accepter qu’un trade manqué vaut mieux qu’un trade forcé.",
    };
  }

  if (offPlanCount >= revengeCount || averageScore < 65) {
    return {
      profile: "Trader Désorganisé",
      description:
        "Ton profil montre que le cadre n’est pas encore assez solide. Le problème prioritaire n’est pas la stratégie, mais l’exécution structurée.",
      strengths: ["Intuition de marché", "Capacité d’adaptation"],
      weaknesses: ["Plan non respecté", "Checklist fragile", "Manque de structure"],
      mission:
        "Mission PRIME : stabiliser ton process avant de chercher plus de performance.",
    };
  }

  if (stopMovedCount >= 2) {
    return {
      profile: "Trader Agressif",
      description:
        "Ton profil montre une tendance à négocier avec le risque après l’entrée. Ton enjeu principal est de rendre ton invalidation non négociable.",
      strengths: ["Courage d’exécution", "Tolérance à la pression"],
      weaknesses: [
        "Stop déplacé",
        "Risque excessif",
        "Difficulté à accepter l’invalidation",
      ],
      mission: "Mission PRIME : rendre ton stop sacré.",
    };
  }

  return {
    profile: "Trader en Construction",
    description:
      "PRIME collecte encore tes données comportementales. Ton identité deviendra plus précise à mesure que tu clôtures tes sessions.",
    strengths: ["Volonté de progresser", "Données en construction"],
    weaknesses: ["Profil encore instable", "Besoin de plus d’historique"],
    mission:
      "Mission PRIME : créer assez de données honnêtes pour révéler ton vrai profil.",
  };
}

function detectPrimePattern(sessions) {
  const closedSessions = sessions
    .filter((s) => s.status === "closed")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (closedSessions.length < 5) {
    return {
      type: "diagnostic_phase",
      title: "Phase diagnostic en cours",
      reason: `PRIME analyse tes ${closedSessions.length} premières sessions clôturées. Il faut 5 sessions clôturées pour activer les prescriptions comportementales.`,
    };
  }

  const lastThree = closedSessions.slice(0, 3);
  const lastFive = closedSessions.slice(0, 5);

  const lowDisciplineStreak =
    lastThree.length === 3 &&
    lastThree.every((s) => Number(s.discipline_score) < 65);

  if (lowDisciplineStreak) {
    return {
      type: "low_discipline_streak",
      title: "Dérive de discipline détectée",
      reason:
        "Tes 3 dernières sessions clôturées sont sous 65% de discipline. Ce n’est plus un accident isolé, c’est un pattern.",
    };
  }

  const revengeCount = lastFive.filter(
    (s) => s.dominant_error === "Revenge trade"
  ).length;

  if (revengeCount >= 2) {
    return {
      type: "revenge_trading",
      title: "Pattern de revenge trading détecté",
      reason:
        "PRIME détecte au moins 2 occurrences de revenge trading sur tes 5 dernières sessions.",
    };
  }

  const overtradingCount = lastFive.filter(
    (s) => s.dominant_error === "Overtrading"
  ).length;

  if (overtradingCount >= 2) {
    return {
      type: "overtrading",
      title: "Pattern d’overtrading détecté",
      reason:
        "PRIME détecte au moins 2 occurrences d’overtrading sur tes 5 dernières sessions.",
    };
  }

  return {
    type: "stable",
    title: "Aucun pattern critique détecté",
    reason:
      "PRIME ne détecte pas encore de dérive comportementale répétée. Le Coach reste silencieux tant qu’aucun vrai pattern ne justifie une prescription forte.",
  };
}

function getCoachAnalysis({
  dominantMentalState,
  sessionsCount,
  detectedPattern,
  primeIdentity,
}) {
  if (!sessionsCount) {
    return {
      title: "Coach en attente",
      analysis:
        "Lance une session PRIME pour que le coach commence à lire ton comportement réel.",
      prescription:
        "Lance une session, renseigne ton état mental, coche ta checklist et note tes erreurs.",
      focusTitle: "Créer la première donnée",
      focus:
        "La première étape n’est pas de performer. C’est de créer une base de données comportementale fiable.",
    };
  }

  const profile = primeIdentity?.profile;

  if (detectedPattern?.type === "revenge_trading") {
    if (profile === "Trader Impulsif") {
      return {
        title: "Impulsivité détectée",
        analysis:
          detectedPattern.reason +
          " Ton profil impulsif transforme rapidement une perte en besoin d’action.",
        prescription:
          "Après une perte : pause obligatoire de 20 minutes. Aucun trade sans confirmation complète du setup.",
        focusTitle: "Ralentis avant d’agir.",
        focus:
          "Ton edge ne disparaît pas parce que tu attends. Il disparaît quand tu veux réparer trop vite.",
      };
    }

    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason +
        " Tu ne trades plus seulement le marché, tu trades une émotion à réparer.",
      prescription:
        "Après une perte : pause obligatoire de 20 minutes. Aucun nouveau trade sans setup A clair.",
      focusTitle: "Ne récupère pas. Reviens neutre.",
      focus:
        "Une perte acceptée coûte moins cher qu’une perte que tu essaies de réparer.",
    };
  }

  if (detectedPattern?.type === "overtrading") {
    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason +
        " Ton danger principal est de confondre présence au marché et qualité d’exécution.",
      prescription: "Maximum 2 trades par session pendant 7 jours.",
      focusTitle: "Moins de trades. Plus de qualité.",
      focus:
        "Ton edge ne vient pas du nombre d’actions, mais de la sélection.",
    };
  }

  if (detectedPattern?.type === "low_discipline_streak") {
    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason +
        " Le problème prioritaire n’est pas la stratégie, mais le respect du cadre.",
      prescription:
        "Checklist complète obligatoire avant chaque trade pendant 7 jours.",
      focusTitle: "Pas de cadre, pas de trade.",
      focus:
        "Tu ne dois pas chercher plus d’opportunités. Tu dois protéger ton processus.",
    };
  }

  if (detectedPattern?.type === "diagnostic_phase") {
    return {
      title: detectedPattern.title,
      analysis:
        detectedPattern.reason +
        " Cette phase construit ton empreinte comportementale.",
      prescription:
        "Continue de clôturer tes sessions avec honnêteté. PRIME active les prescriptions après 5 sessions complètes.",
      focusTitle: "Créer ta baseline",
      focus:
        "Ton objectif n’est pas d’être parfaite. Ton objectif est de fournir des données réelles.",
    };
  }

  return {
    title: "Aucun pattern critique détecté",
    analysis:
      "PRIME ne détecte pas encore de dérive comportementale répétée. Le Coach observe ta stabilité.",
    prescription:
      "Aucune prescription active. Continue ton process et protège ta régularité.",
    focusTitle: "Maintenir le cadre.",
    focus:
      dominantMentalState
        ? `Ton mental dominant récent est : ${dominantMentalState}. Reste attentive à cet état avant l’exécution.`
        : "Aujourd’hui, PRIME ne cherche pas à corriger. Il observe et confirme ta stabilité.",
  };
}


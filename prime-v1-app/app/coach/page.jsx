"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  ShieldAlert,
  Flame,
  Activity,
  Sparkles,
  Target,
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

  useEffect(() => {
    loadCoachData();
  }, []);

  useEffect(() => {
    if (!loading && sessions.length > 0 && !creationChecked) {
      createPrescriptionIfNeeded();
      setCreationChecked(true);
    }
  }, [loading, sessions, creationChecked]);

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

  const scores = sessions
    .map((s) => Number(s.discipline_score))
    .filter((score) => !Number.isNaN(score));

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const dominantMentalState = getDominantValue(
    sessions.map((s) => s.mental_state).filter(Boolean)
  );

  const dominantError = getDominantValue(
    sessions.map((s) => s.dominant_error).filter(Boolean)
  );

  const detectedPattern = detectPrimePattern(sessions);

  const coach = getCoachAnalysis({
    averageScore,
    dominantMentalState,
    dominantError,
    sessionsCount: sessions.length,
    detectedPattern,
  });

  const displayedPrescription = activePrescription || completedPrescription;

  const complianceDays = displayedPrescription?.compliance_days || 0;
  const missedDays = displayedPrescription?.missed_days || 0;
  const durationDays = displayedPrescription?.duration_days || 7;
  const checkedDays = complianceDays + missedDays;
  const isCompleted = displayedPrescription?.status === "completed";

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

        .coach-page {
          min-height: 100vh;
          padding: 32px 20px 150px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background: linear-gradient(180deg, rgba(0,0,0,0.86), rgba(0,0,0,0.96)), #000;
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 28px;
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 6px;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .title {
          font-size: 64px;
          line-height: 0.92;
          font-weight: 900;
          letter-spacing: -3px;
          margin: 0;
        }

        .title span {
          display: block;
          color: rgba(255,255,255,0.88);
        }

        .subtitle {
          margin-top: 24px;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255,255,255,0.68);
        }

        .card {
          position: relative;
          overflow: hidden;
          padding: 28px;
          margin-bottom: 18px;
          border-radius: 34px;
          background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(22px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .icon-box {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          background: rgba(212,176,106,0.10);
          border: 1px solid rgba(212,176,106,0.18);
          color: #D4B06A;
        }

        .card-label {
          color: rgba(212,176,106,0.82);
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 28px;
          line-height: 1.15;
          font-weight: 800;
          margin: 0;
          color: #D4B06A;
        }

        .card-text {
          margin-top: 22px;
          font-size: 17px;
          line-height: 1.8;
          color: rgba(255,255,255,0.74);
        }

        .diagnostic-grid {
          margin-top: 24px;
          display: grid;
          gap: 12px;
        }

        .diagnostic-item {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .diagnostic-label {
          color: rgba(212,176,106,0.82);
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .diagnostic-value {
          font-size: 18px;
          font-weight: 800;
          color: white;
        }

        .prescription {
          font-size: 21px;
          line-height: 1.5;
          font-weight: 800;
          color: white;
          margin-top: 18px;
        }

        .progress-box {
          margin-top: 22px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(212,176,106,0.08);
          border: 1px solid rgba(212,176,106,0.16);
        }

        .progress-title {
          color: #D4B06A;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .progress-value {
          font-size: 24px;
          font-weight: 900;
          color: white;
          margin: 0;
        }

        .result-success {
          color: #7DFFA1;
          font-size: 24px;
          font-weight: 900;
          margin-top: 10px;
        }

        .result-partial {
          color: #D4B06A;
          font-size: 24px;
          font-weight: 900;
          margin-top: 10px;
        }

        .result-failed {
          color: #ff8a8a;
          font-size: 24px;
          font-weight: 900;
          margin-top: 10px;
        }

        .history-item {
          margin-top: 14px;
          padding: 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .history-item strong {
          display: block;
          color: white;
          margin-bottom: 6px;
        }

        .history-item span {
          color: rgba(255,255,255,0.65);
          font-size: 14px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .mini-card {
          padding: 20px;
          border-radius: 26px;
          background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
        }

        .mini-title {
          margin-top: 16px;
          font-size: 12px;
          color: rgba(212,176,106,0.82);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .mini-value {
          margin-top: 10px;
          font-size: 24px;
          font-weight: 900;
        }

        @media(max-width:520px) {
          .title { font-size: 52px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <div className="brand">PRIME COACH</div>

          <h1 className="title">
            Ton cerveau
            <span>d’exécution.</span>
          </h1>

          <p className="subtitle">
            PRIME transforme tes données de session en diagnostic clair,
            prescription active et focus d’exécution.
          </p>
        </section>

        <section className="card">
          <div className="icon-box">
            <Brain size={28} />
          </div>

          <div className="card-label">ANALYSE PRIME</div>

          <h2 className="card-title">
            {loading ? "Analyse en cours..." : coach.title}
          </h2>

          <p className="card-text">{coach.analysis}</p>

          <div className="diagnostic-grid">
            <div className="diagnostic-item">
              <div className="diagnostic-label">🧠 Cause principale</div>
              <div className="diagnostic-value">{rootCause}</div>
            </div>

            <div className="diagnostic-item">
              <div className="diagnostic-label">🔥 Symptôme dominant</div>
              <div className="diagnostic-value">{symptom}</div>
            </div>

            <div className="diagnostic-item">
              <div className="diagnostic-label">⚠️ Risque</div>
              <div className="diagnostic-value">{risk}</div>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="mini-card">
            <Activity size={24} color="#D4B06A" />
            <div className="mini-title">État mental</div>
            <div className="mini-value">{dominantMentalState || "Aucun"}</div>
          </div>

          <div className="mini-card">
            <Flame size={24} color="#D4B06A" />
            <div className="mini-title">Erreur dominante</div>
            <div className="mini-value">{dominantError || "Aucune"}</div>
          </div>
        </section>

        <section className="card">
          <div className="icon-box">
            <ShieldAlert size={28} />
          </div>

          <div className="card-label">
            {isCompleted ? "PRESCRIPTION TERMINÉE" : "PRESCRIPTION ACTIVE"}
          </div>

          <h2 className="card-title">
            {displayedPrescription
              ? displayedPrescription.title
              : "Prescription générée"}
          </h2>

          <div className="prescription">
            {displayedPrescription
              ? displayedPrescription.rule
              : coach.prescription}
          </div>

          {displayedPrescription?.text && (
            <p className="card-text">{displayedPrescription.text}</p>
          )}

          {displayedPrescription && (
            <div className="progress-box">
              <div className="progress-title">
                {isCompleted ? "Résultat final" : "Progression"}
              </div>

              <p className="progress-value">
                {isCompleted
                  ? `${complianceDays} / ${durationDays} jours respectés`
                  : `Jour ${checkedDays} / ${durationDays}`}
              </p>

              <p className="card-text">
                {complianceDays} jour(s) respecté(s) · {missedDays} jour(s) non respecté(s)
              </p>

              {isCompleted && displayedPrescription.result === "success" && (
                <p className="result-success">Prescription réussie ✅</p>
              )}

              {isCompleted && displayedPrescription.result === "partial" && (
                <p className="result-partial">
                  Prescription partiellement respectée ⚠️
                </p>
              )}

              {isCompleted && displayedPrescription.result === "failed" && (
                <p className="result-failed">Prescription échouée ❌</p>
              )}
            </div>
          )}

          <p className="card-text">
            Durée recommandée :{" "}
            {displayedPrescription?.duration_days || 7} jours. PRIME ne cherche
            pas à te faire trader plus, mais à te faire exécuter mieux.
          </p>
        </section>

        {prescriptionHistory.length > 0 && (
          <section className="card">
            <div className="icon-box">
              <Sparkles size={28} />
            </div>

            <div className="card-label">HISTORIQUE COMPORTEMENTAL</div>

            <h2 className="card-title">
              Taux de respect : {prescriptionSuccessRate}%
            </h2>

            <p className="card-text">
              {totalCompleted} prescription(s) terminée(s). PRIME mesure ta
              capacité à tenir une règle dans le temps.
            </p>

            {prescriptionHistory.map((p) => {
              const historyCompliance = p.compliance_days || 0;
              const historyDuration = p.duration_days || 7;
              const historyPercent = Math.round(
                (historyCompliance / historyDuration) * 100
              );

              return (
                <div key={p.id} className="history-item">
                  <strong>
                    {p.result === "success"
                      ? "✅"
                      : p.result === "partial"
                      ? "⚠️"
                      : "❌"}{" "}
                    {p.title}
                  </strong>

                  <span>
                    {historyCompliance} / {historyDuration} jours respectés ·{" "}
                    {historyPercent}%
                  </span>
                </div>
              );
            })}
          </section>
        )}

        <section className="grid">
          <div className="mini-card">
            <Target size={24} color="#D4B06A" />
            <div className="mini-title">Score moyen</div>
            <div className="mini-value">{averageScore}%</div>
          </div>

          <div className="mini-card">
            <Sparkles size={24} color="#D4B06A" />
            <div className="mini-title">Sessions lues</div>
            <div className="mini-value">{sessions.length}</div>
          </div>
        </section>

        <section className="card">
          <div className="icon-box">
            <Sparkles size={28} />
          </div>

          <div className="card-label">FOCUS DU JOUR</div>

          <h2 className="card-title">{coach.focusTitle}</h2>

          <p className="card-text">{coach.focus}</p>
        </section>
      </div>

      <BottomNav active="Coach" />
    </main>
  );
}

function getDominantValue(values) {
  if (!values || values.length === 0) return null;

  return values.sort(
    (a, b) =>
      values.filter((value) => value === b).length -
      values.filter((value) => value === a).length
  )[0];
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
  averageScore,
  dominantMentalState,
  dominantError,
  sessionsCount,
  detectedPattern,
}) {
  if (!sessionsCount) {
    return {
      title: "Coach en attente",
      analysis:
        "Lance une session PRIME pour que le coach commence à lire ton comportement réel.",
      prescription:
        "Active une session, renseigne ton état mental, coche ta checklist et note tes erreurs.",
      focusTitle: "Créer la première donnée",
      focus:
        "La première étape n’est pas de performer. C’est de créer une base de données comportementale fiable.",
    };
  }

  if (detectedPattern?.type === "revenge_trading") {
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
        " Cette phase n’est pas un vide : c’est la construction de ton empreinte comportementale.",
      prescription:
        "Continue de clôturer tes sessions avec honnêteté. PRIME active les prescriptions après 5 sessions complètes.",
      focusTitle: "Créer ta baseline",
      focus:
        "Pendant cette phase, ton objectif n’est pas d’être parfaite. Ton objectif est de fournir des données réelles.",
    };
  }

  return {
    title: "Aucun pattern critique détecté",
    analysis:
      "PRIME ne détecte pas encore de dérive comportementale répétée. Le Coach reste silencieux tant qu’aucun vrai pattern ne justifie une prescription forte.",
    prescription:
      "Aucune prescription active. Continue ton process et protège ta régularité.",
    focusTitle: "Maintenir le cadre.",
    focus:
      "Aujourd’hui, PRIME ne cherche pas à corriger. Il observe et confirme ta stabilité.",
  };
}

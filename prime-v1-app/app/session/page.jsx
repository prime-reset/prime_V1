"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CheckCircle,
  Target,
  ShieldAlert,
  TrendingUp,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CircleCheck,
  CircleX,
  BarChart3,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function SessionPage() {
  const [step, setStep] = useState("preparation");
  const [intention, setIntention] = useState("");
  const [mentalState, setMentalState] = useState("");
  const [postMentalState, setPostMentalState] = useState("");
  const [planRespected, setPlanRespected] = useState(null);
  const [hasMistake, setHasMistake] = useState(null);
  const [selectedMistake, setSelectedMistake] = useState("");
  const [customMistake, setCustomMistake] = useState("");
  const [improvementNote, setImprovementNote] = useState("");
  const [pnlOutcome, setPnlOutcome] = useState("");
  const [sessionPnl, setSessionPnl] = useState("");
  const [checked, setChecked] = useState({});
  const [disciplineScore, setDisciplineScore] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState(false);
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

  const checklist = useMemo(
    () => getChecklistByProfile(primeProfile),
    [primeProfile]
  );

  const mistakesList = [
    "Revenge trade",
    "Overtrading",
    "Entrée FOMO",
    "Stop déplacé",
    "Trade hors plan",
    "Autre",
  ];

  const focus = getFocusMessage(primeProfile);

  const calculateScore = (
    updatedChecks = checked,
    mistake = selectedMistake,
    respectedPlan = planRespected
  ) => {
    const checkedCount = Object.values(updatedChecks).filter(Boolean).length;
    const baseScore = Math.round((checkedCount / checklist.length) * 100);

    let malus = 0;

    if (mistake) {
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
    }

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

    const score = calculateScore(updatedChecks);
    setDisciplineScore(score);

    await supabase
      .from("sessions")
      .update({ discipline_score: score })
      .eq("id", sessionId);
  };

  const handleMistakeChoice = async (mistake) => {
    const sessionId = await getActiveSessionId();
    if (!sessionId) return;

    setSelectedMistake(mistake);
    if (mistake !== "Autre") setCustomMistake("");

    const score = calculateScore(checked, mistake, planRespected);
    setDisciplineScore(score);

    await supabase
      .from("sessions")
      .update({
        discipline_score: score,
        dominant_error: mistake === "Autre" ? null : mistake,
      })
      .eq("id", sessionId);
  };

  const handleNoMistake = async () => {
    const sessionId = await getActiveSessionId();
    if (!sessionId) return;

    setHasMistake(false);
    setSelectedMistake("");
    setCustomMistake("");

    const score = calculateScore(checked, "", planRespected);
    setDisciplineScore(score);

    await supabase
      .from("sessions")
      .update({
        discipline_score: score,
        dominant_error: null,
      })
      .eq("id", sessionId);
  };

  const handlePlanRespected = async (value) => {
    const sessionId = await getActiveSessionId();
    if (!sessionId) return;

    setPlanRespected(value);

    const score = calculateScore(checked, selectedMistake, value);
    setDisciplineScore(score);

    await supabase
      .from("sessions")
      .update({
        plan_respected: value,
        discipline_score: score,
      })
      .eq("id", sessionId);
  };

  const preparationComplete =
    Boolean(intention) &&
    Boolean(mentalState) &&
    checklist.every((item) => checked[item]);

  const debriefComplete =
    planRespected !== null &&
    Boolean(postMentalState) &&
    hasMistake !== null &&
    (!hasMistake ||
      (Boolean(selectedMistake) &&
        (selectedMistake !== "Autre" || Boolean(customMistake.trim())))) &&
    Boolean(pnlOutcome) &&
    (pnlOutcome === "BE" || sessionPnl !== "");

  const getSignedPnl = () => {
    if (pnlOutcome === "BE") return 0;
    const amount = Math.abs(Number(sessionPnl || 0));
    if (pnlOutcome === "Gain") return amount;
    if (pnlOutcome === "Stop") return -amount;
    return null;
  };

  const finishSession = async () => {
    if (!debriefComplete || saving) return;

    setSaving(true);
    const sessionId = await getActiveSessionId();

    if (!sessionId) {
      setSaving(false);
      alert("Aucune session active");
      return;
    }

    const finalDominantError = hasMistake
      ? selectedMistake === "Autre"
        ? customMistake.trim()
        : selectedMistake
      : null;

    const finalScore = calculateScore(
      checked,
      hasMistake ? selectedMistake : "",
      planRespected
    );

    setDisciplineScore(finalScore);

    const { error } = await supabase
      .from("sessions")
      .update({
        status: "closed",
        discipline_score: finalScore,
        mental_state: mentalState || null,
        post_mental_state: postMentalState || null,
        plan_respected: planRespected,
        dominant_error: finalDominantError,
        improvement_note: improvementNote || null,
        session_pnl: getSignedPnl(),
      })
      .eq("id", sessionId);

    if (error) {
      setSaving(false);
      alert("Erreur sauvegarde session : " + error.message);
      return;
    }

    setAnalysisPhase(true);
    window.setTimeout(() => {
      setAnalysisPhase(false);
      setSessionFinished(true);
      setSaving(false);
    }, 1200);
  };

  const startNewSession = () => {
    setStep("preparation");
    setIntention("");
    setMentalState("");
    setPostMentalState("");
    setPlanRespected(null);
    setHasMistake(null);
    setSelectedMistake("");
    setCustomMistake("");
    setImprovementNote("");
    setPnlOutcome("");
    setSessionPnl("");
    setChecked({});
    setDisciplineScore(0);
    setActiveSessionId(null);
    setSessionFinished(false);
    setAnalysisPhase(false);
    setPrescriptionAnswered(activePrescription?.last_check_date === today);
  };

  const checklistProgress = Math.round(
    (Object.values(checked).filter(Boolean).length / checklist.length) * 100
  );

  if (analysisPhase) {
    return (
      <main className="session-page center-screen">
        <BaseStyles />
        <div className="analysis-loader">
          <div className="analysis-orbit">
            <Sparkles size={30} />
          </div>
          <p className="brand">PRIME ANALYSE</p>
          <h1 className="analysis-title">Lecture de ta session.</h1>
          <p className="analysis-copy">
            Ton comportement, ton respect du plan et ton exécution sont en cours
            d’intégration.
          </p>
        </div>
      </main>
    );
  }

  if (sessionFinished) {
    const finalPnl = getSignedPnl();

    return (
      <main className="session-page">
        <BaseStyles />
        <div className="page">
          <section className="hero">
            <p className="brand">SESSION ENREGISTRÉE</p>
            <h1 className="title">
              Analyse
              <span>terminée.</span>
            </h1>
            <p className="subtitle">
              Ta session alimente maintenant ton Cockpit, ton Coach et ton
              identité PRIME.
            </p>
          </section>

          <section className="score-card">
            <div
              className="score-ring"
              style={{ "--score": `${disciplineScore * 3.6}deg` }}
            >
              <div className="score-number">{disciplineScore}%</div>
            </div>

            <div>
              <p className="label">SCORE D’EXÉCUTION</p>
              <h2 className="card-title">Ton processus est mesuré.</h2>

              <div className="result-list">
                <div>
                  <span>Résultat</span>
                  <strong>
                    {pnlOutcome}
                    {pnlOutcome !== "BE"
                      ? ` · ${finalPnl > 0 ? "+" : ""}${finalPnl}€`
                      : ""}
                  </strong>
                </div>
                <div>
                  <span>Plan</span>
                  <strong>
                    {planRespected ? "Respecté" : "Non respecté"}
                  </strong>
                </div>
                <div>
                  <span>Erreur déclarée</span>
                  <strong>
                    {hasMistake
                      ? selectedMistake === "Autre"
                        ? customMistake
                        : selectedMistake
                      : "Aucune"}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="completion-message">
            <CircleCheck size={24} />
            <div>
              <strong>Ta trace comportementale est sauvegardée.</strong>
              <p>
                PRIME met désormais à jour les signaux utiles à ta prochaine
                décision.
              </p>
            </div>
          </section>

          <section className="cta-stack">
            <button className="gold-button" onClick={() => (window.location.href = "/")}>
              Retour au Cockpit
              <ArrowRight size={20} />
            </button>
            <button className="secondary-button" onClick={() => (window.location.href = "/coach")}>
              Voir l’analyse du Coach
            </button>
            <button className="secondary-button" onClick={startNewSession}>
              <RotateCcw size={19} />
              Enregistrer une nouvelle session
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
          <div className="hero-topline">
            <p className="brand">RITUEL PRIME</p>
            <span className="session-index">
              Session #{todaySessionCount + (activeSessionId ? 0 : 1)}
            </span>
          </div>

          <h1 className="title">
            Prépare ton
            <span>comportement.</span>
          </h1>

          <p className="subtitle">
            Le marché viendra ensuite. Ici, tu décides d’abord comment tu vas
            agir.
          </p>
        </section>

        <ProgressHeader step={step} />

        {step === "preparation" ? (
          <PreparationStep
            primeProfile={primeProfile}
            focus={focus}
            intention={intention}
            setIntention={setIntention}
            getActiveSessionId={getActiveSessionId}
            mentalState={mentalState}
            handleMentalState={handleMentalState}
            checklist={checklist}
            checked={checked}
            handleChecklist={handleChecklist}
            checklistProgress={checklistProgress}
            activePrescription={activePrescription}
            prescriptionAnswered={prescriptionAnswered}
            updatePrescriptionCompliance={updatePrescriptionCompliance}
            preparationComplete={preparationComplete}
            setStep={setStep}
          />
        ) : (
          <DebriefStep
            setStep={setStep}
            planRespected={planRespected}
            handlePlanRespected={handlePlanRespected}
            postMentalState={postMentalState}
            setPostMentalState={setPostMentalState}
            hasMistake={hasMistake}
            setHasMistake={setHasMistake}
            handleNoMistake={handleNoMistake}
            getActiveSessionId={getActiveSessionId}
            mistakesList={mistakesList}
            selectedMistake={selectedMistake}
            handleMistakeChoice={handleMistakeChoice}
            customMistake={customMistake}
            setCustomMistake={setCustomMistake}
            pnlOutcome={pnlOutcome}
            setPnlOutcome={setPnlOutcome}
            sessionPnl={sessionPnl}
            setSessionPnl={setSessionPnl}
            improvementNote={improvementNote}
            setImprovementNote={setImprovementNote}
            debriefComplete={debriefComplete}
            finishSession={finishSession}
            saving={saving}
          />
        )}
      </div>

      <BottomNav active="Session" />
    </main>
  );
}


function PreparationStep({
  primeProfile,
  focus,
  intention,
  setIntention,
  getActiveSessionId,
  mentalState,
  handleMentalState,
  checklist,
  checked,
  handleChecklist,
  checklistProgress,
  activePrescription,
  prescriptionAnswered,
  updatePrescriptionCompliance,
  preparationComplete,
  setStep,
}) {
  return (
    <>
      <section className="coach-banner">
        <div className="coach-banner-icon">
          <Brain size={24} />
        </div>
        <div>
          <p className="label">IDENTITÉ ACTIVE</p>
          <h2>{primeProfile || "Profil en analyse"}</h2>
          <p>{focus}</p>
        </div>
      </section>

      <section className="card">
        <div className="card-top">
          <Target size={23} className="icon" />
          <p className="label">INTENTION DU JOUR</p>
        </div>

        <h2 className="question">
          Pourquoi ouvres-tu les marchés aujourd’hui ?
        </h2>

        <p className="support-copy">
          Ta réponse ne sera pas jugée. Elle sert à rendre ton intention
          consciente avant le premier clic.
        </p>

        <div className="choice-stack">
          {[
            {
              value: "Exécuter mon plan",
              description: "Je cherche uniquement mes setups prévus.",
            },
            {
              value: "Observer uniquement",
              description:
                "Je peux décider de ne prendre aucun trade aujourd’hui.",
            },
            {
              value: "Récupérer une perte",
              description:
                "Je ressens le besoin de compenser une perte récente.",
              danger: true,
            },
          ].map((option) => (
            <button
              key={option.value}
              className={`intention-card ${
                intention === option.value ? "active" : ""
              } ${option.danger ? "danger" : ""}`}
              onClick={async () => {
                await getActiveSessionId();
                setIntention(option.value);
              }}
            >
              <span className="selection-mark">
                {intention === option.value ? "✓" : ""}
              </span>
              <span>
                <strong>{option.value}</strong>
                <small>{option.description}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-top">
          <Brain size={23} className="icon" />
          <p className="label">ÉTAT MENTAL</p>
        </div>

        <h2 className="question">Dans quel état arrives-tu au marché ?</h2>

        <div className="option-grid">
          {["Calme", "Focus", "Stressé", "Impatient", "Fatigué"].map(
            (state) => (
              <button
                key={state}
                onClick={() => handleMentalState(state)}
                className={
                  mentalState === state ? "option-card active" : "option-card"
                }
              >
                {state}
              </button>
            )
          )}
        </div>
      </section>

      <section className="card checklist-card">
        <div className="card-top">
          <CheckCircle size={23} className="icon" />
          <p className="label">ENGAGEMENT PRÉ-TRADE</p>
        </div>

        <h2 className="question">
          Cette checklist est là pour te protéger.
        </h2>

        <p className="support-copy">
          Chaque validation réduit la place laissée à l’impulsion. Ne coche
          rien par automatisme : engage-toi sur chaque règle.
        </p>

        <div className="progress-meta">
          <span>{checklistProgress}% validé</span>
          <span>
            {Object.values(checked).filter(Boolean).length} / {checklist.length}
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-bar"
            style={{ width: `${checklistProgress}%` }}
          />
        </div>

        <div className="checklist-grid">
          {checklist.map((item, index) => (
            <button
              key={item}
              onClick={() => handleChecklist(item)}
              className={checked[item] ? "check active" : "check"}
            >
              <span className="check-number">
                {checked[item] ? "✓" : index + 1}
              </span>
              <span className="check-text">{item}</span>
            </button>
          ))}
        </div>

        <div className="checklist-reminder">
          <ShieldAlert size={20} />
          <p>
            Une case non validée n’est pas un échec. C’est une information qui
            peut t’éviter une mauvaise décision.
          </p>
        </div>
      </section>

      {activePrescription && (
        <PrescriptionCard
          prescription={activePrescription}
          answered={prescriptionAnswered}
          onAnswer={updatePrescriptionCompliance}
        />
      )}

      <button
        className="gold-button full"
        disabled={!preparationComplete}
        onClick={() => setStep("debrief")}
      >
        Commencer ma session
        <ArrowRight size={20} />
      </button>

      {!preparationComplete && (
        <p className="locked-copy">
          Valide ton intention, ton état mental et chaque engagement avant de
          continuer.
        </p>
      )}
    </>
  );
}

function DebriefStep({
  setStep,
  planRespected,
  handlePlanRespected,
  postMentalState,
  setPostMentalState,
  hasMistake,
  setHasMistake,
  handleNoMistake,
  getActiveSessionId,
  mistakesList,
  selectedMistake,
  handleMistakeChoice,
  customMistake,
  setCustomMistake,
  pnlOutcome,
  setPnlOutcome,
  sessionPnl,
  setSessionPnl,
  improvementNote,
  setImprovementNote,
  debriefComplete,
  finishSession,
  saving,
}) {
  return (
    <>
      <button className="back-button" onClick={() => setStep("preparation")}>
        <ArrowLeft size={18} />
        Revenir à la préparation
      </button>

      <section className="debrief-intro">
        <p className="label">DÉBRIEF PRIME</p>
        <h2>Une session n’est terminée que lorsqu’elle est comprise.</h2>
        <p>
          Réponds avec honnêteté. PRIME mesure ton processus, pas ta valeur.
        </p>
      </section>

      <section className="card">
        <div className="card-top">
          <Target size={23} className="icon" />
          <p className="label">RESPECT DU PLAN</p>
        </div>

        <h2 className="question">
          As-tu respecté le plan défini avant la session ?
        </h2>

        <div className="two-buttons">
          <button
            className={
              planRespected === true
                ? "binary-card success active"
                : "binary-card"
            }
            onClick={() => handlePlanRespected(true)}
          >
            <CircleCheck size={22} />
            Oui
          </button>

          <button
            className={
              planRespected === false
                ? "binary-card danger active"
                : "binary-card"
            }
            onClick={() => handlePlanRespected(false)}
          >
            <CircleX size={22} />
            Non
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-top">
          <Brain size={23} className="icon" />
          <p className="label">MENTAL POST-SESSION</p>
        </div>

        <h2 className="question">Dans quel état termines-tu ?</h2>

        <div className="option-grid">
          {["Satisfait", "Neutre", "Frustré", "Stressé", "Fière", "Déçu"].map(
            (state) => (
              <button
                key={state}
                onClick={() => setPostMentalState(state)}
                className={
                  postMentalState === state
                    ? "option-card active"
                    : "option-card"
                }
              >
                {state}
              </button>
            )
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-top">
          <ShieldAlert size={23} className="icon" />
          <p className="label">LECTURE DE L’ERREUR</p>
        </div>

        <h2 className="question">
          Penses-tu avoir commis une erreur pendant cette session ?
        </h2>

        <p className="support-copy">
          Il est parfaitement possible qu’il n’y en ait aucune. Ne cherche pas
          une erreur pour remplir la case.
        </p>

        <div className="two-buttons">
          <button
            className={
              hasMistake === false
                ? "binary-card success active"
                : "binary-card"
            }
            onClick={handleNoMistake}
          >
            <CircleCheck size={22} />
            Non
          </button>

          <button
            className={
              hasMistake === true
                ? "binary-card danger active"
                : "binary-card"
            }
            onClick={async () => {
              await getActiveSessionId();
              setHasMistake(true);
            }}
          >
            <CircleX size={22} />
            Oui
          </button>
        </div>

        {hasMistake === true && (
          <div className="mistake-zone">
            <p className="mistake-prompt">Si oui, laquelle ?</p>

            <div className="mistake-grid">
              {mistakesList.map((mistake) => (
                <button
                  key={mistake}
                  onClick={() => handleMistakeChoice(mistake)}
                  className={`mistake-card ${
                    selectedMistake === mistake ? "active" : ""
                  }`}
                >
                  <span>{getMistakeCode(mistake)}</span>
                  <strong>{mistake}</strong>
                </button>
              ))}
            </div>

            {selectedMistake === "Autre" && (
              <textarea
                value={customMistake}
                onChange={(e) => setCustomMistake(e.target.value)}
                placeholder="Décris brièvement l’erreur observée..."
                className="note"
              />
            )}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-top">
          <TrendingUp size={23} className="icon" />
          <p className="label">RÉSULTAT FINANCIER</p>
        </div>

        <h2 className="question">Comment s’est terminée la session ?</h2>

        <div className="outcome-grid">
          {["Gain", "Stop", "BE"].map((outcome) => (
            <button
              key={outcome}
              className={`outcome-card ${outcome.toLowerCase()} ${
                pnlOutcome === outcome ? "active" : ""
              }`}
              onClick={() => {
                setPnlOutcome(outcome);
                if (outcome === "BE") setSessionPnl("0");
              }}
            >
              <BarChart3 size={21} />
              <strong>{outcome === "BE" ? "Break Even" : outcome}</strong>
            </button>
          ))}
        </div>

        {pnlOutcome && pnlOutcome !== "BE" && (
          <div className="amount-field">
            <label>Montant en euros</label>
            <div className="amount-input-wrap">
              <span>{pnlOutcome === "Gain" ? "+" : "−"}</span>
              <input
                type="number"
                min="0"
                value={sessionPnl}
                onChange={(e) => setSessionPnl(e.target.value)}
                placeholder="0"
              />
              <span>€</span>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-top">
          <Sparkles size={23} className="icon" />
          <p className="label">TRACE PERSONNELLE</p>
        </div>

        <h2 className="question">Ce que je retiens aujourd’hui</h2>

        <textarea
          value={improvementNote}
          onChange={(e) => setImprovementNote(e.target.value)}
          placeholder="Une leçon, un comportement à conserver ou un point à corriger..."
          className="note"
        />
      </section>

      <section className="final-card">
        <div>
          <p className="label">PRÊTE À CLÔTURER</p>
          <h2>PRIME va maintenant analyser ta session.</h2>
          <p>
            Ton score ne sera affiché qu’après l’enregistrement afin de
            préserver l’honnêteté de tes réponses.
          </p>
        </div>

        <button
          className="gold-button full"
          onClick={finishSession}
          disabled={!debriefComplete || saving}
        >
          <Save size={20} />
          {saving ? "Enregistrement..." : "Terminer ma session"}
        </button>

        {!debriefComplete && (
          <p className="locked-copy">
            Complète le plan, le mental, la lecture d’erreur et le résultat
            financier.
          </p>
        )}
      </section>
    </>
  );
}

function ProgressHeader({ step }) {
  const preparationActive = step === "preparation";

  return (
    <div className="stepper">
      <div className="stepper-item active">
        <span>{preparationActive ? "1" : "✓"}</span>
        <div>
          <strong>Préparation</strong>
          <small>Intention et engagement</small>
        </div>
      </div>

      <div className={preparationActive ? "step-line" : "step-line active"} />

      <div className={preparationActive ? "stepper-item" : "stepper-item active"}>
        <span>2</span>
        <div>
          <strong>Débrief</strong>
          <small>Lecture de la session</small>
        </div>
      </div>
    </div>
  );
}

function PrescriptionCard({ prescription, answered, onAnswer }) {
  return (
    <section className="card prescription-card">
      <div className="card-top">
        <Target size={23} className="icon" />
        <p className="label">MISSION DU MOMENT</p>
      </div>

      <h2 className="card-title small">{prescription.title}</h2>
      <p className="text">{prescription.rule}</p>

      <p className="text">
        Progression : {prescription.compliance_days || 0} /{" "}
        {prescription.duration_days || 7} jours
      </p>

      {answered ? (
        <p className="success-text">Mission renseignée aujourd’hui</p>
      ) : (
        <div className="two-buttons">
          <button
            className="binary-card success"
            onClick={() => onAnswer(true)}
          >
            Respectée
          </button>

          <button
            className="binary-card danger"
            onClick={() => onAnswer(false)}
          >
            Non respectée
          </button>
        </div>
      )}
    </section>
  );
}

function getMistakeCode(mistake) {
  const codes = {
    "Revenge trade": "REVENGE",
    Overtrading: "OVER",
    "Entrée FOMO": "FOMO",
    "Stop déplacé": "STOP",
    "Trade hors plan": "HORS PLAN",
    Autre: "AUTRE",
  };

  return codes[mistake] || "ERREUR";
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
        "Je sais exactement pourquoi j’entre",
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
        "Je connais mon risque maximal",
        "J’accepte de ne prendre aucun trade aujourd’hui",
      ];
  }
}

function getFocusMessage(profile) {
  switch (profile) {
    case "Trader Impulsif":
      return "Ralentis avant d’agir. Tu ne cherches pas une opportunité, tu valides une décision.";
    case "Trader Désorganisé":
      return "Structure ton plan avant l’exécution. Pas de cadre, pas de trade.";
    case "Trader FOMO":
      return "Laisse partir les opportunités incomplètes. Ton edge est dans l’attente.";
    default:
      return "Respecte le processus avant le résultat.";
  }
}


function BaseStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: #050505;
      }

      button,
      input,
      textarea {
        font: inherit;
      }

      button {
        -webkit-tap-highlight-color: transparent;
      }

      .session-page {
        min-height: 100vh;
        padding: 30px 18px 128px;
        color: white;
        font-family: Inter, Arial, sans-serif;
        background: #050505;
      }

      .center-screen {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 30px;
      }

      .page {
        max-width: 460px;
        margin: 0 auto;
      }

      .hero {
        margin-bottom: 22px;
        animation: fadeUp .45s ease both;
      }

      .hero-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      .brand {
        color: #D4B06A;
        letter-spacing: 6px;
        font-size: 13px;
        text-transform: uppercase;
        margin: 0 0 18px;
        font-weight: 900;
      }

      .session-index {
        color: rgba(255,255,255,0.48);
        font-size: 12px;
        font-weight: 850;
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
        max-width: 390px;
        font-size: 17px;
        line-height: 1.55;
        color: rgba(255,255,255,0.62);
      }

      .card,
      .coach-banner,
      .final-card,
      .score-card,
      .completion-message {
        border-radius: 26px;
        background: #101010;
        border: 1px solid rgba(255,255,255,0.07);
        box-shadow: 0 18px 45px rgba(0,0,0,0.38);
      }

      .card {
        padding: 22px;
        margin-bottom: 14px;
        animation: fadeUp .42s ease both;
      }

      .coach-banner {
        display: grid;
        grid-template-columns: 52px 1fr;
        gap: 15px;
        align-items: start;
        padding: 20px;
        margin-bottom: 14px;
        border-color: rgba(212,176,106,0.18);
        background:
          radial-gradient(circle at top right, rgba(212,176,106,0.10), transparent 42%),
          #101010;
      }

      .coach-banner-icon {
        width: 52px;
        height: 52px;
        border-radius: 17px;
        display: grid;
        place-items: center;
        color: #D4B06A;
        background: rgba(212,176,106,0.09);
        border: 1px solid rgba(212,176,106,0.18);
      }

      .coach-banner h2 {
        margin: 0;
        color: #D4B06A;
        font-size: 21px;
        line-height: 1.15;
        font-weight: 950;
      }

      .coach-banner p:last-child {
        margin: 8px 0 0;
        color: rgba(255,255,255,0.65);
        font-size: 14px;
        line-height: 1.5;
      }

      .label {
        color: #D4B06A;
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 900;
        margin: 0 0 12px;
      }

      .card-top {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
      }

      .card-top .label {
        margin: 0;
      }

      .icon {
        color: #D4B06A;
        flex: 0 0 auto;
      }

      .question {
        margin: 0;
        color: white;
        font-size: 22px;
        line-height: 1.25;
        font-weight: 950;
        letter-spacing: -0.45px;
      }

      .support-copy,
      .text {
        margin: 12px 0 0;
        color: rgba(255,255,255,0.64);
        font-size: 14.5px;
        line-height: 1.55;
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

      .stepper {
        display: grid;
        grid-template-columns: 1fr 32px 1fr;
        align-items: center;
        gap: 8px;
        margin-bottom: 18px;
        padding: 14px;
        border-radius: 22px;
        background: rgba(255,255,255,0.025);
        border: 1px solid rgba(255,255,255,0.06);
      }

      .stepper-item {
        display: flex;
        align-items: center;
        gap: 9px;
        opacity: .42;
      }

      .stepper-item.active {
        opacity: 1;
      }

      .stepper-item > span {
        width: 30px;
        height: 30px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.09);
        font-size: 12px;
        font-weight: 950;
      }

      .stepper-item.active > span {
        background: #D4B06A;
        color: #050505;
        border-color: #D4B06A;
      }

      .stepper-item strong,
      .stepper-item small {
        display: block;
      }

      .stepper-item strong {
        font-size: 12px;
      }

      .stepper-item small {
        margin-top: 3px;
        font-size: 9.5px;
        color: rgba(255,255,255,0.55);
      }

      .step-line {
        height: 1px;
        background: rgba(255,255,255,0.11);
      }

      .step-line.active {
        background: #D4B06A;
      }

      .choice-stack {
        display: grid;
        gap: 10px;
        margin-top: 18px;
      }

      .intention-card {
        width: 100%;
        display: grid;
        grid-template-columns: 30px 1fr;
        align-items: start;
        gap: 12px;
        padding: 15px;
        text-align: left;
        color: white;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.035);
        cursor: pointer;
        transition: transform .18s ease, border-color .18s ease, background .18s ease;
      }

      .intention-card:active,
      .option-card:active,
      .check:active,
      .mistake-card:active,
      .outcome-card:active {
        transform: scale(.985);
      }

      .intention-card.active {
        border-color: rgba(212,176,106,0.44);
        background: rgba(212,176,106,0.09);
      }

      .intention-card.danger.active {
        border-color: rgba(240,91,91,0.42);
        background: rgba(240,91,91,0.09);
      }

      .selection-mark {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        border: 1px solid rgba(255,255,255,0.14);
        color: #050505;
        font-weight: 950;
      }

      .intention-card.active .selection-mark {
        background: #D4B06A;
        border-color: #D4B06A;
      }

      .intention-card.danger.active .selection-mark {
        background: #F05B5B;
        border-color: #F05B5B;
      }

      .intention-card strong,
      .intention-card small {
        display: block;
      }

      .intention-card strong {
        font-size: 15px;
      }

      .intention-card small {
        margin-top: 5px;
        color: rgba(255,255,255,0.57);
        font-size: 12.5px;
        line-height: 1.4;
      }

      .option-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
        margin-top: 17px;
      }

      .option-card {
        min-height: 52px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.82);
        font-weight: 850;
        cursor: pointer;
        transition: transform .18s ease, border-color .18s ease, background .18s ease;
      }

      .option-card.active {
        color: #050505;
        border-color: #D4B06A;
        background: #D4B06A;
      }

      .progress-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        color: rgba(255,255,255,0.58);
        font-size: 12px;
        font-weight: 850;
      }

      .progress-track {
        height: 8px;
        width: 100%;
        margin: 9px 0 17px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255,255,255,0.08);
      }

      .progress-bar {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #98702d, #D4B06A, #fff0b0);
        transition: width .35s ease;
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
        padding: 14px;
        text-align: left;
        color: rgba(255,255,255,0.79);
        border-radius: 17px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.035);
        cursor: pointer;
        transition: transform .18s ease, border-color .18s ease, background .18s ease;
      }

      .check.active {
        color: white;
        border-color: rgba(212,176,106,0.35);
        background: rgba(212,176,106,0.08);
      }

      .check-number {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        border-radius: 9px;
        color: rgba(255,255,255,0.48);
        border: 1px solid rgba(255,255,255,0.13);
        font-size: 12px;
        font-weight: 950;
      }

      .check.active .check-number {
        color: #050505;
        background: #D4B06A;
        border-color: #D4B06A;
        animation: checkPulse .28s ease;
      }

      .check-text {
        font-size: 14px;
        line-height: 1.45;
        font-weight: 780;
      }

      .checklist-reminder {
        display: grid;
        grid-template-columns: 24px 1fr;
        gap: 10px;
        margin-top: 17px;
        padding: 14px;
        color: #D4B06A;
        border-radius: 17px;
        background: rgba(212,176,106,0.055);
        border: 1px solid rgba(212,176,106,0.13);
      }

      .checklist-reminder p {
        margin: 0;
        color: rgba(255,255,255,0.65);
        font-size: 12.5px;
        line-height: 1.5;
      }

      .gold-button,
      .secondary-button,
      .back-button {
        border: none;
        cursor: pointer;
        font-weight: 950;
      }

      .gold-button {
        min-height: 56px;
        padding: 15px 18px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: #050505;
        background: linear-gradient(95deg, #9d742f, #d6b25f 52%, #fff2b8);
        box-shadow: 0 18px 42px rgba(212,176,106,0.13);
      }

      .gold-button.full {
        width: 100%;
      }

      .gold-button:disabled {
        opacity: .32;
        cursor: not-allowed;
        box-shadow: none;
      }

      .locked-copy {
        margin: 10px 10px 18px;
        color: rgba(255,255,255,0.38);
        text-align: center;
        font-size: 11.5px;
        line-height: 1.45;
      }

      .back-button {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px;
        padding: 10px 0;
        color: rgba(255,255,255,0.62);
        background: transparent;
      }

      .debrief-intro {
        margin-bottom: 15px;
        padding: 20px;
        border-radius: 24px;
        background:
          radial-gradient(circle at top right, rgba(212,176,106,0.10), transparent 40%),
          rgba(255,255,255,0.025);
        border: 1px solid rgba(212,176,106,0.13);
      }

      .debrief-intro h2 {
        margin: 0;
        color: white;
        font-size: 24px;
        line-height: 1.18;
        font-weight: 950;
      }

      .debrief-intro > p:last-child {
        margin: 10px 0 0;
        color: rgba(255,255,255,0.61);
        font-size: 14px;
        line-height: 1.5;
      }

      .two-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 17px;
      }

      .binary-card {
        min-height: 54px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        padding: 13px;
        color: white;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.09);
        background: rgba(255,255,255,0.04);
        font-weight: 900;
        cursor: pointer;
      }

      .binary-card.success.active {
        color: #6BE28B;
        border-color: rgba(107,226,139,0.38);
        background: rgba(107,226,139,0.12);
      }

      .binary-card.danger.active {
        color: #F05B5B;
        border-color: rgba(240,91,91,0.38);
        background: rgba(240,91,91,0.12);
      }

      .mistake-zone {
        margin-top: 20px;
        padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.07);
        animation: fadeUp .3s ease both;
      }

      .mistake-prompt {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 900;
      }

      .mistake-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9px;
      }

      .mistake-card {
        min-height: 86px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        padding: 14px;
        text-align: left;
        color: white;
        border-radius: 17px;
        border: 1px solid rgba(240,91,91,0.18);
        background:
          linear-gradient(145deg, rgba(240,91,91,0.08), rgba(255,255,255,0.018));
        cursor: pointer;
        transition: transform .18s ease, border-color .18s ease, background .18s ease;
      }

      .mistake-card span {
        color: #F05B5B;
        font-size: 10px;
        letter-spacing: 1.7px;
        font-weight: 950;
      }

      .mistake-card strong {
        font-size: 14px;
        line-height: 1.25;
      }

      .mistake-card.active {
        border-color: #F05B5B;
        background: rgba(240,91,91,0.15);
      }

      .outcome-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 9px;
        margin-top: 18px;
      }

      .outcome-card {
        min-height: 88px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 9px;
        color: white;
        border-radius: 17px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.035);
        cursor: pointer;
      }

      .outcome-card.gain.active {
        color: #6BE28B;
        border-color: rgba(107,226,139,0.38);
        background: rgba(107,226,139,0.11);
      }

      .outcome-card.stop.active {
        color: #F05B5B;
        border-color: rgba(240,91,91,0.38);
        background: rgba(240,91,91,0.11);
      }

      .outcome-card.be.active {
        color: #D4B06A;
        border-color: rgba(212,176,106,0.38);
        background: rgba(212,176,106,0.11);
      }

      .amount-field {
        margin-top: 18px;
        padding-top: 17px;
        border-top: 1px solid rgba(255,255,255,0.07);
      }

      .amount-field label {
        display: block;
        margin-bottom: 9px;
        color: rgba(255,255,255,0.54);
        font-size: 12px;
        font-weight: 850;
      }

      .amount-input-wrap {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
        padding: 13px 15px;
        border-radius: 17px;
        border: 1px solid rgba(255,255,255,0.09);
        background: rgba(255,255,255,0.035);
        color: #D4B06A;
        font-size: 22px;
        font-weight: 950;
      }

      .amount-input-wrap input {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: white;
        font-size: 28px;
        font-weight: 950;
      }

      .note {
        width: 100%;
        min-height: 110px;
        margin-top: 16px;
        padding: 15px;
        resize: vertical;
        outline: none;
        color: white;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.035);
        font-size: 15px;
        line-height: 1.5;
        font-family: Inter, Arial, sans-serif;
      }

      .note::placeholder,
      .amount-input-wrap input::placeholder {
        color: rgba(255,255,255,0.28);
      }

      .final-card {
        padding: 22px;
        margin-bottom: 18px;
        border-color: rgba(212,176,106,0.15);
        background:
          radial-gradient(circle at top right, rgba(212,176,106,0.10), transparent 42%),
          #101010;
      }

      .final-card h2 {
        margin: 0;
        font-size: 25px;
        line-height: 1.2;
        font-weight: 950;
      }

      .final-card > div > p:last-child {
        margin: 10px 0 20px;
        color: rgba(255,255,255,0.62);
        font-size: 14px;
        line-height: 1.5;
      }

      .success-text {
        margin-top: 14px;
        color: #6BE28B;
        font-weight: 900;
      }

      .analysis-loader {
        max-width: 360px;
        text-align: center;
      }

      .analysis-orbit {
        width: 92px;
        height: 92px;
        display: grid;
        place-items: center;
        margin: 0 auto 24px;
        color: #D4B06A;
        border-radius: 50%;
        border: 1px solid rgba(212,176,106,0.26);
        background: rgba(212,176,106,0.07);
        box-shadow: 0 0 50px rgba(212,176,106,0.12);
        animation: orbitPulse 1.1s ease-in-out infinite;
      }

      .analysis-loader .brand {
        margin-bottom: 12px;
      }

      .analysis-title {
        margin: 0;
        font-size: 34px;
        line-height: 1.1;
        font-weight: 950;
      }

      .analysis-copy {
        margin: 13px auto 0;
        color: rgba(255,255,255,0.62);
        font-size: 15px;
        line-height: 1.55;
      }

      .score-card {
        padding: 22px;
        display: grid;
        grid-template-columns: 116px 1fr;
        gap: 18px;
        align-items: center;
        margin-bottom: 14px;
      }

      .score-ring {
        width: 116px;
        height: 116px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        border-radius: 50%;
        background:
          conic-gradient(#D4B06A var(--score), rgba(255,255,255,0.10) 0deg);
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

      .result-list {
        display: grid;
        gap: 10px;
        margin-top: 16px;
      }

      .result-list div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 9px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .result-list span {
        color: rgba(255,255,255,0.48);
        font-size: 12px;
      }

      .result-list strong {
        text-align: right;
        font-size: 13px;
      }

      .completion-message {
        display: grid;
        grid-template-columns: 28px 1fr;
        gap: 12px;
        padding: 18px;
        margin-bottom: 14px;
        color: #6BE28B;
        border-color: rgba(107,226,139,0.16);
        background: rgba(107,226,139,0.055);
      }

      .completion-message strong {
        color: white;
        font-size: 15px;
      }

      .completion-message p {
        margin: 6px 0 0;
        color: rgba(255,255,255,0.61);
        font-size: 13px;
        line-height: 1.45;
      }

      .cta-stack {
        display: grid;
        gap: 10px;
      }

      .secondary-button {
        width: 100%;
        min-height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        padding: 14px 18px;
        color: white;
        border-radius: 17px;
        border: 1px solid rgba(255,255,255,0.08);
        background: #101010;
      }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes checkPulse {
        0% { transform: scale(.75); }
        70% { transform: scale(1.12); }
        100% { transform: scale(1); }
      }

      @keyframes orbitPulse {
        0%, 100% { transform: scale(1); opacity: .72; }
        50% { transform: scale(1.07); opacity: 1; }
      }

      @media(max-width:390px) {
        .session-page {
          padding-left: 14px;
          padding-right: 14px;
        }

        .title {
          font-size: 40px;
        }

        .stepper {
          grid-template-columns: 1fr 20px 1fr;
          padding: 12px;
        }

        .stepper-item > div {
          display: none;
        }

        .stepper-item {
          justify-content: center;
        }

        .score-card {
          grid-template-columns: 1fr;
        }

        .score-ring {
          margin: 0 auto;
        }

        .outcome-grid {
          gap: 7px;
        }
      }
    `}</style>
  );
}

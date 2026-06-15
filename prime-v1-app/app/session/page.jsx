"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SessionPage() {
  const [discipline, setDiscipline] = useState(false);
  const [mentalState, setMentalState] = useState("");
  const [checked, setChecked] = useState({});
  const [mistakes, setMistakes] = useState({});
  const [disciplineScore, setDisciplineScore] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [activePrescription, setActivePrescription] = useState(null);
  const [prescriptionAnswered, setPrescriptionAnswered] = useState(false);
const [primeProfile, setPrimeProfile] = useState(null);
  
  useEffect(() => {
    loadActivePrescription();
  }, []);

 const getChecklistByProfile = () => {
  switch (primeProfile) {

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
};

const checklist = getChecklistByProfile();
const getFocusMessage = () => {
  switch (primeProfile) {
    case "Trader Impulsif":
      return "Attendre la confirmation avant d'agir.";

    case "Trader Désorganisé":
      return "Structurer le plan avant l'exécution.";

    case "Trader FOMO":
      return "Accepter de laisser partir les opportunités.";

    default:
      return "Respecter le process avant le résultat.";
  }
};
  const mistakesList = [
    "Revenge trade",
    "Overtrading",
    "Entrée FOMO",
    "Stop déplacé",
    "Trade hors plan",
  ];

  const today = new Date().toISOString().split("T")[0];

  const loadActivePrescription = async () => {
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

if (profileData) {
  setPrimeProfile(profileData.profile);
}
    const { data } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setActivePrescription(data);
      setPrescriptionAnswered(data.last_check_date === today);
    }
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

  if (successRate >= 0.8) {
    result = "success";
  } else if (successRate >= 0.6) {
    result = "partial";
  } else {
    result = "failed";
  }
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

  const calculateScore = (updatedChecks, updatedMistakes) => {
    const checkedCount = Object.values(updatedChecks).filter(Boolean).length;
    const baseScore = Math.round((checkedCount / checklist.length) * 100);
    const mistakeCount = Object.values(updatedMistakes).filter(Boolean).length;
    const malus = mistakeCount * 15;

    return Math.max(baseScore - malus, 0);
  };

  const getActiveSessionId = async () => {
    if (activeSessionId) return activeSessionId;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
      .from("sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    setActiveSessionId(data.id);
    setDiscipline(true);

    return data.id;
  };

  const activateDiscipline = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Utilisateur non connecté");
      return;
    }

    await supabase
      .from("sessions")
      .update({ status: "closed" })
      .eq("user_id", user.id)
      .eq("status", "active");

    const { data, error } = await supabase
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
      return;
    }

    setActiveSessionId(data.id);
    setDiscipline(true);
    setMentalState("");
    setDisciplineScore(0);
    setChecked({});
    setMistakes({});
    setSessionFinished(false);
  };

  const handleMentalState = async (state) => {
    const sessionId = await getActiveSessionId();

    if (!sessionId) {
      alert("Active d'abord ta discipline.");
      return;
    }

    setMentalState(state);

    await supabase
      .from("sessions")
      .update({ mental_state: state })
      .eq("id", sessionId);
  };

  const handleChecklist = async (item) => {
    const sessionId = await getActiveSessionId();

    if (!sessionId) {
      alert("Active d'abord ta discipline.");
      return;
    }

    const updatedChecks = {
      ...checked,
      [item]: !checked[item],
    };

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

    if (!sessionId) {
      alert("Active d'abord ta discipline.");
      return;
    }

    const updatedMistakes = {
      ...mistakes,
      [mistake]: !mistakes[mistake],
    };

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

  const finishSession = async () => {
    const sessionId = await getActiveSessionId();

    if (!sessionId) {
      alert("Aucune session active");
      return;
    }

    await supabase
      .from("sessions")
      .update({
        status: "closed",
        discipline_score: disciplineScore,
        mental_state: mentalState || null,
      })
      .eq("id", sessionId);

    setSessionFinished(true);
  };

  if (sessionFinished) {
    return (
      <main style={page}>
        <div style={container}>
          <button style={backButton} onClick={() => (window.location.href = "/")}>
            ← Retour
          </button>

          <p style={eyebrow}>SESSION TERMINÉE</p>

          <h1 style={heading}>
            Bravo.
            <br />
            Session clôturée.
          </h1>
<section style={card}>
  <h2 style={title}>Identité active</h2>

  <p
    style={{
      color: "#D4B06A",
      fontSize: "28px",
      fontWeight: "900",
      marginBottom: "16px",
    }}
  >
    {primeProfile || "Profil en cours d'analyse"}
  </p>

  <p style={text}>
    Focus du jour : {getFocusMessage()}
  </p>
</section>
          <section style={card}>
            <h2 style={title}>Résumé PRIME</h2>

            <p style={text}>Score discipline : {disciplineScore}%</p>
            <p style={text}>État mental : {mentalState || "Non renseigné"}</p>
            <p style={text}>XP gagnée : +40 XP</p>
            <p style={text}>Streak : +1 jour</p>
          </section>

          <button style={goldButton} onClick={() => (window.location.href = "/coach")}>
            Voir mon Coach
          </button>

          <button style={secondaryButton} onClick={() => (window.location.href = "/journal")}>
            Voir mon Journal
          </button>

          <button style={secondaryButton} onClick={() => (window.location.href = "/")}>
            Retour Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={container}>
        <button style={backButton} onClick={() => (window.location.href = "/")}>
          ← Retour
        </button>

        <p style={eyebrow}>PRIME SESSION</p>

        <h1 style={heading}>
          Session
          <br />
          Trading
        </h1>

        {activePrescription && (
          <section style={card}>
            <h2 style={title}>Prescription active</h2>

            <p style={text}>{activePrescription.title}</p>

            <p style={prescriptionRule}>{activePrescription.rule}</p>

            <p style={text}>
              Progression : {activePrescription.compliance_days || 0} jour(s)
              respecté(s) / {activePrescription.duration_days || 7}
            </p>

            {prescriptionAnswered ? (
              <p style={successText}>
                Prescription renseignée aujourd’hui ✅
              </p>
            ) : (
              <>
                <p style={text}>
                  As-tu respecté cette prescription aujourd’hui ?
                </p>

                <button
                  style={goldButton}
                  onClick={() => updatePrescriptionCompliance(true)}
                >
                  Oui, respectée
                </button>

                <button
                  style={secondaryButton}
                  onClick={() => updatePrescriptionCompliance(false)}
                >
                  Non, pas respectée
                </button>
              </>
            )}
          </section>
        )}

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
                    mentalState === state ? "#D4B06A" : "rgba(255,255,255,0.06)",
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
          <p style={scoreText}>{disciplineScore}%</p>
          <p style={text}>
            Ton score évolue selon le respect de ton process et tes erreurs
            comportementales.
          </p>
        </section>

        <section style={card}>
          <h2 style={title}>Checklist pré-trade</h2>
          <p style={text}>Tu ne cherches pas un trade. Tu valides un plan.</p>

          {checklist.map((item) => (
            <div
              key={item}
              onClick={() => handleChecklist(item)}
              style={checkItem}
            >
              <span>{checked[item] ? "✅" : "⬜"}</span>
              <span>{item}</span>
            </div>
          ))}
        </section>

        <section style={card}>
          <h2 style={title}>Erreurs comportementales</h2>
          <p style={text}>
            PRIME détecte les comportements qui détruisent ta discipline.
          </p>

          {mistakesList.map((mistake) => (
            <div
              key={mistake}
              onClick={() => handleMistake(mistake)}
              style={checkItem}
            >
              <span>{mistakes[mistake] ? "❌" : "⬜"}</span>
              <span>{mistake}</span>
            </div>
          ))}
        </section>

        <section style={card}>
          <h2 style={title}>Fin de session</h2>
          <p style={text}>
            Lorsque ton trading est terminé, clôture la session pour envoyer les
            données à PRIME Coach.
          </p>

          <button onClick={finishSession} style={goldButton}>
            TERMINER MA SESSION
          </button>
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

const backButton = {
  background: "transparent",
  border: "1px solid rgba(212,176,106,0.22)",
  color: "#D4B06A",
  borderRadius: "999px",
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  marginBottom: "24px",
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

const successText = {
  color: "#7DFFA1",
  fontSize: "17px",
  fontWeight: "800",
  lineHeight: "1.6",
};

const prescriptionRule = {
  color: "#fff",
  fontSize: "20px",
  fontWeight: "900",
  lineHeight: "1.5",
  marginBottom: "22px",
};

const scoreText = {
  fontSize: "54px",
  fontWeight: "900",
  color: "#D4B06A",
  margin: "10px 0",
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

const goldButton = {
  width: "100%",
  border: "none",
  borderRadius: "18px",
  padding: "18px",
  fontSize: "16px",
  fontWeight: "900",
  cursor: "pointer",
  background: "#D4B06A",
  color: "#000",
  marginBottom: "14px",
};

const secondaryButton = {
  width: "100%",
  border: "1px solid rgba(212,176,106,0.22)",
  borderRadius: "18px",
  padding: "18px",
  fontSize: "16px",
  fontWeight: "800",
  cursor: "pointer",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  marginBottom: "14px",
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

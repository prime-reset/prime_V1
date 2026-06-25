"use client";

import { useEffect, useState } from "react";
import {
  User,
  Crown,
  Flame,
  ShieldCheck,
  Target,
  Sparkles,
  CheckCircle,
  TrendingUp,
  CalendarDays,
  Trophy,
  Activity,
  BookOpen,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("Trader");
  const [primeProfile, setPrimeProfile] = useState(null);
  const [identityHistory, setIdentityHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activePrescription, setActivePrescription] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const savedProfile = localStorage.getItem("primeProfile");

    if (savedProfile) {
      try {
        setPrimeProfile(JSON.parse(savedProfile));
      } catch {
        localStorage.removeItem("primeProfile");
      }
    }

    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (profileData?.display_name) setDisplayName(profileData.display_name);

    if (profileData?.detected_profile) {
      setPrimeProfile({
        detectedProfile: profileData.detected_profile,
        risk: profileData.risk,
        strength: profileData.strength,
        weakness: profileData.weakness,
        prescription: profileData.prescription,
        checklist: profileData.checklist || [],
      });
    }

    const { data: identityData } = await supabase
      .from("prime_identity_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (identityData) setIdentityHistory(identityData);

    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "closed")
      .order("created_at", { ascending: false });

    if (sessionsData) setSessions(sessionsData);

    const { data: activePrescriptionData } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activePrescriptionData) setActivePrescription(activePrescriptionData);

    const { data: completedPrescriptionData } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(10);

    if (completedPrescriptionData) setPrescriptions(completedPrescriptionData);
  };

  const scores = sessions
    .map((s) => Number(s.discipline_score))
    .filter((score) => !Number.isNaN(score));

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const totalPnl = sessions.reduce(
    (total, s) => total + Number(s.session_pnl || 0),
    0
  );

  const respectedPlans = sessions.filter((s) => s.plan_respected === true).length;
  const planRespectRate =
    sessions.length > 0 ? Math.round((respectedPlans / sessions.length) * 100) : 0;

  const completedPrescriptions = prescriptions.length;
  const level = getPrimeLevel(averageScore, sessions.length);
  const nextLevel = getNextLevel(averageScore, sessions.length);
  const levelProgress = getLevelProgress(averageScore, sessions.length);

  const currentIdentity =
    identityHistory[0]?.profile ||
    primeProfile?.detectedProfile ||
    "Profil en construction";

  const previousIdentity = identityHistory[1]?.profile || "Premier profil";

  const dominantError = getDominantValue(
    sessions.map((s) => s.dominant_error).filter(Boolean)
  );

  const dominantMental = getDominantValue(
    sessions.map((s) => s.post_mental_state || s.mental_state).filter(Boolean)
  );

  const weekDays = getCurrentWeekData(sessions);
  const weekPnl = weekDays.reduce((sum, day) => sum + day.pnl, 0);
  const weekPlanRate = getWeekPlanRate(weekDays);

  const activePrescriptionProgress = activePrescription
    ? (activePrescription.compliance_days || 0) +
      (activePrescription.missed_days || 0)
    : 0;

  const activePrescriptionDuration = activePrescription?.duration_days || 7;

  const activePrescriptionPercent = activePrescription
    ? Math.min(
        Math.round((activePrescriptionProgress / activePrescriptionDuration) * 100),
        100
      )
    : 0;

  return (
    <main className="profile-page">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
        .profile-page {
          min-height: 100vh;
          padding: 32px 20px 150px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(circle at top right, rgba(212,176,106,0.15), transparent 34%),
            linear-gradient(180deg, #050505 0%, #000 100%);
        }
        .page { max-width: 460px; margin: 0 auto; }
        .brand { color: #D4B06A; letter-spacing: 6px; font-size: 14px; text-transform: uppercase; margin-bottom: 18px; }
        .title { font-size: 56px; line-height: 0.94; font-weight: 900; letter-spacing: -3px; margin: 0; }
        .title span { display: block; color: rgba(255,255,255,0.88); }
        .subtitle { margin-top: 24px; font-size: 18px; line-height: 1.7; color: rgba(255,255,255,0.68); margin-bottom: 30px; }
        .card {
          position: relative;
          overflow: hidden;
          padding: 26px;
          margin-bottom: 18px;
          border-radius: 34px;
          background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(22px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .gold-card {
          border: 1px solid rgba(212,176,106,0.22);
          background: radial-gradient(circle at top right, rgba(212,176,106,0.16), transparent 38%), linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), rgba(5,5,5,0.82);
        }
        .icon-box { width: 54px; height: 54px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; background: rgba(212,176,106,0.10); border: 1px solid rgba(212,176,106,0.18); color: #D4B06A; }
        .card-label { color: rgba(212,176,106,0.82); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px; }
        .card-title { font-size: 29px; line-height: 1.18; font-weight: 900; margin: 0; color: #D4B06A; }
        .text { margin-top: 18px; font-size: 17px; line-height: 1.75; color: rgba(255,255,255,0.72); }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
        .mini-card { padding: 20px; border-radius: 26px; background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), rgba(5,5,5,0.78); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); }
        .mini-label { margin-top: 14px; font-size: 12px; color: rgba(212,176,106,0.82); letter-spacing: 2px; text-transform: uppercase; }
        .mini-value { margin-top: 10px; font-size: 25px; font-weight: 900; line-height: 1.08; }
        .progress-track { margin-top: 20px; height: 12px; width: 100%; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .progress-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #9d742f, #D4B06A, #fff2b8); }
        .evolution { display: grid; gap: 12px; margin-top: 20px; }
        .evolution-item { padding: 16px; border-radius: 22px; background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.08); }
        .evolution-date { color: rgba(255,255,255,0.46); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
        .evolution-profile { color: white; font-size: 18px; font-weight: 900; }
        .badge-grid { display: grid; gap: 12px; margin-top: 20px; }
        .badge { padding: 16px; border-radius: 22px; background: rgba(212,176,106,0.08); border: 1px solid rgba(212,176,106,0.16); }
        .badge.locked { opacity: 0.42; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); }
        .badge-title { margin: 0; color: white; font-weight: 900; font-size: 16px; }
        .badge-text { margin: 8px 0 0; color: rgba(255,255,255,0.66); font-size: 14px; line-height: 1.5; }
        .list-item { display: flex; align-items: flex-start; gap: 12px; margin-top: 16px; }
        .list-text { margin: 0; color: rgba(255,255,255,0.78); font-size: 16px; line-height: 1.6; }
        .week-dots { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-top: 20px; }
        .week-dot { min-height: 56px; border-radius: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border: 1px solid rgba(255,255,255,0.08); }
        .week-label { font-size: 11px; color: rgba(255,255,255,0.70); font-weight: 800; }
        .week-pnl { font-size: 11px; color: rgba(255,255,255,0.82); font-weight: 900; }
        @media(max-width:520px) { .title { font-size: 50px; } .grid { grid-template-columns: 1fr; } }
        @media(max-width:390px) { .week-dots { gap: 6px; } .week-dot { min-height: 52px; border-radius: 15px; } }
      `}</style>

      <div className="page">
        <section>
          <div className="brand">ADN TRADER</div>
          <h1 className="title">Profil<span>PRIME.</span></h1>
          <p className="subtitle">
            Bonjour {displayName}. Ici, PRIME suit ton évolution, ton niveau,
            tes comportements et ta progression réelle de trader.
          </p>
        </section>

        <section className="card gold-card">
          <div className="icon-box"><Crown size={26} /></div>
          <div className="card-label">NIVEAU PRIME</div>
          <h2 className="card-title">{level}</h2>
          <p className="text">
            Identité actuelle : <strong>{currentIdentity}</strong><br />
            Prochain objectif : <strong>{nextLevel}</strong>
          </p>
          <div className="progress-track"><div className="progress-bar" style={{ width: `${levelProgress}%` }} /></div>
          <p className="text">Progression vers le prochain niveau : <strong>{levelProgress}%</strong></p>
        </section>

        <section className="card">
          <div className="icon-box"><User size={26} /></div>
          <div className="card-label">PROFIL DÉTECTÉ</div>
          <h2 className="card-title">{primeProfile?.detectedProfile || currentIdentity || "Profil non généré"}</h2>
          <p className="text">
            {primeProfile
              ? `Risque dominant : ${primeProfile.risk || dominantError || "Non défini"}`
              : "Va dans PRIME Identity pour générer ton profil trader personnalisé."}
          </p>
        </section>

        <section className="grid">
          <Mini icon={<ShieldCheck size={24} color="#D4B06A" />} label="Score moyen" value={`${averageScore}%`} />
          <Mini icon={<BookOpen size={24} color="#D4B06A" />} label="Sessions" value={sessions.length} />
          <Mini icon={<CheckCircle size={24} color="#D4B06A" />} label="Plans respectés" value={`${planRespectRate}%`} />
          <div className="mini-card">
            <TrendingUp size={24} color="#D4B06A" />
            <div className="mini-label">PnL total</div>
            <div className="mini-value" style={{ color: totalPnl > 0 ? "#7DFFA1" : totalPnl < 0 ? "#FF7D7D" : "#fff" }}>
              {totalPnl > 0 ? "+" : ""}{totalPnl}€
            </div>
          </div>
        </section>

        <section className="grid">
          <Mini icon={<Activity size={24} color="#D4B06A" />} label="Mental dominant" value={dominantMental || "Non noté"} />
          <Mini icon={<Flame size={24} color="#D4B06A" />} label="Erreur dominante" value={dominantError || "Aucune"} />
        </section>

        <section className="card">
          <div className="icon-box"><CalendarDays size={26} /></div>
          <div className="card-label">SEMAINE PRIME</div>
          <h2 className="card-title">{weekPnl > 0 ? "+" : ""}{weekPnl}€</h2>
          <p className="text">Respect du plan cette semaine : <strong>{weekPlanRate}%</strong></p>
          <div className="week-dots">
            {weekDays.map((day) => (
              <div key={day.label} className="week-dot" style={getWeekDayStyle(day)}>
                <div className="week-label">{day.label}</div>
                <div className="week-pnl">{day.pnl > 0 ? "+" : ""}{day.pnl}€</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="icon-box"><Target size={26} /></div>
          <div className="card-label">PRESCRIPTION ACTIVE</div>
          <h2 className="card-title">{activePrescription ? activePrescription.title : primeProfile?.prescription || "Aucune prescription active"}</h2>
          <p className="text">
            {activePrescription
              ? activePrescription.rule
              : "PRIME activera une prescription active lorsqu’un pattern comportemental sera détecté."}
          </p>
          {activePrescription && (
            <>
              <div className="progress-track"><div className="progress-bar" style={{ width: `${activePrescriptionPercent}%` }} /></div>
              <p className="text">Progression : {activePrescriptionProgress} / {activePrescriptionDuration} jours</p>
            </>
          )}
        </section>

        <section className="card">
          <div className="icon-box"><Sparkles size={26} /></div>
          <div className="card-label">ÉVOLUTION PRIME</div>
          <h2 className="card-title">{previousIdentity} → {currentIdentity}</h2>
          <p className="text">PRIME conserve ton historique d’identité lorsque ton comportement change ou lorsque ton score progresse significativement.</p>
          <div className="evolution">
            {identityHistory.length > 0 ? (
              identityHistory.map((item) => (
                <div key={item.id} className="evolution-item">
                  <div className="evolution-date">{formatDate(item.created_at)}</div>
                  <div className="evolution-profile">{item.profile}</div>
                  <p className="text" style={{ marginTop: "8px" }}>
                    Score moyen : {item.discipline_average || 0}% · Sessions : {item.total_sessions || 0}
                  </p>
                </div>
              ))
            ) : (
              <p className="text">Ton évolution apparaîtra après plusieurs sessions clôturées.</p>
            )}
          </div>
        </section>

        <section className="card">
          <div className="icon-box"><Trophy size={26} /></div>
          <div className="card-label">BADGES PRIME</div>
          <h2 className="card-title">Ta progression débloque des niveaux.</h2>
          <div className="badge-grid">
            <Badge unlocked={sessions.length >= 1} title="Première session" text="Tu as créé ta première trace comportementale." />
            <Badge unlocked={sessions.length >= 10} title="10 sessions analysées" text="PRIME commence à lire tes vrais patterns." />
            <Badge unlocked={averageScore >= 70 && sessions.length >= 5} title="Cadre confirmé" text="Ton score moyen dépasse 70% avec assez de données." />
            <Badge unlocked={completedPrescriptions >= 1} title="Prescription terminée" text="Tu as tenu une règle comportementale dans le temps." />
            <Badge unlocked={planRespectRate >= 80 && sessions.length >= 5} title="Plan souverain" text="Tu respectes ton plan sur la majorité de tes sessions." />
          </div>
        </section>

        <section className="card">
          <div className="icon-box"><CheckCircle size={26} /></div>
          <div className="card-label">CHECKLIST PERSONNALISÉE</div>
          {primeProfile?.checklist?.length > 0 ? (
            primeProfile.checklist.map((item) => (
              <div key={item} className="list-item">
                <CheckCircle size={18} color="#D4B06A" />
                <p className="list-text">{item}</p>
              </div>
            ))
          ) : (
            <p className="text">Ta checklist personnalisée apparaîtra après la création de ton profil PRIME Identity.</p>
          )}
        </section>
      </div>

      <BottomNav active="Profil" />
    </main>
  );
}

function Mini({ icon, label, value }) {
  return (
    <div className="mini-card">
      {icon}
      <div className="mini-label">{label}</div>
      <div className="mini-value">{value}</div>
    </div>
  );
}

function Badge({ unlocked, title, text }) {
  return (
    <div className={unlocked ? "badge" : "badge locked"}>
      <p className="badge-title">{unlocked ? "🏅 " : "🔒 "}{title}</p>
      <p className="badge-text">{text}</p>
    </div>
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

function getPrimeLevel(score, count) {
  if (count < 5) return "En construction";
  if (score >= 90) return "Institutionnel";
  if (score >= 85) return "Elite";
  if (score >= 75) return "Consistant";
  if (score >= 65) return "Confirmé";
  if (score >= 50) return "Intermédiaire";
  return "À stabiliser";
}

function getNextLevel(score, count) {
  if (count < 5) return "5 sessions analysées";
  if (score < 50) return "Intermédiaire";
  if (score < 65) return "Confirmé";
  if (score < 75) return "Consistant";
  if (score < 85) return "Elite";
  if (score < 90) return "Institutionnel";
  return "Maintenir l'excellence";
}

function getLevelProgress(score, count) {
  if (count < 5) return Math.min(Math.round((count / 5) * 100), 100);
  if (score >= 90) return 100;
  if (score >= 85) return Math.round(((score - 85) / 5) * 100);
  if (score >= 75) return Math.round(((score - 75) / 10) * 100);
  if (score >= 65) return Math.round(((score - 65) / 10) * 100);
  if (score >= 50) return Math.round(((score - 50) / 15) * 100);
  return Math.max(Math.round((score / 50) * 100), 0);
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
    const respectedCount = daySessions.filter((session) => session.plan_respected === true).length;
    const notRespectedCount = daySessions.filter((session) => session.plan_respected === false).length;
    const planRespected = hasSession && notRespectedCount === 0 && respectedCount > 0;
    const planNotRespected = hasSession && notRespectedCount > 0;

    return { label, pnl, hasSession, planRespected, planNotRespected };
  });
}

function getWeekDayStyle(day) {
  if (!day.hasSession) return { background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" };
  if (day.planRespected) return { background: "rgba(125,255,161,0.12)", border: "1px solid rgba(125,255,161,0.30)" };
  if (day.planNotRespected && day.pnl > 0) return { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" };
  if (day.planNotRespected && day.pnl < 0) return { background: "rgba(255,80,80,0.13)", border: "1px solid rgba(255,80,80,0.32)" };
  return { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" };
}

function getWeekPlanRate(days) {
  const tradedDays = days.filter((day) => day.hasSession);
  if (tradedDays.length === 0) return 0;
  const respectedDays = tradedDays.filter((day) => day.planRespected).length;
  return Math.round((respectedDays / tradedDays.length) * 100);
}

function formatDate(value) {
  if (!value) return "Date inconnue";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


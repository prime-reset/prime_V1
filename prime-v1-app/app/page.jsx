"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  ChevronRight,
  Sparkles,
  Crown,
  ShieldAlert,
  BookOpen,
  User,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  Activity,
  Target,
  Flame,
  Eye,
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
  const [sessions, setSessions] = useState<any[]>([]);
  const [activePrescription, setActivePrescription] = useState<any>(null);
  const [risk, setRisk] = useState<any>({
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

  const primeMessage = getPrimeMessage({
    score: averageScore,
    risk,
    profile,
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
          padding: 28px 18px 140px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(circle at 80% 0%, rgba(212,176,106,0.26), transparent 30%),
            radial-gradient(circle at 10% 20%, rgba(255,255,255,0.06), transparent 24%),
            linear-gradient(180deg, #080808 0%, #000 100%);
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 20px;
          animation: fadeUp .55s ease both;
        }

        .brand-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 7px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .live-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(212,176,106,0.10);
          border: 1px solid rgba(212,176,106,0.22);
          color: #D4B06A;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
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
          font-size: 44px;
          line-height: 0.95;
          font-weight: 950;
          letter-spacing: -2.6px;
        }

        .subtitle {
          margin-top: 16px;
          font-size: 17px;
          line-height: 1.55;
          color: rgba(255,255,255,0.66);
        }

        .prime-says {
          margin: 22px 0;
          padding: 22px;
          border-radius: 32px;
          background:
            linear-gradient(145deg, rgba(212,176,106,0.18), rgba(255,255,255,0.035)),
            rgba(5,5,5,0.85);
          border: 1px solid rgba(212,176,106,0.22);
          box-shadow: 0 22px 60px rgba(0,0,0,0.58);
          animation: fadeUp .65s ease both;
        }

        .prime-says-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #D4B06A;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .prime-says-text {
          margin: 0;
          font-size: 21px;
          line-height: 1.35;
          font-weight: 850;
          letter-spacing: -0.5px;
        }

        .score-card,
        .card,
        .mini-card,
        .action-card {
          background:
            linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.025)),
            rgba(5,5,5,0.82);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 22px 70px rgba(0,0,0,0.58);
          backdrop-filter: blur(18px);
        }

        .score-card {
          position: relative;
          overflow: hidden;
          border-radius: 38px;
          padding: 28px;
          margin-bottom: 18px;
          animation: fadeUp .75s ease both;
        }

        .score-card::before {
          content: "";
          position: absolute;
          inset: -40%;
          background: radial-gradient(circle, rgba(212,176,106,0.19), transparent 45%);
          animation: slowGlow 5s ease-in-out infinite alternate;
        }

        .score-content {
          position: relative;
          z-index: 1;
        }

        .score-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 24px;
        }

        .label {
          color: rgba(212,176,106,0.88);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0 0 10px;
        }

        .score-status {
          margin: 0;
          font-size: 25px;
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -0.8px;
        }

        .score-ring {
          width: 152px;
          height: 152px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#D4B06A ${averageScore * 3.6}deg, rgba(255,255,255,0.07) 0deg);
          box-shadow: 0 0 42px rgba(212,176,106,0.14);
          flex-shrink: 0;
        }

        .score-ring-inner {
          width: 124px;
          height: 124px;
          border-radius: 50%;
          background: #050505;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .score-number {
          font-size: 48px;
          font-weight: 1000;
          letter-spacing: -2px;
          line-height: 1;
        }

        .score-word {
          margin-top: 5px;
          color: #D4B06A;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .score-copy {
          color: rgba(255,255,255,0.72);
          font-size: 15.5px;
          line-height: 1.65;
          margin: 0;
        }

        .cta-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 23px;
          border-radius: 30px;
          margin-bottom: 18px;
          text-decoration: none;
          color: #000;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          border: none;
          box-shadow: 0 18px 48px rgba(212,176,106,0.22);
          animation: fadeUp .85s ease both;
        }

        .cta-title {
          margin: 0;
          font-size: 21px;
          font-weight: 1000;
          letter-spacing: -0.6px;
        }

        .cta-subtitle {
          margin: 6px 0 0;
          color: rgba(0,0,0,0.62);
          font-size: 14px;
          font-weight: 800;
        }

        .card {
          border-radius: 34px;
          padding: 24px;
          margin-bottom: 18px;
          animation: fadeUp .9s ease both;
        }

        .card-title {
          margin: 0;
          font-size: 28px;
          line-height: 1.08;
          font-weight: 950;
          color: #D4B06A;
          letter-spacing: -0.9px;
        }

        .text {
          margin: 15px 0 0;
          color: rgba(255,255,255,0.72);
          font-size: 15.5px;
          line-height: 1.65;
        }

        .mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;
        }

        .mission-item {
          padding: 15px;
          border-radius: 22px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .mission-label {
          margin: 0 0 8px;
          color: rgba(212,176,106,0.82);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.7px;
          text-transform: uppercase;
        }

        .mission-value {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.25;
        }

        .timeline {
          display: grid;
          gap: 13px;
          margin-top: 18px;
        }

        .timeline-row {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.76);
          font-size: 15px;
          font-weight: 700;
        }

        .timeline-dot {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(212,176,106,0.14);
          color: #D4B06A;
          border: 1px solid rgba(212,176,106,0.25);
          font-size: 12px;
          flex-shrink: 0;
        }

        .progress-track {
          margin-top: 20px;
          height: 12px;
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

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .mini-card {
          padding: 20px;
          border-radius: 28px;
        }

        .mini-label {
          margin-top: 14px;
          color: rgba(212,176,106,0.82);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .mini-value {
          margin-top: 8px;
          font-size: 24px;
          font-weight: 950;
          line-height: 1.05;
          letter-spacing: -0.5px;
        }

        .week-dots {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-top: 20px;
        }

        .week-dot {
          min-height: 58px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .week-label {
          font-size: 11px;
          color: rgba(255,255,255,0.70);
          font-weight: 800;
        }

        .week-pnl {
          font-size: 11px;
          color: rgba(255,255,255,0.82);
          font-weight: 900;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .action-card {
          min-height: 122px;
          padding: 18px;
          border-radius: 28px;
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
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 8px;
          font-weight: 900;
        }

        .action-title {
          margin: 0;
          font-size: 19px;
          line-height: 1.15;
          font-weight: 950;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }

        @keyframes slowGlow {
          from { transform: rotate(0deg) scale(1); opacity: .55; }
          to { transform: rotate(14deg) scale(1.08); opacity: 1; }
        }

        @media(max-width: 390px) {
          .title { font-size: 39px; }
          .score-top {
            flex-direction: column;
          }
          .score-ring {
            width: 142px;
            height: 142px;
            align-self: center;
          }
          .score-ring-inner {
            width: 116px;
            height: 116px;
          }
          .grid,
          .mission-grid,
          .actions-grid {
            grid-template-columns: 1fr;
          }
          .week-dots { gap: 6px; }
          .week-dot { min-height: 52px; border-radius: 15px; }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <div className="brand-row">
            <div className="brand">PRIME</div>
            <div className="live-pill">
              <span className="pulse" />
              Analyse live
            </div>
          </div>

          <h1 className="title">Bonjour {displayName}</h1>

          <p className="subtitle">
            Ton cockpit est prêt. PRIME analyse ton état, ton risque et ton objectif du jour.
          </p>
        </section>

        <section className="prime-says">
          <div className="prime-says-label">
            <Brain size={17} />
            PRIME parle
          </div>
          <p className="prime-says-text">{primeMessage}</p>
        </section>

        <section className="score-card">
          <div className="score-content">
            <div className="score-top">
              <div>
                <p className="label">Discipline Score</p>
                <h2 className="score-status">{getScoreStatus(averageScore)}</h2>
              </div>

              <div className="score-ring">
                <div className="score-ring-inner">
                  <div className="score-number">{averageScore}</div>
                  <div className="score-word">/100</div>
                </div>
              </div>
            </div>

            <p className="score-copy">
              Ce score mesure ton exécution, pas ton PnL. Une perte propre vaut mieux
              qu'un gain obtenu hors plan.
            </p>
          </div>
        </section>

        <Link href="/session" className="cta-card">
          <div>
            <p className="cta-title">Commencer ma session</p>
            <p className="cta-subtitle">Prépare, exécute, débriefe.</p>
          </div>
          <PlayCircle size={34} />
        </Link>

        <section className="card">
          <p className="label">Mission du jour</p>
          <h2 className="card-title">{focus}</h2>

          <div className="mission-grid">
            <MissionItem label="Objectif" value="Respect du setup" />
            <MissionItem label="Risque" value={risk.label} />
            <MissionItem
              label="Prescription"
              value={activePrescription ? `Jour ${prescriptionProgress}/${prescriptionDuration}` : "Aucune"}
            />
            <MissionItem label="Profil" value={profile} />
          </div>
        </section>

        <section className="card">
          <p className="label">Aujourd'hui</p>
          <h2 className="card-title">Timeline PRIME</h2>

          <div className="timeline">
            <TimelineRow done text="Identité analysée" />
            <TimelineRow done text="Focus généré" />
            <TimelineRow done={!!activePrescription} text="Prescription vérifiée" />
            <TimelineRow done={false} text="Session non commencée" />
            <TimelineRow done={false} text="Débrief à compléter" />
          </div>
        </section>

        <section className="card">
          <p className="label">Risque actuel</p>
          <h2 className="card-title">{getRiskIcon(risk.level)} {risk.label}</h2>
          <p className="text">{risk.message}</p>
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
                Progression : {prescriptionProgress} / {prescriptionDuration} jours
              </p>
            </>
          )}
        </section>

        <section className="card">
          <p className="label">Identité PRIME</p>
          <h2 className="card-title">{profile}</h2>

          <p className="text">
            Niveau : <strong>{getPrimeLevel(averageScore, sessionsCount)}</strong>
            <br />
            Sessions analysées : <strong>{sessionsCount}</strong>
            <br />
            Force dominante : <strong>{getProfileStrength(profile)}</strong>
            <br />
            À surveiller : <strong>{getProfileWeakness(profile)}</strong>
          </p>
        </section>

        <section className="grid">
          <div className="mini-card">
            <ShieldAlert size={26} color="#D4B06A" />
            <div className="mini-label">Risque</div>
            <div className="mini-value">{risk.label}</div>
          </div>

          <div className="mini-card">
            <TrendingUp size={26} color="#D4B06A" />
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
        </section>

        {lastSession && (
          <section className="card">
            <p className="label">Dernière session</p>
            <h2 className="card-title">
              Discipline : {lastSession.discipline_score ?? 0}%
            </h2>

            <p className="text">
              Mental : <strong>{lastSession.mental_state || "Non renseigné"}</strong>
              <br />
              Erreur dominante : <strong>{lastSession.dominant_error || "Aucune"}</strong>
            </p>

            <p
              className="text"
              style={{
                color:
                  lastSession.plan_respected === true
                    ? "#7DFFA1"
                    : lastSession.plan_respected === false
                    ? "#FF7D7D"
                    : "rgba(255,255,255,0.72)",
                fontWeight: 900,
              }}
            >
              {lastSession.plan_respected === true
                ? "✓ Plan respecté"
                : lastSession.plan_respected === false
                ? "✗ Hors plan"
                : "Plan non renseigné"}
            </p>
          </section>
        )}

        <section className="card">
          <p className="label">Évolution</p>
          <h2 className="card-title">Ta semaine</h2>

          <div className="week-dots">
            {weekDays.map((day) => (
              <div key={day.label} className="week-dot" style={getWeekDayStyle(day)}>
                <div className="week-label">{day.label}</div>
                <div className="week-pnl">
                  {day.pnl > 0 ? "+" : ""}
                  {day.pnl}€
                </div>
              </div>
            ))}
          </div>

          <p className="text">
            Respect du plan cette semaine : <strong>{weekPlanRate}%</strong>
          </p>
        </section>

        <section className="grid">
          <div className="mini-card">
            <CheckCircle size={26} color="#D4B06A" />
            <div className="mini-label">Plans respectés</div>
            <div className="mini-value">{weekPlanRate}%</div>
          </div>

          <div className="mini-card">
            <Sparkles size={26} color="#D4B06A" />
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

function ActionButton({ href, icon, label, title }: any) {
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

function MissionItem({ label, value }: any) {
  return (
    <div className="mission-item">
      <p className="mission-label">{label}</p>
      <p className="mission-value">{value}</p>
    </div>
  );
}

function TimelineRow({ done, text }: any) {
  return (
    <div className="timeline-row">
      <div className="timeline-dot">{done ? "✓" : "□"}</div>
      <span>{text}</span>
    </div>
  );
}

function getFocusByProfile(profile?: string) {
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

function getPrimeMessage({ score, risk, profile, activePrescription, sessionsCount }: any) {
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

function getScoreStatus(score: number) {
  if (score >= 85) return "Discipline élevée";
  if (score >= 70) return "Cadre solide";
  if (score >= 55) return "À stabiliser";
  if (score > 0) return "Vigilance requise";
  return "En observation";
}

function getPrimeLevel(score: number, count: number) {
  if (count < 5) return "En construction";
  if (score >= 85) return "Consistant";
  if (score >= 70) return "Confirmé";
  if (score >= 55) return "Intermédiaire";
  return "À stabiliser";
}

function getProfileStrength(profile: string) {
  if (profile.includes("Patient")) return "Attente";
  if (profile.includes("Impulsif")) return "Énergie";
  if (profile.includes("FOMO")) return "Réactivité";
  if (profile.includes("Agressif")) return "Décision";
  if (profile.includes("Désorganisé")) return "Adaptabilité";
  return "Construction";
}

function getProfileWeakness(profile: string) {
  if (profile.includes("Patient")) return "Excès de confiance";
  if (profile.includes("Impulsif")) return "Entrées trop rapides";
  if (profile.includes("FOMO")) return "Peur de rater";
  if (profile.includes("Agressif")) return "Risque excessif";
  if (profile.includes("Désorganisé")) return "Manque de structure";
  return "Manque de données";
}

function getRiskIcon(level: string) {
  if (level === "low") return "🟢";
  if (level === "medium") return "🟠";
  if (level === "high") return "🔴";
  return "⚪";
}

function getRiskFromSessions(sessions: any[]) {
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

function getCurrentWeekData(sessions: any[]) {
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

function getWeekDayStyle(day: any) {
  if (!day.hasSession) {
    return {
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.07)",
    };
  }

  if (day.planRespected) {
    return {
      background: "rgba(125,255,161,0.12)",
      border: "1px solid rgba(125,255,161,0.30)",
    };
  }

  if (day.planNotRespected && day.pnl < 0) {
    return {
      background: "rgba(255,80,80,0.13)",
      border: "1px solid rgba(255,80,80,0.32)",
    };
  }

  return {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.14)",
  };
}

function getWeekPlanRate(days: any[]) {
  const tradedDays = days.filter((day) => day.hasSession);
  if (tradedDays.length === 0) return 0;

  const respectedDays = tradedDays.filter((day) => day.planRespected).length;
  return Math.round((respectedDays / tradedDays.length) * 100);
}

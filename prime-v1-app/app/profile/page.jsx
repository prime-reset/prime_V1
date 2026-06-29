"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronRight,
  Crown,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Trader");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [plan, setPlan] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [identityHistory, setIdentityHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    setEmail(user.email || "");

    const { data: profileData } = await supabase
      .from("profiles")
      .select("display_name, role, plan, subscription_status")
      .eq("email", user.email)
      .maybeSingle();

    if (profileData?.display_name) setDisplayName(profileData.display_name);
    if (profileData?.role) setRole(profileData.role);
    if (profileData?.plan) setPlan(profileData.plan);
    if (profileData?.subscription_status) {
      setSubscriptionStatus(profileData.subscription_status);
    }

    const { data: identityData } = await supabase
      .from("prime_identity_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);

    if (identityData && identityData.length > 0) {
      setIdentity(identityData[0]);
      setIdentityHistory(identityData);
    }

    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "closed")
      .order("created_at", { ascending: false });

    if (sessionsData) setSessions(sessionsData);

    const { data: prescriptionsData } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (prescriptionsData) setPrescriptions(prescriptionsData);

    setLoading(false);
  }

  const averageScore = useMemo(() => {
    const identityScore = Number(identity?.discipline_average || 0);
    if (identityScore > 0) return Math.round(identityScore);

    const scores = sessions
      .map((session) => Number(session.discipline_score))
      .filter((score) => !Number.isNaN(score) && score > 0);

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [identity, sessions]);

  const bestScore = useMemo(() => {
    const scores = sessions
      .map((session) => Number(session.discipline_score))
      .filter((score) => !Number.isNaN(score) && score > 0);

    if (scores.length === 0) return 0;
    return Math.max(...scores);
  }, [sessions]);

  const activePrescription = prescriptions.find(
    (prescription) => prescription.status === "active"
  );

  const profileName = identity?.profile || "Trader en construction";
  const primeLevel = getPrimeLevel(averageScore, sessions.length);
  const dominantStrength = getProfileStrength(profileName);
  const watchPoint = getProfileWeakness(profileName);
  const accountLabel = getAccountLabel(role, plan);
  const subscriptionLabel = getSubscriptionLabel(role, subscriptionStatus);

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
        Chargement Profil...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <style>{`
        * { box-sizing: border-box; }

        html,
        body {
          margin: 0;
          background: #000;
        }

        .profile-page {
          min-height: 100vh;
          padding: 28px 16px 132px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(circle at 82% 2%, rgba(212,176,106,0.12), transparent 28%),
            radial-gradient(circle at 8% 16%, rgba(255,255,255,0.035), transparent 22%),
            linear-gradient(180deg, #030303 0%, #000 54%, #000 100%);
          overflow-x: hidden;
        }

        .page {
          width: 100%;
          max-width: 460px;
          margin: 0 auto;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 28px;
        }

        .brand {
          margin: 0;
          color: #D4B06A;
          letter-spacing: 8px;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .settings-button {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          border: 1px solid rgba(212,176,106,0.22);
          background: rgba(212,176,106,0.08);
          color: #D4B06A;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .hero-card,
        .section,
        .stat-card,
        .identity-card,
        .action-card {
          background:
            linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.018)),
            rgba(12,12,12,0.94);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 22px 70px rgba(0,0,0,0.58);
          backdrop-filter: blur(18px);
        }

        .hero-card {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 22px;
          margin-bottom: 16px;
          border-color: rgba(212,176,106,0.22);
        }

        .hero-card::before {
          content: "";
          position: absolute;
          top: -70px;
          right: -80px;
          width: 190px;
          height: 190px;
          background: radial-gradient(circle, rgba(212,176,106,0.16), transparent 62%);
          pointer-events: none;
        }

        .profile-head {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .avatar {
          width: 74px;
          height: 74px;
          border-radius: 25px;
          display: grid;
          place-items: center;
          color: #000;
          font-size: 31px;
          font-weight: 1000;
          background: linear-gradient(135deg, #9d742f, #d6b25f, #fff2b8);
          box-shadow: 0 18px 45px rgba(212,176,106,0.12);
          flex-shrink: 0;
        }

        .name {
          margin: 0;
          font-size: 31px;
          line-height: 0.98;
          font-weight: 1000;
          letter-spacing: -1.5px;
        }

        .email {
          margin: 8px 0 0;
          color: rgba(255,255,255,0.54);
          font-size: 13px;
          line-height: 1.35;
          word-break: break-word;
        }

        .badge-row {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 18px;
        }

        .badge {
          width: fit-content;
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(212,176,106,0.09);
          border: 1px solid rgba(212,176,106,0.24);
          color: #D4B06A;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.45px;
          text-transform: uppercase;
        }

        .badge.dark {
          background: rgba(255,255,255,0.045);
          border-color: rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.68);
        }

        .identity-card {
          border-radius: 30px;
          padding: 20px;
          margin-bottom: 16px;
          border-color: rgba(212,176,106,0.20);
        }

        .label {
          color: #D4B06A;
          font-size: 10.5px;
          letter-spacing: 2.6px;
          text-transform: uppercase;
          font-weight: 950;
          margin: 0 0 12px;
        }

        .identity-title {
          margin: 0;
          font-size: 31px;
          line-height: 1;
          font-weight: 1000;
          letter-spacing: -1.3px;
        }

        .identity-text {
          margin: 13px 0 0;
          color: rgba(255,255,255,0.65);
          font-size: 14.5px;
          line-height: 1.55;
        }

        .score-area {
          display: grid;
          grid-template-columns: 128px 1fr;
          gap: 18px;
          align-items: center;
          margin-top: 20px;
        }

        .score-ring {
          width: 128px;
          height: 128px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#D4B06A ${averageScore * 3.6}deg, rgba(255,255,255,0.08) 0deg);
          box-shadow: 0 0 42px rgba(212,176,106,0.12);
        }

        .score-inner {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 50% 32%, rgba(212,176,106,0.11), transparent 48%),
            #030303;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .score-number {
          font-size: 31px;
          font-weight: 1000;
          letter-spacing: -1.2px;
        }

        .score-number span {
          color: #D4B06A;
          font-size: 14px;
        }

        .score-copy {
          color: rgba(255,255,255,0.66);
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .score-copy strong {
          color: #D4B06A;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }

        .stat-card {
          min-height: 112px;
          border-radius: 23px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .stat-icon {
          color: #D4B06A;
        }

        .stat-label {
          margin: 10px 0 0;
          color: rgba(212,176,106,0.86);
          font-size: 9.5px;
          letter-spacing: 1.7px;
          text-transform: uppercase;
          font-weight: 950;
          line-height: 1.25;
        }

        .stat-value {
          margin: 6px 0 0;
          font-size: 22px;
          font-weight: 1000;
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .section {
          border-radius: 28px;
          padding: 18px;
          margin-bottom: 16px;
        }

        .section-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .section-title {
          margin: 0;
          color: #D4B06A;
          font-size: 10.5px;
          letter-spacing: 2.6px;
          text-transform: uppercase;
          font-weight: 950;
        }

        .section-main {
          margin: 6px 0 0;
          font-size: 22px;
          line-height: 1.05;
          font-weight: 1000;
          letter-spacing: -0.7px;
        }

        .section-link {
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .info-list {
          display: grid;
          gap: 11px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color: rgba(255,255,255,0.52);
          font-size: 13px;
          font-weight: 700;
        }

        .info-value {
          color: rgba(255,255,255,0.88);
          font-size: 13px;
          font-weight: 850;
          text-align: right;
        }

        .gold {
          color: #D4B06A;
        }

        .timeline {
          display: grid;
          gap: 12px;
        }

        .timeline-item {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 12px;
          align-items: flex-start;
        }

        .timeline-dot {
          width: 34px;
          height: 34px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          color: #D4B06A;
          background: rgba(212,176,106,0.09);
          border: 1px solid rgba(212,176,106,0.18);
        }

        .timeline-title {
          margin: 0;
          font-size: 14.5px;
          font-weight: 950;
          line-height: 1.25;
        }

        .timeline-date {
          margin: 5px 0 0;
          color: rgba(255,255,255,0.48);
          font-size: 12px;
          line-height: 1.35;
        }

        .prescription-card {
          padding: 15px;
          border-radius: 20px;
          background: rgba(212,176,106,0.075);
          border: 1px solid rgba(212,176,106,0.18);
        }

        .prescription-title {
          margin: 0;
          color: #D4B06A;
          font-size: 15px;
          line-height: 1.25;
          font-weight: 950;
        }

        .prescription-text {
          margin: 9px 0 0;
          color: rgba(255,255,255,0.70);
          font-size: 13.5px;
          line-height: 1.48;
        }

        .action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .action-card {
          min-height: 112px;
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

        .action-icon {
          color: #D4B06A;
        }

        .arrow {
          color: rgba(255,255,255,0.34);
        }

        .action-label {
          color: rgba(212,176,106,0.84);
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 8px;
          font-weight: 950;
        }

        .action-title {
          margin: 0;
          font-size: 18px;
          line-height: 1.12;
          font-weight: 950;
        }

        .quote-card {
          padding: 24px;
          border-radius: 30px;
          margin-top: 4px;
          text-align: center;
          background:
            radial-gradient(circle at 50% 0%, rgba(212,176,106,0.12), transparent 36%),
            rgba(10,10,10,0.96);
          border: 1px solid rgba(212,176,106,0.22);
          box-shadow: 0 22px 70px rgba(0,0,0,0.58);
        }

        .quote-card h2 {
          margin: 0;
          font-size: 29px;
          line-height: 1;
          font-weight: 1000;
          letter-spacing: -1.4px;
        }

        .quote-card span {
          display: block;
          color: #D4B06A;
        }

        .quote-card p {
          margin: 14px 0 0;
          color: rgba(255,255,255,0.54);
          font-size: 13px;
          line-height: 1.45;
        }

        @media(max-width: 390px) {
          .profile-page {
            padding-left: 14px;
            padding-right: 14px;
          }

          .name {
            font-size: 28px;
          }

          .avatar {
            width: 66px;
            height: 66px;
            border-radius: 22px;
          }

          .score-area {
            grid-template-columns: 1fr;
          }

          .score-ring {
            margin: 0 auto;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .stat-card {
            min-height: 104px;
            padding: 13px;
          }

          .stat-value {
            font-size: 20px;
          }

          .action-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .action-card {
            min-height: 108px;
            padding: 15px;
          }

          .action-title {
            font-size: 16px;
          }
        }
      `}</style>

      <div className="page">
        <div className="topbar">
          <p className="brand">PRIME</p>

          <button
            type="button"
            className="settings-button"
            onClick={() => router.push("/settings")}
            aria-label="Ouvrir les paramètres"
          >
            <Settings size={22} />
          </button>
        </div>

        <section className="hero-card">
          <div className="profile-head">
            <div className="avatar">
              {displayName?.charAt(0)?.toUpperCase() || "P"}
            </div>

            <div style={{ flex: 1 }}>
              <h1 className="name">{displayName}</h1>
              <p className="email">{email}</p>
            </div>
          </div>

          <div className="badge-row">
            <div className="badge">{accountLabel}</div>
            <div className="badge dark">{subscriptionLabel}</div>
          </div>
        </section>

        <section className="identity-card">
          <p className="label">Identité PRIME</p>

          <h2 className="identity-title">{profileName}</h2>

          <p className="identity-text">
            Ton profil évolue avec tes sessions. PRIME observe tes décisions,
            tes répétitions et ta capacité à respecter ton cadre.
          </p>

          <div className="score-area">
            <div className="score-ring">
              <div className="score-inner">
                <div className="score-number">
                  {averageScore}<span>%</span>
                </div>
              </div>
            </div>

            <p className="score-copy">
              Niveau : <strong>{primeLevel}</strong>
              <br />
              Force dominante : <strong>{dominantStrength}</strong>
              <br />
              À surveiller : <strong>{watchPoint}</strong>
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard icon={<BarChart3 size={23} />} label="Score max" value={`${bestScore}%`} />
          <StatCard icon={<BookOpen size={23} />} label="Sessions" value={sessions.length} />
          <StatCard icon={<Award size={23} />} label="Niveau" value={primeLevel} />
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-title">Structure comportementale</p>
              <h2 className="section-main">Ce que PRIME lit chez toi</h2>
            </div>
          </div>

          <div className="info-list">
            <InfoRow label="Profil actuel" value={profileName} highlight />
            <InfoRow label="Force dominante" value={dominantStrength} />
            <InfoRow label="Point de vigilance" value={watchPoint} />
            <InfoRow label="Sessions analysées" value={sessions.length} />
            <InfoRow label="Score moyen" value={`${averageScore}%`} highlight />
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-title">Prescription</p>
              <h2 className="section-main">
                {activePrescription ? "Plan actif" : "Aucun plan actif"}
              </h2>
            </div>

            <Link href="/coach" className="section-link">
              Coach <ChevronRight size={15} />
            </Link>
          </div>

          {activePrescription ? (
            <div className="prescription-card">
              <p className="prescription-title">
                {activePrescription.title || "Prescription PRIME"}
              </p>
              <p className="prescription-text">
                {activePrescription.rule ||
                  activePrescription.description ||
                  "Suis cette prescription jusqu’au bout pour stabiliser ton comportement."}
              </p>
            </div>
          ) : (
            <p className="identity-text">
              PRIME activera une prescription lorsqu’un pattern suffisamment clair sera détecté.
            </p>
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-title">Historique Identity</p>
              <h2 className="section-main">Ton évolution récente</h2>
            </div>

            <Link href="/onboarding" className="section-link">
              Modifier <ChevronRight size={15} />
            </Link>
          </div>

          <div className="timeline">
            {identityHistory.length > 0 ? (
              identityHistory.slice(0, 5).map((item, index) => (
                <div className="timeline-item" key={item.id || index}>
                  <div className="timeline-dot">
                    {index === 0 ? <Sparkles size={17} /> : <CalendarDays size={17} />}
                  </div>

                  <div>
                    <p className="timeline-title">
                      {item.profile || "Trader en construction"}
                    </p>
                    <p className="timeline-date">
                      Score moyen : {item.discipline_average || 0}% ·{" "}
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="identity-text">
                Ton historique d’identité PRIME apparaîtra ici après tes premières sessions.
              </p>
            )}
          </div>
        </section>

        <section className="action-grid">
          <ActionCard href="/session" icon={<Target size={23} />} label="Session" title="Trader avec cadre" />
          <ActionCard href="/journal" icon={<BookOpen size={23} />} label="Journal" title="Lire l’historique" />
          <ActionCard href="/coach" icon={<Brain size={23} />} label="Coach" title="Analyser mes patterns" />
          <ActionCard href="/settings" icon={<Settings size={23} />} label="Compte" title="Ouvrir Settings" />
        </section>

        <section className="quote-card">
          <h2>
            Ce que tu répètes
            <span>te définit.</span>
          </h2>

          <p>
            PRIME ne suit pas seulement tes résultats.
            <br />
            PRIME suit le trader que tu deviens.
          </p>
        </section>
      </div>

      <BottomNav active="Profil" />
    </main>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className={`info-value ${highlight ? "gold" : ""}`}>
        {value || "Non renseigné"}
      </span>
    </div>
  );
}

function ActionCard({ href, icon, label, title }) {
  return (
    <Link href={href} className="action-card">
      <div className="action-top">
        <div className="action-icon">{icon}</div>
        <ChevronRight size={18} className="arrow" />
      </div>

      <div>
        <p className="action-label">{label}</p>
        <h3 className="action-title">{title}</h3>
      </div>
    </Link>
  );
}

function getAccountLabel(role, plan) {
  if (role === "super_admin") return "Super Admin";
  if (plan === "founder") return "Founder";
  if (plan === "standard") return "Standard";
  return "Compte PRIME";
}

function getSubscriptionLabel(role, status) {
  if (role === "super_admin") return "Accès total";
  if (status === "active") return "Abonnement actif";
  if (status === "trialing") return "Essai gratuit";
  if (status === "past_due") return "Paiement à vérifier";
  if (status === "canceled") return "Résilié";
  return "Accès en préparation";
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

function formatDate(value) {
  if (!value) return "Date inconnue";

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


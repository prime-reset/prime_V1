"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  Bug,
  ChevronRight,
  Crown,
  Database,
  Download,
  FileText,
  HelpCircle,
  LifeBuoy,
  Lock,
  LogOut,
  Mail,
  RefreshCcw,
  Shield,
  Sparkles,
  Trash2,
  User,
  Wallet,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [displayName, setDisplayName] =
    useState("Trader");

  const [email, setEmail] =
    useState("");

  const [userId, setUserId] =
    useState(null);

  const [role, setRole] =
    useState("user");

  const [plan, setPlan] =
    useState(null);

  const [
    subscriptionStatus,
    setSubscriptionStatus,
  ] = useState(null);

  const [message, setMessage] =
    useState("");

  const [exporting, setExporting] =
    useState(false);

  const [
    portalLoading,
    setPortalLoading,
  ] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const accountLabel = useMemo(() => {
    if (role === "super_admin") {
      return "Super Admin";
    }

    if (plan === "founder") {
      return "Founder";
    }

    if (plan === "standard") {
      return "Standard";
    }

    return "Compte PRIME";
  }, [role, plan]);

  const planLabel = useMemo(() => {
    if (role === "super_admin") {
      return "Accès Admin";
    }

    if (plan === "founder") {
      return "PRIME Founder";
    }

    if (plan === "standard") {
      return "PRIME Standard";
    }

    return "Aucune offre active";
  }, [role, plan]);

  const statusLabel = useMemo(() => {
    if (role === "super_admin") {
      return "Accès total";
    }

    if (subscriptionStatus === "active") {
      return "Actif";
    }

    if (
      subscriptionStatus === "trialing"
    ) {
      return "Essai gratuit";
    }

    if (
      subscriptionStatus === "past_due"
    ) {
      return "Paiement à vérifier";
    }

    if (
      subscriptionStatus === "canceled"
    ) {
      return "Résilié";
    }

    if (
      subscriptionStatus === "unpaid"
    ) {
      return "Impayé";
    }

    return "En attente";
  }, [role, subscriptionStatus]);

  async function loadSettings() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "display_name, role"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "[PRIME Settings] Profile:",
          profileError
        );
      }

      if (
        profileData?.display_name
      ) {
        setDisplayName(
          profileData.display_name
        );
      }

      const currentRole =
        profileData?.role || "user";

      setRole(currentRole);

      if (
        currentRole ===
        "super_admin"
      ) {
        setPlan(null);
        setSubscriptionStatus(null);
        return;
      }

      const {
        data: subscriptionData,
        error: subscriptionError,
      } = await supabase
        .from("subscriptions")
        .select(
          `
            plan,
            status,
            stripe_customer_id,
            stripe_subscription_id,
            created_at
          `
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error(
          "[PRIME Settings] Subscription:",
          subscriptionError
        );

        setPlan(null);
        setSubscriptionStatus(null);

        return;
      }

      setPlan(
        subscriptionData?.plan ||
          null
      );

      setSubscriptionStatus(
        subscriptionData?.status ||
          null
      );
    } catch (error) {
      console.error(
        "[PRIME Settings] Load:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  async function handlePasswordReset() {
    if (!email) return;

    setMessage("");

    const siteUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "https://theprimeapp.com";

    const { error } =
      await supabase.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo:
              `${siteUrl}/reset-password`,
          }
        );

    if (error) {
      setMessage(
        "Impossible d’envoyer le lien pour le moment."
      );

      return;
    }

    setMessage(
      "Un lien de changement de mot de passe vient d’être envoyé."
    );
  }

  async function handleManageSubscription() {
    if (
      role === "super_admin"
    ) {
      setMessage(
        "Ton accès Super Admin ne nécessite aucun abonnement Stripe."
      );

      return;
    }

    if (!plan) {
      router.push("/offer");
      return;
    }

    try {
      setPortalLoading(true);
      setMessage("");

      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth
          .getSession();

      if (
        sessionError ||
        !session?.access_token
      ) {
        setMessage(
          "Ta session a expiré. Reconnecte-toi pour continuer."
        );

        return;
      }

      const response =
        await fetch(
          "/api/stripe/portal",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Impossible d’ouvrir le portail Stripe."
        );
      }

      if (!data?.url) {
        throw new Error(
          "Stripe n’a retourné aucune URL."
        );
      }

      window.location.href =
        data.url;
    } catch (error) {
      console.error(
        "[PRIME Billing Portal]",
        error
      );

      setMessage(
        error?.message ||
          "Impossible d’ouvrir la gestion de ton abonnement."
      );
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleExportData() {
    if (!userId || !email) {
      return;
    }

    setExporting(true);
    setMessage("");

    try {
      const [
        profileResult,
        identityResult,
        sessionsResult,
        prescriptionsResult,
        seasonsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),

        supabase
          .from(
            "prime_identity_history"
          )
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from("sessions")
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from(
            "prescriptions"
          )
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from("prime_seasons")
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),
      ]);

      const sessions =
        sessionsResult.data || [];

      const scores = sessions
        .map((session) =>
          Number(
            session.discipline_score ||
              0
          )
        )
        .filter(
          (score) =>
            !Number.isNaN(score) &&
            score > 0
        );

      const exportPayload = {
        application: "PRIME",
        export_type:
          "user_data_rgpd",
        generated_at:
          new Date().toISOString(),

        user: {
          id: userId,
          email,
          display_name:
            displayName,
          role,
          plan,
          subscription_status:
            subscriptionStatus,
        },

        profile:
          profileResult.data ||
          null,

        identity_history:
          identityResult.data ||
          [],

        sessions,

        prescriptions:
          prescriptionsResult.data ||
          [],

        seasons:
          seasonsResult.data ||
          [],

        statistics: {
          sessions_count:
            sessions.length,

          average_discipline:
            scores.length > 0
              ? Math.round(
                  scores.reduce(
                    (
                      sum,
                      score
                    ) =>
                      sum +
                      score,
                    0
                  ) /
                    scores.length
                )
              : 0,

          best_discipline:
            scores.length > 0
              ? Math.max(
                  ...scores
                )
              : 0,
        },
      };

      const blob =
        new Blob(
          [
            JSON.stringify(
              exportPayload,
              null,
              2
            ),
          ],
          {
            type: "application/json",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `prime-export-${date}.json`;

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setMessage(
        "Export terminé. Ton fichier PRIME vient d’être téléchargé."
      );
    } catch (error) {
      console.error(
        "[PRIME Export]",
        error
      );

      setMessage(
        "Impossible d’exporter tes données pour le moment."
      );
    }

    setExporting(false);
  }

  function handleComingSoon(
    label
  ) {
    setMessage(
      `${label} sera disponible dans une prochaine mise à jour.`
    );
  }

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

        Chargement Settings...
      </main>
    );
  }
  "use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  Bug,
  ChevronRight,
  Crown,
  Database,
  Download,
  FileText,
  HelpCircle,
  LifeBuoy,
  Lock,
  LogOut,
  Mail,
  RefreshCcw,
  Shield,
  Sparkles,
  Trash2,
  User,
  Wallet,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [displayName, setDisplayName] =
    useState("Trader");

  const [email, setEmail] =
    useState("");

  const [userId, setUserId] =
    useState(null);

  const [role, setRole] =
    useState("user");

  const [plan, setPlan] =
    useState(null);

  const [
    subscriptionStatus,
    setSubscriptionStatus,
  ] = useState(null);

  const [message, setMessage] =
    useState("");

  const [exporting, setExporting] =
    useState(false);

  const [
    portalLoading,
    setPortalLoading,
  ] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const accountLabel = useMemo(() => {
    if (role === "super_admin") {
      return "Super Admin";
    }

    if (plan === "founder") {
      return "Founder";
    }

    if (plan === "standard") {
      return "Standard";
    }

    return "Compte PRIME";
  }, [role, plan]);

  const planLabel = useMemo(() => {
    if (role === "super_admin") {
      return "Accès Admin";
    }

    if (plan === "founder") {
      return "PRIME Founder";
    }

    if (plan === "standard") {
      return "PRIME Standard";
    }

    return "Aucune offre active";
  }, [role, plan]);

  const statusLabel = useMemo(() => {
    if (role === "super_admin") {
      return "Accès total";
    }

    if (subscriptionStatus === "active") {
      return "Actif";
    }

    if (
      subscriptionStatus === "trialing"
    ) {
      return "Essai gratuit";
    }

    if (
      subscriptionStatus === "past_due"
    ) {
      return "Paiement à vérifier";
    }

    if (
      subscriptionStatus === "canceled"
    ) {
      return "Résilié";
    }

    if (
      subscriptionStatus === "unpaid"
    ) {
      return "Impayé";
    }

    return "En attente";
  }, [role, subscriptionStatus]);

  async function loadSettings() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "display_name, role"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "[PRIME Settings] Profile:",
          profileError
        );
      }

      if (
        profileData?.display_name
      ) {
        setDisplayName(
          profileData.display_name
        );
      }

      const currentRole =
        profileData?.role || "user";

      setRole(currentRole);

      if (
        currentRole ===
        "super_admin"
      ) {
        setPlan(null);
        setSubscriptionStatus(null);
        return;
      }

      const {
        data: subscriptionData,
        error: subscriptionError,
      } = await supabase
        .from("subscriptions")
        .select(
          `
            plan,
            status,
            stripe_customer_id,
            stripe_subscription_id,
            created_at
          `
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error(
          "[PRIME Settings] Subscription:",
          subscriptionError
        );

        setPlan(null);
        setSubscriptionStatus(null);

        return;
      }

      setPlan(
        subscriptionData?.plan ||
          null
      );

      setSubscriptionStatus(
        subscriptionData?.status ||
          null
      );
    } catch (error) {
      console.error(
        "[PRIME Settings] Load:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  async function handlePasswordReset() {
    if (!email) return;

    setMessage("");

    const siteUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "https://theprimeapp.com";

    const { error } =
      await supabase.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo:
              `${siteUrl}/reset-password`,
          }
        );

    if (error) {
      setMessage(
        "Impossible d’envoyer le lien pour le moment."
      );

      return;
    }

    setMessage(
      "Un lien de changement de mot de passe vient d’être envoyé."
    );
  }

  async function handleManageSubscription() {
    if (
      role === "super_admin"
    ) {
      setMessage(
        "Ton accès Super Admin ne nécessite aucun abonnement Stripe."
      );

      return;
    }

    if (!plan) {
      router.push("/offer");
      return;
    }

    try {
      setPortalLoading(true);
      setMessage("");

      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth
          .getSession();

      if (
        sessionError ||
        !session?.access_token
      ) {
        setMessage(
          "Ta session a expiré. Reconnecte-toi pour continuer."
        );

        return;
      }

      const response =
        await fetch(
          "/api/stripe/portal",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Impossible d’ouvrir le portail Stripe."
        );
      }

      if (!data?.url) {
        throw new Error(
          "Stripe n’a retourné aucune URL."
        );
      }

      window.location.href =
        data.url;
    } catch (error) {
      console.error(
        "[PRIME Billing Portal]",
        error
      );

      setMessage(
        error?.message ||
          "Impossible d’ouvrir la gestion de ton abonnement."
      );
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleExportData() {
    if (!userId || !email) {
      return;
    }

    setExporting(true);
    setMessage("");

    try {
      const [
        profileResult,
        identityResult,
        sessionsResult,
        prescriptionsResult,
        seasonsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),

        supabase
          .from(
            "prime_identity_history"
          )
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from("sessions")
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from(
            "prescriptions"
          )
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from("prime_seasons")
          .select("*")
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),
      ]);

      const sessions =
        sessionsResult.data || [];

      const scores = sessions
        .map((session) =>
          Number(
            session.discipline_score ||
              0
          )
        )
        .filter(
          (score) =>
            !Number.isNaN(score) &&
            score > 0
        );

      const exportPayload = {
        application: "PRIME",
        export_type:
          "user_data_rgpd",
        generated_at:
          new Date().toISOString(),

        user: {
          id: userId,
          email,
          display_name:
            displayName,
          role,
          plan,
          subscription_status:
            subscriptionStatus,
        },

        profile:
          profileResult.data ||
          null,

        identity_history:
          identityResult.data ||
          [],

        sessions,

        prescriptions:
          prescriptionsResult.data ||
          [],

        seasons:
          seasonsResult.data ||
          [],

        statistics: {
          sessions_count:
            sessions.length,

          average_discipline:
            scores.length > 0
              ? Math.round(
                  scores.reduce(
                    (
                      sum,
                      score
                    ) =>
                      sum +
                      score,
                    0
                  ) /
                    scores.length
                )
              : 0,

          best_discipline:
            scores.length > 0
              ? Math.max(
                  ...scores
                )
              : 0,
        },
      };

      const blob =
        new Blob(
          [
            JSON.stringify(
              exportPayload,
              null,
              2
            ),
          ],
          {
            type: "application/json",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `prime-export-${date}.json`;

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setMessage(
        "Export terminé. Ton fichier PRIME vient d’être téléchargé."
      );
    } catch (error) {
      console.error(
        "[PRIME Export]",
        error
      );

      setMessage(
        "Impossible d’exporter tes données pour le moment."
      );
    }

    setExporting(false);
  }

  function handleComingSoon(
    label
  ) {
    setMessage(
      `${label} sera disponible dans une prochaine mise à jour.`
    );
  }

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

        Chargement Settings...
      </main>
    );
  }
          .founder-card {
          border-color:
            rgba(
              212,
              176,
              106,
              0.30
            );
          background:
            radial-gradient(
              circle at 80% 12%,
              rgba(
                212,
                176,
                106,
                0.14
              ),
              transparent 32%
            ),
            linear-gradient(
              145deg,
              rgba(
                212,
                176,
                106,
                0.10
              ),
              rgba(
                255,
                255,
                255,
                0.018
              )
            ),
            rgba(
              12,
              12,
              12,
              0.96
            );
        }

        .founder-text {
          margin: 0;
          color:
            rgba(
              255,
              255,
              255,
              0.78
            );
          font-size: 14px;
          line-height: 1.58;
          font-weight: 650;
        }

        .founder-text strong {
          color: #D4B06A;
        }

        .message {
          margin: 0 0 14px;
          padding: 13px 14px;
          border-radius: 16px;
          background:
            rgba(
              212,
              176,
              106,
              0.09
            );
          border:
            1px solid
            rgba(
              212,
              176,
              106,
              0.18
            );
          color:
            rgba(
              255,
              255,
              255,
              0.78
            );
          font-size: 13px;
          line-height: 1.4;
          font-weight: 700;
        }

        .quote-card {
          border-radius: 30px;
          padding: 26px;
          margin-top: 18px;
          text-align: center;
          border-color:
            rgba(
              212,
              176,
              106,
              0.22
            );
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(
                212,
                176,
                106,
                0.12
              ),
              transparent 36%
            ),
            rgba(
              10,
              10,
              10,
              0.96
            );
        }

        .quote-card h2 {
          margin: 0;
          font-size: 34px;
          line-height: .98;
          font-weight: 1000;
          letter-spacing: -1.8px;
        }

        .quote-card h2 span {
          display: block;
          color: #D4B06A;
        }

        .quote-card p {
          margin: 18px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.54
            );
          font-size: 13px;
          line-height: 1.5;
        }

        .footer-brand {
          margin: 30px 0 0;
          text-align: center;
          color: #D4B06A;
          letter-spacing: 8px;
          font-size: 13px;
          font-weight: 950;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform:
              translateY(16px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        @media(max-width: 390px) {
          .settings-page {
            padding-left: 14px;
            padding-right: 14px;
          }

          .title {
            font-size: 38px;
          }

          .avatar {
            width: 52px;
            height: 52px;
            border-radius: 18px;
          }

          .account-name {
            font-size: 22px;
          }

          .section {
            padding: 16px;
            border-radius: 26px;
          }

          .quote-card h2 {
            font-size: 30px;
          }
        }
      `}</style>

      <div className="page">
        <div className="topbar">
          <button
            className="back-button"
            type="button"
            onClick={() =>
              router.push(
                "/profile"
              )
            }
            aria-label="Retour au profil"
          >
            <ArrowLeft
              size={21}
            />
          </button>

          <p className="brand">
            PRIME
          </p>

          <div
            style={{
              width: 44,
            }}
          />
        </div>

        <section className="hero">
          <div className="eyebrow">
            Paramètres
          </div>

          <h1 className="title">
            Ton espace
            <span>compte.</span>
          </h1>

          <p className="subtitle">
            Gère ton accès, ton abonnement,
            tes données et les informations
            légales de PRIME.
          </p>
        </section>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <section className="status-card">
          <div className="status-top">
            <div className="avatar">
              {displayName
                ?.charAt(0)
                ?.toUpperCase() ||
                "P"}
            </div>

            <div
              style={{
                flex: 1,
              }}
            >
              <h2 className="account-name">
                {displayName}
              </h2>

              <p className="account-email">
                {email}
              </p>
            </div>

            <div className="pill">
              {accountLabel}
            </div>
          </div>
        </section>

        <section className="section">
          <SectionHead
            icon={
              <User
                size={21}
              />
            }
            title="Mon compte"
            subtitle="Informations principales et sécurité."
          />

          <div className="info-grid">
            <InfoRow
              label="Nom"
              value={displayName}
            />

            <InfoRow
              label="Email"
              value={email}
            />

            <InfoRow
              label="Rôle"
              value={accountLabel}
            />
          </div>

          <div
            className="action-list"
            style={{
              marginTop: 14,
            }}
          >
            <SettingAction
              icon={
                <User
                  size={18}
                />
              }
              title="Modifier mon profil"
              subtitle="Nom affiché et informations personnelles."
              onClick={() =>
                router.push(
                  "/profile"
                )
              }
            />

            <SettingAction
              icon={
                <Lock
                  size={18}
                />
              }
              title="Changer mon mot de passe"
              subtitle="Recevoir un lien sécurisé par email."
              onClick={
                handlePasswordReset
              }
            />

            <SettingAction
              icon={
                <LogOut
                  size={18}
                />
              }
              title="Déconnexion"
              subtitle="Quitter ton compte PRIME."
              onClick={
                handleLogout
              }
            />
          </div>
        </section>

        <section className="section">
          <SectionHead
            icon={
              <Wallet
                size={21}
              />
            }
            title="Mon abonnement"
            subtitle="Offre actuelle et statut d’accès."
          />

          <div className="info-grid">
            <InfoRow
              label="Offre"
              value={planLabel}
              highlight
            />

            <InfoRow
              label="Statut"
              value={statusLabel}
              success={
                subscriptionStatus ===
                  "active" ||
                subscriptionStatus ===
                  "trialing" ||
                role ===
                  "super_admin"
              }
            />

            <InfoRow
              label="Facturation"
              value={
                role ===
                "super_admin"
                  ? "Bypass admin"
                  : plan ===
                    "founder"
                  ? "9,99 €/mois"
                  : plan ===
                    "standard"
                  ? "24,99 €/mois"
                  : "Non configurée"
              }
            />
          </div>

          <div
            className="action-list"
            style={{
              marginTop: 14,
            }}
          >
            <SettingAction
              icon={
                <Wallet
                  size={18}
                />
              }
              title={
                portalLoading
                  ? "Ouverture de Stripe..."
                  : role ===
                    "super_admin"
                  ? "Accès administrateur"
                  : plan
                  ? "Gérer mon abonnement"
                  : "Choisir une offre"
              }
              subtitle={
                role ===
                "super_admin"
                  ? "Accès administrateur — aucune facturation."
                  : plan
                  ? "Facturation, moyen de paiement et résiliation."
                  : "Découvrir les offres PRIME."
              }
              onClick={
                handleManageSubscription
              }
              disabled={
                portalLoading
              }
            />
          </div>
        </section>

        {(plan === "founder" ||
          role ===
            "super_admin") && (
          <section className="section founder-card">
            <SectionHead
              icon={
                <Crown
                  size={21}
                />
              }
              title={
                role ===
                "super_admin"
                  ? "Accès Super Admin"
                  : "Founder"
              }
              subtitle="Accès privilégié PRIME."
            />

            <p className="founder-text">
              <strong>
                Merci de faire
                partie des
                premiers accès
                PRIME.
              </strong>

              <br />
              <br />

              Les Founder
              participent
              directement à
              l’évolution du
              produit. Tes
              retours auront un
              impact concret sur
              les prochaines
              fonctionnalités.
            </p>

            <div
              className="action-list"
              style={{
                marginTop: 16,
              }}
            >
              <SettingAction
                icon={
                  <Mail
                    size={18}
                  />
                }
                title="Envoyer un feedback"
                subtitle="Partager une idée, un bug ou une amélioration."
                href="mailto:support@theprimeapp.com?subject=Feedback%20Founder%20PRIME"
              />
            </div>
          </section>
        )}
                <section className="section">
          <SectionHead
            icon={
              <Database
                size={21}
              />
            }
            title="Mes données"
            subtitle="Contrôle, export et nouvelle progression PRIME."
          />

          <div className="action-list">
            <SettingAction
              icon={
                <Download
                  size={18}
                />
              }
              title={
                exporting
                  ? "Export en cours..."
                  : "Exporter mes données"
              }
              subtitle="Télécharge profil, sessions, identité, prescriptions et saisons au format JSON."
              onClick={
                handleExportData
              }
              disabled={
                exporting
              }
            />

            <SettingAction
              icon={
                <RefreshCcw
                  size={18}
                />
              }
              title="🚧 Nouvelle Saison PRIME"
              subtitle="Une fonctionnalité majeure actuellement en préparation."
              onClick={() =>
                setMessage(
                  "🚧 Les Saisons PRIME arriveront après le lancement. Elles permettront de recommencer une progression tout en conservant l'intégralité de ton historique, avec des statistiques, un Coach et un Dashboard dédiés à chaque saison."
                )
              }
            />

            <SettingAction
              icon={
                <Trash2
                  size={18}
                />
              }
              title="Supprimer mon compte"
              subtitle="Suppression définitive. Confirmation obligatoire."
              danger
              onClick={() =>
                handleComingSoon(
                  "Suppression du compte"
                )
              }
            />
          </div>
        </section>

        <section className="section">
          <SectionHead
            icon={
              <FileText
                size={21}
              />
            }
            title="Légal"
            subtitle="Documents nécessaires avant le lancement officiel."
          />

          <div className="action-list">
            <SettingAction
              icon={
                <BookOpen
                  size={18}
                />
              }
              title="CGU / CGV"
              subtitle="Conditions d’utilisation et de vente."
              onClick={() =>
                router.push(
                  "/legal/terms"
                )
              }
            />

            <SettingAction
              icon={
                <Shield
                  size={18}
                />
              }
              title="Politique de confidentialité"
              subtitle="Traitement des données et RGPD."
              onClick={() =>
                router.push(
                  "/legal/privacy"
                )
              }
            />

            <SettingAction
              icon={
                <FileText
                  size={18}
                />
              }
              title="Mentions légales"
              subtitle="Informations légales de l’éditeur."
              onClick={() =>
                router.push(
                  "/legal/mentions"
                )
              }
            />
          </div>
        </section>

        <section className="section">
          <SectionHead
            icon={
              <LifeBuoy
                size={21}
              />
            }
            title="Support"
            subtitle="Aide, bugs et contact."
          />

          <div className="action-list">
            <SettingAction
              icon={
                <HelpCircle
                  size={18}
                />
              }
              title="Centre d’aide"
              subtitle="FAQ et réponses aux questions fréquentes."
              onClick={() =>
                router.push(
                  "/help"
                )
              }
            />

            <SettingAction
              icon={
                <Bug
                  size={18}
                />
              }
              title="Signaler un bug"
              subtitle="Préparer un retour clair pour l’équipe PRIME."
              href="mailto:support@theprimeapp.com?subject=Bug%20PRIME"
            />

            <SettingAction
              icon={
                <Mail
                  size={18}
                />
              }
              title="Contacter PRIME"
              subtitle="support@theprimeapp.com"
              href="mailto:support@theprimeapp.com"
            />
          </div>
        </section>

        <section className="section">
          <SectionHead
            icon={
              <Sparkles
                size={21}
              />
            }
            title="À propos"
            subtitle="Version et identité de l’application."
          />

          <div className="info-grid">
            <InfoRow
              label="Application"
              value="PRIME"
              highlight
            />

            <InfoRow
              label="Version"
              value="v1.0 Founder Edition"
            />

            <InfoRow
              label="Mission"
              value="Construire des traders disciplinés."
            />
          </div>
        </section>

        <section className="quote-card">
          <h2>
            La discipline
            <span>
              n’est pas un talent.
            </span>
          </h2>

          <p>
            C’est une décision
            que tu prends chaque
            jour.
            <br />
            PRIME est là pour te
            la rappeler.
          </p>
        </section>

        <p className="footer-brand">
          PRIME.
        </p>
      </div>

      <BottomNav
        active="Profil"
      />
    </main>
  );
}

function SectionHead({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="section-head">
      <div className="section-icon">
        {icon}
      </div>

      <div>
        <h2 className="section-title">
          {title}
        </h2>

        <p className="section-copy">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
  success,
}) {
  return (
    <div className="info-row">
      <span className="info-label">
        {label}
      </span>

      <span
        className={`info-value ${
          highlight
            ? "gold"
            : ""
        } ${
          success
            ? "green"
            : ""
        }`}
      >
        {value ||
          "Non renseigné"}
      </span>
    </div>
  );
}

function SettingAction({
  icon,
  title,
  subtitle,
  href,
  onClick,
  danger,
  disabled = false,
}) {
  const content = (
    <>
      <div className="action-left">
        <div className="action-icon">
          {icon}
        </div>

        <div>
          <p className="action-title">
            {title}
          </p>

          <p className="action-subtitle">
            {subtitle}
          </p>
        </div>
      </div>

      <ChevronRight
        size={18}
        color={
          danger
            ? "#ff6868"
            : "rgba(255,255,255,0.36)"
        }
      />
    </>
  );

  if (href) {
    return (
      <a
        className={`setting-action ${
          danger
            ? "danger-action"
            : ""
        }`}
        href={href}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`setting-action ${
        danger
          ? "danger-action"
          : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

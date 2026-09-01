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
    return (
    <main className="settings-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          background: #000;
        }

        .settings-page {
          min-height: 100vh;
          padding: 28px 16px 132px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(
              circle at 84% 2%,
              rgba(212,176,106,0.12),
              transparent 26%
            ),
            radial-gradient(
              circle at 8% 12%,
              rgba(255,255,255,0.035),
              transparent 22%
            ),
            linear-gradient(
              180deg,
              #030303 0%,
              #000 56%,
              #000 100%
            );
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
          justify-content:
            space-between;
          gap: 14px;
          margin-bottom: 26px;
        }

        .back-button {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );
          background:
            rgba(
              255,
              255,
              255,
              0.045
            );
          color: white;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .brand {
          margin: 0;
          color: #D4B06A;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 7px;
          text-transform:
            uppercase;
        }

        .hero {
          margin-bottom: 20px;
          animation:
            fadeUp .45s ease both;
        }

        .eyebrow {
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
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
              0.25
            );
          color: #D4B06A;
          font-size: 10.5px;
          font-weight: 950;
          letter-spacing: 2px;
          text-transform:
            uppercase;
          margin-bottom: 16px;
        }

        .title {
          margin: 0;
          font-size: 43px;
          line-height: .96;
          font-weight: 1000;
          letter-spacing: -2.4px;
        }

        .title span {
          display: block;
          background:
            linear-gradient(
              180deg,
              #fff 0%,
              #D4B06A 88%
            );
          -webkit-background-clip:
            text;
          -webkit-text-fill-color:
            transparent;
        }

        .subtitle {
          margin: 15px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.64
            );
          font-size: 15.5px;
          line-height: 1.55;
        }

        .status-card,
        .section,
        .quote-card {
          background:
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.07
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
              0.94
            );
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );
          box-shadow:
            0 22px 70px
            rgba(
              0,
              0,
              0,
              0.58
            );
          backdrop-filter:
            blur(18px);
        }

        .status-card {
          border-radius: 30px;
          padding: 20px;
          margin-bottom: 16px;
          border-color:
            rgba(
              212,
              176,
              106,
              0.22
            );
        }

        .status-top {
          display: flex;
          align-items:
            flex-start;
          justify-content:
            space-between;
          gap: 12px;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 20px;
          background:
            linear-gradient(
              135deg,
              #9d742f,
              #d6b25f,
              #fff2b8
            );
          color: #000;
          display: grid;
          place-items: center;
          font-size: 24px;
          font-weight: 1000;
          flex-shrink: 0;
        }

        .account-name {
          margin: 0;
          font-size: 24px;
          line-height: 1.05;
          font-weight: 1000;
          letter-spacing: -0.8px;
        }

        .account-email {
          margin: 8px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.55
            );
          font-size: 13px;
          line-height: 1.35;
          word-break: break-word;
        }

        .pill {
          width: fit-content;
          padding: 8px 10px;
          border-radius: 999px;
          background:
            rgba(
              212,
              176,
              106,
              0.10
            );
          border:
            1px solid
            rgba(
              212,
              176,
              106,
              0.24
            );
          color: #D4B06A;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.4px;
          text-transform:
            uppercase;
          white-space: nowrap;
        }

        .section {
          border-radius: 28px;
          padding: 18px;
          margin-bottom: 14px;
        }

        .section-head {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 15px;
        }

        .section-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #D4B06A;
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
          flex-shrink: 0;
        }

        .section-title {
          margin: 0;
          font-size: 19px;
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: -0.4px;
        }

        .section-copy {
          margin: 5px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.54
            );
          font-size: 12.5px;
          line-height: 1.4;
        }

        .info-grid {
          display: grid;
          gap: 10px;
        }

        .info-row {
          display: flex;
          justify-content:
            space-between;
          gap: 14px;
          padding: 12px 0;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color:
            rgba(
              255,
              255,
              255,
              0.52
            );
          font-size: 13px;
          font-weight: 700;
        }

        .info-value {
          color:
            rgba(
              255,
              255,
              255,
              0.88
            );
          font-size: 13px;
          font-weight: 850;
          text-align: right;
          word-break: break-word;
        }

        .gold {
          color: #D4B06A;
        }

        .green {
          color: #7DFFA1;
        }

        .action-list {
          display: grid;
          gap: 10px;
        }

        .setting-action {
          width: 100%;
          min-height: 58px;
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          border-radius: 18px;
          padding: 13px 14px;
          background:
            rgba(
              255,
              255,
              255,
              0.035
            );
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }

        .setting-action:hover {
          border-color:
            rgba(
              212,
              176,
              106,
              0.22
            );
          background:
            rgba(
              212,
              176,
              106,
              0.055
            );
        }

        .setting-action:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .setting-action.danger-action:hover {
          border-color:
            rgba(
              255,
              104,
              104,
              0.28
            );
          background:
            rgba(
              255,
              104,
              104,
              0.07
            );
        }

        .action-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background:
            rgba(
              0,
              0,
              0,
              0.30
            );
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          color: #D4B06A;
          flex-shrink: 0;
        }

        .danger-action
        .action-icon {
          color: #ff6868;
        }

        .action-title {
          margin: 0;
          font-size: 14px;
          line-height: 1.15;
          font-weight: 900;
        }

        .action-subtitle {
          margin: 5px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.48
            );
          font-size: 12px;
          line-height: 1.3;
        }
          return (
    <main className="settings-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          background: #000;
        }

        .settings-page {
          min-height: 100vh;
          padding: 28px 16px 132px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(
              circle at 84% 2%,
              rgba(212,176,106,0.12),
              transparent 26%
            ),
            radial-gradient(
              circle at 8% 12%,
              rgba(255,255,255,0.035),
              transparent 22%
            ),
            linear-gradient(
              180deg,
              #030303 0%,
              #000 56%,
              #000 100%
            );
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
          justify-content:
            space-between;
          gap: 14px;
          margin-bottom: 26px;
        }

        .back-button {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );
          background:
            rgba(
              255,
              255,
              255,
              0.045
            );
          color: white;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .brand {
          margin: 0;
          color: #D4B06A;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 7px;
          text-transform:
            uppercase;
        }

        .hero {
          margin-bottom: 20px;
          animation:
            fadeUp .45s ease both;
        }

        .eyebrow {
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
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
              0.25
            );
          color: #D4B06A;
          font-size: 10.5px;
          font-weight: 950;
          letter-spacing: 2px;
          text-transform:
            uppercase;
          margin-bottom: 16px;
        }

        .title {
          margin: 0;
          font-size: 43px;
          line-height: .96;
          font-weight: 1000;
          letter-spacing: -2.4px;
        }

        .title span {
          display: block;
          background:
            linear-gradient(
              180deg,
              #fff 0%,
              #D4B06A 88%
            );
          -webkit-background-clip:
            text;
          -webkit-text-fill-color:
            transparent;
        }

        .subtitle {
          margin: 15px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.64
            );
          font-size: 15.5px;
          line-height: 1.55;
        }

        .status-card,
        .section,
        .quote-card {
          background:
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.07
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
              0.94
            );
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );
          box-shadow:
            0 22px 70px
            rgba(
              0,
              0,
              0,
              0.58
            );
          backdrop-filter:
            blur(18px);
        }

        .status-card {
          border-radius: 30px;
          padding: 20px;
          margin-bottom: 16px;
          border-color:
            rgba(
              212,
              176,
              106,
              0.22
            );
        }

        .status-top {
          display: flex;
          align-items:
            flex-start;
          justify-content:
            space-between;
          gap: 12px;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 20px;
          background:
            linear-gradient(
              135deg,
              #9d742f,
              #d6b25f,
              #fff2b8
            );
          color: #000;
          display: grid;
          place-items: center;
          font-size: 24px;
          font-weight: 1000;
          flex-shrink: 0;
        }

        .account-name {
          margin: 0;
          font-size: 24px;
          line-height: 1.05;
          font-weight: 1000;
          letter-spacing: -0.8px;
        }

        .account-email {
          margin: 8px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.55
            );
          font-size: 13px;
          line-height: 1.35;
          word-break: break-word;
        }

        .pill {
          width: fit-content;
          padding: 8px 10px;
          border-radius: 999px;
          background:
            rgba(
              212,
              176,
              106,
              0.10
            );
          border:
            1px solid
            rgba(
              212,
              176,
              106,
              0.24
            );
          color: #D4B06A;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.4px;
          text-transform:
            uppercase;
          white-space: nowrap;
        }

        .section {
          border-radius: 28px;
          padding: 18px;
          margin-bottom: 14px;
        }

        .section-head {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 15px;
        }

        .section-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #D4B06A;
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
          flex-shrink: 0;
        }

        .section-title {
          margin: 0;
          font-size: 19px;
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: -0.4px;
        }

        .section-copy {
          margin: 5px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.54
            );
          font-size: 12.5px;
          line-height: 1.4;
        }

        .info-grid {
          display: grid;
          gap: 10px;
        }

        .info-row {
          display: flex;
          justify-content:
            space-between;
          gap: 14px;
          padding: 12px 0;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color:
            rgba(
              255,
              255,
              255,
              0.52
            );
          font-size: 13px;
          font-weight: 700;
        }

        .info-value {
          color:
            rgba(
              255,
              255,
              255,
              0.88
            );
          font-size: 13px;
          font-weight: 850;
          text-align: right;
          word-break: break-word;
        }

        .gold {
          color: #D4B06A;
        }

        .green {
          color: #7DFFA1;
        }

        .action-list {
          display: grid;
          gap: 10px;
        }

        .setting-action {
          width: 100%;
          min-height: 58px;
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          border-radius: 18px;
          padding: 13px 14px;
          background:
            rgba(
              255,
              255,
              255,
              0.035
            );
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }

        .setting-action:hover {
          border-color:
            rgba(
              212,
              176,
              106,
              0.22
            );
          background:
            rgba(
              212,
              176,
              106,
              0.055
            );
        }

        .setting-action:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .setting-action.danger-action:hover {
          border-color:
            rgba(
              255,
              104,
              104,
              0.28
            );
          background:
            rgba(
              255,
              104,
              104,
              0.07
            );
        }

        .action-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background:
            rgba(
              0,
              0,
              0,
              0.30
            );
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          color: #D4B06A;
          flex-shrink: 0;
        }

        .danger-action
        .action-icon {
          color: #ff6868;
        }

        .action-title {
          margin: 0;
          font-size: 14px;
          line-height: 1.15;
          font-weight: 900;
        }

        .action-subtitle {
          margin: 5px 0 0;
          color:
            rgba(
              255,
              255,
              255,
              0.48
            );
          font-size: 12px;
          line-height: 1.3;
        }
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

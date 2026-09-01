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

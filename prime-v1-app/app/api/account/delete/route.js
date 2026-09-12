import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const runtime = "nodejs";

function makeSupabaseClient(key) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function DELETE(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !stripeSecretKey) {
      console.error(
        "[PRIME Account Delete] Missing server environment variables."
      );

      return NextResponse.json(
        { error: "Configuration serveur incomplète." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization") || "";

    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    const authClient = makeSupabaseClient(anonKey);
    const adminClient = makeSupabaseClient(serviceRoleKey);
    const stripe = new Stripe(stripeSecretKey);

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session invalide ou expirée." },
        { status: 401 }
      );
    }

    // Vérification du rôle.
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "[PRIME Account Delete] Profile lookup:",
        profileError
      );

      return NextResponse.json(
        { error: "Impossible de vérifier le compte." },
        { status: 500 }
      );
    }

    // Protection des comptes administrateurs PRIME.
    if (profile?.role === "super_admin") {
      return NextResponse.json(
        {
          error:
            "Un compte Super Admin ne peut pas être supprimé depuis l’application.",
        },
        { status: 403 }
      );
    }

    // Recherche du dernier abonnement Stripe.
    const { data: subscription, error: subscriptionError } =
      await adminClient
        .from("subscriptions")
        .select("stripe_subscription_id, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (subscriptionError) {
      console.error(
        "[PRIME Account Delete] Subscription lookup:",
        subscriptionError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier l’abonnement avant suppression.",
        },
        { status: 500 }
      );
    }

    // On résilie Stripe AVANT de supprimer le compte.
    // Cela évite qu'un utilisateur supprimé continue à être facturé.
    if (
      subscription?.stripe_subscription_id &&
      !["canceled", "incomplete_expired"].includes(subscription.status)
    ) {
      try {
        await stripe.subscriptions.cancel(
          subscription.stripe_subscription_id
        );
      } catch (stripeError) {
        // Si l'abonnement n'existe déjà plus chez Stripe,
        // on peut continuer la suppression.
        if (stripeError?.code !== "resource_missing") {
          console.error(
            "[PRIME Account Delete] Stripe cancellation:",
            stripeError
          );

          return NextResponse.json(
            {
              error:
                "La résiliation Stripe a échoué. Le compte n’a pas été supprimé afin d’éviter toute facturation restante.",
            },
            { status: 502 }
          );
        }
      }
    }

    // Suppression des données PRIME liées à l'utilisateur.
    const userOwnedTables = [
      "prescriptions",
      "sessions",
      "prime_identity_history",
      "prime_seasons",
    ];

    for (const table of userOwnedTables) {
      const { error } = await adminClient
        .from(table)
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error(
          `[PRIME Account Delete] ${table}:`,
          error
        );

        return NextResponse.json(
          {
            error:
              "La suppression des données PRIME n’a pas pu être terminée. Contacte le support si le problème persiste.",
          },
          { status: 500 }
        );
      }
    }

    // Suppression des données d'abonnement PRIME.
    const { error: subscriptionDeleteError } = await adminClient
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id);

    if (subscriptionDeleteError) {
      console.error(
        "[PRIME Account Delete] subscriptions:",
        subscriptionDeleteError
      );

      return NextResponse.json(
        {
          error:
            "La suppression des données d’abonnement n’a pas pu être terminée.",
        },
        { status: 500 }
      );
    }

    // Suppression du profil.
    const { error: profileDeleteError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileDeleteError) {
      console.error(
        "[PRIME Account Delete] profiles:",
        profileDeleteError
      );

      return NextResponse.json(
        {
          error:
            "La suppression du profil n’a pas pu être terminée.",
        },
        { status: 500 }
      );
    }

    // Suppression finale du compte Supabase Auth.
    const { error: authDeleteError } =
      await adminClient.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error(
        "[PRIME Account Delete] Auth user:",
        authDeleteError
      );

      return NextResponse.json(
        {
          error:
            "Les données PRIME ont été supprimées, mais la suppression du compte d’authentification a échoué. Contacte le support.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "[PRIME Account Delete] Unexpected:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de supprimer le compte pour le moment.",
      },
      { status: 500 }
    );
  }
}

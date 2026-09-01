import {
  NextResponse,
} from "next/server";

import Stripe from "stripe";

import {
  createClient,
} from "@supabase/supabase-js";

export const runtime =
  "nodejs";

export async function POST(
  request
) {
  try {
    if (
      !process.env
        .STRIPE_SECRET_KEY ||
      !process.env
        .NEXT_PUBLIC_SUPABASE_URL ||
      !process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      !process.env
        .SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "[Stripe Portal] Configuration serveur incomplète"
      );

      return NextResponse.json(
        {
          error:
            "Configuration serveur incomplète.",
        },
        {
          status: 500,
        }
      );
    }

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Utilisateur non authentifié.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization.replace(
        "Bearer ",
        ""
      );

    const supabase =
      createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser(
        accessToken
      );

    if (
      userError ||
      !user
    ) {
      console.error(
        "[Stripe Portal] Auth Supabase:",
        userError
      );

      return NextResponse.json(
        {
          error:
            "Session utilisateur invalide.",
        },
        {
          status: 401,
        }
      );
    }

    const supabaseAdmin =
      createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL,
        process.env
          .SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken:
              false,
          },
        }
      );

    const {
      data: profile,
      error: profileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "[Stripe Portal] Profile:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier le compte.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      profile?.role ===
      "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Le compte administrateur ne possède pas d’abonnement Stripe.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: subscription,
      error:
        subscriptionError,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .select(
          `
            stripe_customer_id,
            stripe_subscription_id,
            status,
            plan,
            created_at
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

    if (
      subscriptionError
    ) {
      console.error(
        "[Stripe Portal] Subscription:",
        subscriptionError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer l’abonnement.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !subscription
        ?.stripe_customer_id
    ) {
      return NextResponse.json(
        {
          error:
            "Aucun abonnement Stripe trouvé.",
        },
        {
          status: 404,
        }
      );
    }

    const stripe =
      new Stripe(
        process.env
          .STRIPE_SECRET_KEY
      );

    const origin =
      request.headers.get(
        "origin"
      ) ||
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "https://theprimeapp.com";

    const portalSession =
      await stripe
        .billingPortal
        .sessions
        .create({
          customer:
            subscription
              .stripe_customer_id,

          return_url:
            `${origin}/settings`,
        });

    if (
      !portalSession?.url
    ) {
      throw new Error(
        "Stripe n'a retourné aucune URL de portail."
      );
    }

    return NextResponse.json(
      {
        url:
          portalSession.url,
      }
    );
  } catch (error) {
    console.error(
      "[Stripe Portal] Erreur:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d’ouvrir le portail Stripe.",
      },
      {
        status: 500,
      }
    );
  }
}

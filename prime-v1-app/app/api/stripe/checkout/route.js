import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

const PRICE_IDS = {
  founder: "price_1TcXPF2e7ZbP48FdLW2eiQLD",
  standard: "price_1TcXXF2e7ZbP48FdbmTGdWKZ",
};

export async function POST(request) {
  try {
    if (
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error(
        "[Stripe Checkout] Configuration serveur incomplète"
      );

      return NextResponse.json(
        {
          error: "Configuration serveur incomplète.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Récupération du token Supabase
     */
    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error: "Utilisateur non authentifié.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization.replace("Bearer ", "");

    /*
     * Vérification de l'utilisateur Supabase
     */
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      console.error(
        "[Stripe Checkout] Auth Supabase :",
        userError
      );

      return NextResponse.json(
        {
          error: "Session utilisateur invalide.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Offre sélectionnée
     */
    const body = await request.json();
    const plan = body?.plan;

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json(
        {
          error: "Offre PRIME invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const priceId = PRICE_IDS[plan];

    /*
     * URL de PRIME
     */
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL;

    if (!origin) {
      return NextResponse.json(
        {
          error: "URL PRIME introuvable.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Configuration de l'abonnement
     *
     * Founder = aucun essai
     * Standard = 7 jours d'essai
     */
    const subscriptionData = {
      metadata: {
        user_id: user.id,
        plan,
      },
    };

    if (plan === "standard") {
      subscriptionData.trial_period_days = 7;
    }

    /*
     * Création du Checkout Stripe
     */
    const checkoutSession =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        customer_email: user.email,

        client_reference_id: user.id,

        metadata: {
          user_id: user.id,
          plan,
        },

        subscription_data: subscriptionData,

        success_url:
          `${origin}/?checkout=success`,

        cancel_url:
          `${origin}/offer?checkout=cancelled`,
      });

    if (!checkoutSession.url) {
      throw new Error(
        "Stripe n'a retourné aucune URL Checkout."
      );
    }

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error(
      "[Stripe Checkout] Erreur :",
      error
    );

    return NextResponse.json(
      {
        error: "Impossible de démarrer le paiement.",
      },
      {
        status: 500,
      }
    );
  }
}

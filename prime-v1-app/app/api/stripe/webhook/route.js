import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    if (
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.STRIPE_WEBHOOK_SECRET ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "[Stripe Webhook] Configuration serveur incomplète"
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

    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const signature =
      request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        {
          error: "Signature Stripe absente.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.text();

    let event;

    try {
      event =
        stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
      console.error(
        "[Stripe Webhook] Signature invalide :",
        error
      );

      return NextResponse.json(
        {
          error: "Signature Stripe invalide.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "[Stripe Webhook] Event reçu :",
      event.type
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object;

        const userId =
          session.metadata?.user_id ||
          session.client_reference_id;

        const plan =
          session.metadata?.plan || null;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (
          !userId ||
          !subscriptionId
        ) {
          console.warn(
            "[Stripe Webhook] Checkout incomplet : user_id ou subscription absent"
          );

          break;
        }

        const subscription =
          await stripe.subscriptions.retrieve(
            subscriptionId
          );

        await saveSubscription({
          supabaseAdmin,
          userId,
          plan,
          customerId,
          subscription,
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription =
          event.data.object;

        const userId =
          subscription.metadata?.user_id;

        const plan =
          subscription.metadata?.plan || null;

        if (!userId) {
          console.warn(
            "[Stripe Webhook] Abonnement sans user_id :",
            subscription.id
          );

          break;
        }

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        await saveSubscription({
          supabaseAdmin,
          userId,
          plan,
          customerId,
          subscription,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription =
          event.data.object;

        const userId =
          subscription.metadata?.user_id;

        if (!userId) {
          console.warn(
            "[Stripe Webhook] Suppression sans user_id :",
            subscription.id
          );

          break;
        }

        const {
          error,
        } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq(
            "stripe_subscription_id",
            subscription.id
          );

        if (error) {
          throw error;
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice =
          event.data.object;

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!subscriptionId) {
          break;
        }

        const {
          error,
        } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "past_due",
          })
          .eq(
            "stripe_subscription_id",
            subscriptionId
          );

        if (error) {
          throw error;
        }

        break;
      }

      default: {
        console.log(
          "[Stripe Webhook] Event ignoré :",
          event.type
        );
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "[Stripe Webhook] Erreur :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erreur lors du traitement du webhook.",
      },
      {
        status: 500,
      }
    );
  }
}

async function saveSubscription({
  supabaseAdmin,
  userId,
  plan,
  customerId,
  subscription,
}) {
  const subscriptionId =
    subscription.id;

  const status =
    subscription.status;

  const {
    data: existingSubscription,
    error: existingError,
  } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq(
      "stripe_subscription_id",
      subscriptionId
    )
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingSubscription) {
    const {
      error: updateError,
    } = await supabaseAdmin
      .from("subscriptions")
      .update({
        plan,
        status,
        stripe_customer_id:
          customerId || null,
        user_id: userId,
      })
      .eq(
        "id",
        existingSubscription.id
      );

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const {
    data: userSubscription,
    error: userSubscriptionError,
  } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq(
      "user_id",
      userId
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (userSubscriptionError) {
    throw userSubscriptionError;
  }

  if (userSubscription) {
    const {
      error: updateError,
    } = await supabaseAdmin
      .from("subscriptions")
      .update({
        plan,
        status,
        stripe_customer_id:
          customerId || null,
        stripe_subscription_id:
          subscriptionId,
      })
      .eq(
        "id",
        userSubscription.id
      );

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const {
    error: insertError,
  } = await supabaseAdmin
    .from("subscriptions")
    .insert({
      user_id: userId,
      plan,
      status,
      stripe_customer_id:
        customerId || null,
      stripe_subscription_id:
        subscriptionId,
    });

  if (insertError) {
    throw insertError;
  }
}

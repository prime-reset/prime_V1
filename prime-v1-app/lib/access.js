export async function getUserAccess({
  supabase,
  userId,
}) {
  if (!supabase || !userId) {
    return {
      allowed: false,
      reason: "unauthenticated",
      role: null,
      subscription: null,
    };
  }

  /*
   * 1. Récupération du rôle PRIME
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error(
      "[PRIME Access] Erreur profil :",
      profileError
    );

    return {
      allowed: false,
      reason: "profile_error",
      role: null,
      subscription: null,
    };
  }

  const role =
    profile?.role || "user";

  /*
   * 2. Les super_admin passent
   *    toujours sans abonnement.
   */
  if (role === "super_admin") {
    return {
      allowed: true,
      reason: "super_admin",
      role,
      subscription: null,
    };
  }

  /*
   * 3. Tous les autres comptes
   *    doivent avoir une subscription.
   */
  const {
    data: subscription,
    error: subscriptionError,
  } = await supabase
    .from("subscriptions")
    .select(
      `
        id,
        plan,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        user_id,
        created_at
      `
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) {
    console.error(
      "[PRIME Access] Erreur abonnement :",
      subscriptionError
    );

    return {
      allowed: false,
      reason: "subscription_error",
      role,
      subscription: null,
    };
  }

  /*
   * 4. Aucun abonnement :
   *    accès refusé.
   */
  if (!subscription) {
    return {
      allowed: false,
      reason: "no_subscription",
      role,
      subscription: null,
    };
  }

  /*
   * 5. Statuts autorisés.
   *
   * Stripe utilisera notamment :
   * active
   * trialing
   */
  const ACTIVE_STATUSES = [
    "active",
    "trialing",
  ];

  const allowed =
    ACTIVE_STATUSES.includes(
      subscription.status
    );

  return {
    allowed,

    reason: allowed
      ? subscription.status
      : "inactive_subscription",

    role,

    subscription,
  };
}

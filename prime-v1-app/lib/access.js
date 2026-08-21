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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error(
      "[PRIME Access] profile error:",
      profileError
    );

    return {
      allowed: false,
      reason: "profile_error",
      role: null,
      subscription: null,
    };
  }

  const role = profile?.role || "user";

  if (role === "super_admin") {
    return {
      allowed: true,
      reason: "super_admin",
      role,
      subscription: null,
    };
  }

  const { data: subscription, error: subscriptionError } =
    await supabase
      .from("subscriptions")
      .select(
        "plan, status, start_date, end_date, trial_end, is_trial"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (subscriptionError) {
    console.error(
      "[PRIME Access] subscription error:",
      subscriptionError
    );

    return {
      allowed: false,
      reason: "subscription_error",
      role,
      subscription: null,
    };
  }

  if (!subscription) {
    return {
      allowed: false,
      reason: "no_subscription",
      role,
      subscription: null,
    };
  }

  const now = new Date();

  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end)
    : null;

  const endDate = subscription.end_date
    ? new Date(subscription.end_date)
    : null;

  const activeTrial =
    subscription.is_trial === true &&
    trialEnd &&
    trialEnd > now;

  const activeSubscription =
    subscription.status === "active" &&
    (!endDate || endDate > now);

  const allowed =
    activeTrial ||
    activeSubscription;

  return {
    allowed,
    reason: allowed
      ? activeTrial
        ? "trial"
        : "subscription"
      : "inactive_subscription",
    role,
    subscription,
  };
}

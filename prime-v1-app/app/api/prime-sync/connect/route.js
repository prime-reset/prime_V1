import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // 1. Vérifier l'utilisateur PRIME connecté
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié." },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session PRIME invalide." },
        { status: 401 }
      );
    }

    // 2. Récupérer les informations du compte MT5
    const body = await request.json();

    const {
      external_account_id,
      account_name = null,
      broker_name = null,
      account_currency = null,
    } = body;

    if (!external_account_id) {
      return NextResponse.json(
        { error: "Identifiant du compte MT5 manquant." },
        { status: 400 }
      );
    }

    // 3. Générer une clé PRIME Sync aléatoire
    const syncToken = crypto.randomBytes(32).toString("hex");

    // On ne stocke jamais la clé brute dans Supabase.
    const syncTokenHash = crypto
      .createHash("sha256")
      .update(syncToken)
      .digest("hex");

    // 4. Créer ou mettre à jour le compte de trading
    const { data: tradingAccount, error: accountError } =
      await supabaseAdmin
        .from("trading_accounts")
        .upsert(
          {
            user_id: user.id,
            platform: "mt5",
            external_account_id: String(external_account_id),
            account_name,
            broker_name,
            account_currency,
            connection_status: "active",
            sync_token_hash: syncTokenHash,
            token_created_at: new Date().toISOString(),
            last_error: null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,platform,external_account_id",
          }
        )
        .select()
        .single();

    if (accountError) {
      console.error("PRIME Sync account error:", accountError);

      return NextResponse.json(
        { error: "Impossible de créer la connexion MT5." },
        { status: 500 }
      );
    }

    // 5. Retourner la clé UNE SEULE FOIS à l'utilisateur
    return NextResponse.json({
      success: true,
      sync_token: syncToken,
      trading_account_id: tradingAccount.id,
      platform: "mt5",
    });
  } catch (error) {
    console.error("PRIME Sync connect error:", error);

    return NextResponse.json(
      { error: "Erreur interne PRIME Sync." },
      { status: 500 }
    );
  }
}

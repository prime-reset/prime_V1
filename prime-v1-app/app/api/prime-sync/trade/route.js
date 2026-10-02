import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function POST(request) {
  try {
    // ---------------------------------------------------------
    // 1. AUTHENTIFICATION DE PRIME SYNC
    // ---------------------------------------------------------

    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token PRIME Sync manquant." },
        { status: 401 }
      );
    }

    const syncToken = authHeader.replace("Bearer ", "").trim();

    if (!syncToken) {
      return NextResponse.json(
        { error: "Token PRIME Sync invalide." },
        { status: 401 }
      );
    }

    const syncTokenHash = hashToken(syncToken);

    // ---------------------------------------------------------
    // 2. RETROUVER LE COMPTE DE TRADING
    // ---------------------------------------------------------

    const { data: tradingAccount, error: accountError } =
      await supabaseAdmin
        .from("trading_accounts")
        .select("id, user_id, platform, external_account_id")
        .eq("sync_token_hash", syncTokenHash)
        .eq("connection_status", "active")
        .maybeSingle();

    if (accountError) {
      console.error("PRIME Sync account lookup error:", accountError);

      return NextResponse.json(
        { error: "Impossible de vérifier le compte PRIME Sync." },
        { status: 500 }
      );
    }

    if (!tradingAccount) {
      return NextResponse.json(
        { error: "Connexion PRIME Sync non reconnue." },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 3. LIRE LES DONNÉES ENVOYÉES PAR MT5
    // ---------------------------------------------------------

    const body = await request.json();

    const {
      external_trade_id,
      external_account_id,
      symbol,
      side,
      volume,
      entry_price,
      exit_price,
      opened_at,
      closed_at,
      gross_pnl = 0,
      commission = 0,
      swap = 0,
      fees = 0,
      stop_loss = null,
      take_profit = null,
    } = body;

    // ---------------------------------------------------------
    // 4. VALIDATIONS MINIMALES
    // ---------------------------------------------------------

    if (!external_trade_id || !symbol || !side) {
      return NextResponse.json(
        {
          error:
            "Données du trade incomplètes : trade_id, symbol ou side manquant.",
        },
        { status: 400 }
      );
    }

    if (!["long", "short"].includes(String(side).toLowerCase())) {
      return NextResponse.json(
        { error: "Le sens du trade doit être long ou short." },
        { status: 400 }
      );
    }

    // Empêche un token lié à un compte d'envoyer les trades d'un autre compte.
    if (
      external_account_id &&
      String(external_account_id) !==
        String(tradingAccount.external_account_id)
    ) {
      return NextResponse.json(
        { error: "Le compte MT5 ne correspond pas à cette connexion." },
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // 5. NORMALISATION DES VALEURS
    // ---------------------------------------------------------

    const grossPnl = toNumberOrNull(gross_pnl) ?? 0;
    const commissionValue = toNumberOrNull(commission) ?? 0;
    const swapValue = toNumberOrNull(swap) ?? 0;
    const feesValue = toNumberOrNull(fees) ?? 0;

    const netPnl =
      grossPnl + commissionValue + swapValue + feesValue;

    let result = "breakeven";

    if (netPnl > 0) result = "win";
    if (netPnl < 0) result = "loss";

    // ---------------------------------------------------------
    // 6. ENREGISTRER LE TRADE
    // ---------------------------------------------------------

    const tradePayload = {
      user_id: tradingAccount.user_id,
      trading_account_id: tradingAccount.id,
      platform: tradingAccount.platform,

      external_trade_id: String(external_trade_id),

      symbol: String(symbol),
      side: String(side).toLowerCase(),

      volume: toNumberOrNull(volume),

      entry_price: toNumberOrNull(entry_price),
      exit_price: toNumberOrNull(exit_price),

      opened_at: opened_at || null,
      closed_at: closed_at || null,

      gross_pnl: grossPnl,
      commission: commissionValue,
      swap: swapValue,
      fees: feesValue,
      net_pnl: netPnl,

      stop_loss: toNumberOrNull(stop_loss),
      take_profit: toNumberOrNull(take_profit),

      result,

      updated_at: new Date().toISOString(),
    };

    const { data: trade, error: tradeError } =
      await supabaseAdmin
        .from("trades")
        .upsert(tradePayload, {
          onConflict: "trading_account_id,external_trade_id",
        })
        .select()
        .single();

    if (tradeError) {
      console.error("PRIME Sync trade insert error:", tradeError);

      return NextResponse.json(
        { error: "Impossible d'enregistrer le trade." },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 7. METTRE À JOUR LA DERNIÈRE SYNCHRONISATION
    // ---------------------------------------------------------

    await supabaseAdmin
      .from("trading_accounts")
      .update({
        last_sync_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tradingAccount.id);

    // ---------------------------------------------------------
    // 8. CONFIRMATION À L'EA
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      trade_id: trade.id,
      external_trade_id: trade.external_trade_id,
      result: trade.result,
      net_pnl: trade.net_pnl,
    });
  } catch (error) {
    console.error("PRIME Sync trade error:", error);

    return NextResponse.json(
      { error: "Erreur interne PRIME Sync." },
      { status: 500 }
    );
  }
}

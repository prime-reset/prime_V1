"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Flame,
  Gauge,
  Minus,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

import BottomNav from "../components/BottomNav";
import { supabase } from "../../lib/supabase";

export default function JournalV2Page() {
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  async function loadTrades() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("closed_at", { ascending: false });

    if (error) {
      console.error("Journal V2 trades error:", error);
      setLoading(false);
      return;
    }

    setTrades(data || []);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const netPnl = trades.reduce(
      (sum, trade) => sum + Number(trade.net_pnl || 0),
      0
    );

    const wins = trades.filter(
      (trade) => Number(trade.net_pnl || 0) > 0
    );

    const losses = trades.filter(
      (trade) => Number(trade.net_pnl || 0) < 0
    );

    const winRate = trades.length
      ? Math.round((wins.length / trades.length) * 100)
      : 0;

    const grossProfit = wins.reduce(
      (sum, trade) => sum + Number(trade.net_pnl || 0),
      0
    );

    const grossLoss = Math.abs(
      losses.reduce(
        (sum, trade) => sum + Number(trade.net_pnl || 0),
        0
      )
    );

    const profitFactor =
      grossLoss > 0
        ? (grossProfit / grossLoss).toFixed(2)
        : grossProfit > 0
        ? "∞"
        : "—";

    const scoredTrades = trades.filter(
      (trade) =>
        trade.discipline_score !== null &&
        trade.discipline_score !== undefined
    );

    const discipline =
      scoredTrades.length > 0
        ? Math.round(
            scoredTrades.reduce(
              (sum, trade) =>
                sum + Number(trade.discipline_score || 0),
              0
            ) / scoredTrades.length
          )
        : null;

    return {
      netPnl,
      count: trades.length,
      winRate,
      profitFactor,
      discipline,
    };
  }, [trades]);

  const latestTradeDate =
    trades.length > 0
      ? trades[0].closed_at || trades[0].opened_at
      : null;

  return (
    <main className="journal-v2-page">
      <JournalStyles />

      <div className="page">
        <section className="hero">
          <div className="hero-top">
            <p className="brand">JOURNAL PRIME · V2</p>

            <span className="sync-badge">
              <span className="sync-dot" />
              PRIME Sync
            </span>
          </div>

          <h1 className="title">
            Chaque trade.
            <span>Chaque décision.</span>
          </h1>

          <p className="subtitle">
            La performance se mesure. La discipline se construit.
          </p>
        </section>

        <section className="discipline-card">
          <div>
            <p className="label">DISCIPLINE PRIME</p>

            <div className="discipline-value">
              {stats.discipline !== null
                ? `${stats.discipline}%`
                : "—"}
            </div>

            <p className="discipline-caption">
              {stats.discipline !== null
                ? "Qualité moyenne d'exécution"
                : "En attente d'évaluation comportementale"}
            </p>
          </div>

          <div className="discipline-ring">
            <Flame size={29} />
          </div>
        </section>

        <section className="metrics-grid">
          <MetricCard
            label="PnL net"
            value={`${stats.netPnl > 0 ? "+" : ""}${formatMoney(
              stats.netPnl
            )}€`}
            caption="Trades synchronisés"
            icon={
              stats.netPnl > 0 ? (
                <ArrowUpRight size={20} />
              ) : stats.netPnl < 0 ? (
                <ArrowDownRight size={20} />
              ) : (
                <Minus size={20} />
              )
            }
            tone={
              stats.netPnl > 0
                ? "positive"
                : stats.netPnl < 0
                ? "negative"
                : "neutral"
            }
          />

          <MetricCard
            label="Trades"
            value={stats.count}
            caption="Exécutions enregistrées"
            icon={<BarChart3 size={20} />}
          />

          <MetricCard
            label="Win Rate"
            value={`${stats.winRate}%`}
            caption="Trades gagnants"
            icon={<Target size={20} />}
          />

          <MetricCard
            label="Profit Factor"
            value={stats.profitFactor}
            caption="Gains / pertes"
            icon={<TrendingUp size={20} />}
          />
        </section>

        <PrimeReading
          trades={trades}
          loading={loading}
        />

        <div className="section-title">
          <div>
            <p className="label">
              {latestTradeDate
                ? formatFullDate(latestTradeDate)
                : "HISTORIQUE"}
            </p>

            <h2>Trades synchronisés</h2>
          </div>

          <span>
            {stats.count} trade{stats.count > 1 ? "s" : ""}
          </span>
        </div>

        {loading && (
          <section className="state-card">
            <div className="loader" />
            <h3>Chargement du journal...</h3>
            <p>PRIME récupère tes trades.</p>
          </section>
        )}

        {!loading && trades.length === 0 && (
          <section className="state-card empty-state">
            <div className="empty-icon">
              <BarChart3 size={27} />
            </div>

            <p className="label">PRIME SYNC</p>

            <h3>Aucun trade synchronisé.</h3>

            <p>
              Dès qu&apos;un trade sera importé dans PRIME, il
              apparaîtra automatiquement ici avec ses données
              techniques et son analyse comportementale.
            </p>
          </section>
        )}

        {!loading && trades.length > 0 && (
          <div className="trade-list">
            {trades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onOpen={() => setSelectedTrade(trade)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTrade && (
        <TradeModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}

      {!selectedTrade && <BottomNav active="Journal" />}
    </main>
  );
}

function MetricCard({
  label,
  value,
  caption,
  icon,
  tone = "default",
}) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <p>{label}</p>
        <span>{icon}</span>
      </div>

      <div>
        <strong>{value}</strong>
        <small>{caption}</small>
      </div>
    </div>
  );
}

function PrimeReading({ trades, loading }) {
  if (loading) {
    return (
      <section className="prime-reading">
        <div className="reading-icon">
          <Gauge size={23} />
        </div>

        <div>
          <p className="label">LECTURE PRIME</p>
          <h2>Analyse en cours.</h2>
          <p>
            PRIME prépare la lecture de ton historique.
          </p>
        </div>
      </section>
    );
  }

  if (trades.length === 0) {
    return (
      <section className="prime-reading">
        <div className="reading-icon">
          <Gauge size={23} />
        </div>

        <div>
          <p className="label">LECTURE PRIME</p>
          <h2>Ton historique commence ici.</h2>
          <p>
            Tes prochains trades permettront à PRIME de croiser
            performance financière et qualité d&apos;exécution.
          </p>
        </div>
      </section>
    );
  }

  const evaluatedTrades = trades.filter(
    (trade) =>
      trade.plan_respected !== null &&
      trade.plan_respected !== undefined
  );

  if (evaluatedTrades.length === 0) {
    return (
      <section className="prime-reading">
        <div className="reading-icon">
          <Gauge size={23} />
        </div>

        <div>
          <p className="label">LECTURE PRIME</p>
          <h2>Performance enregistrée.</h2>
          <p>
            Tes trades sont bien synchronisés. Leur lecture
            comportementale sera enrichie avec tes données PRIME.
          </p>
        </div>
      </section>
    );
  }

  const offPlan = evaluatedTrades.filter(
    (trade) => trade.plan_respected === false
  );

  if (offPlan.length > 0) {
    return (
      <section className="prime-reading">
        <div className="reading-icon">
          <Gauge size={23} />
        </div>

        <div>
          <p className="label">LECTURE PRIME</p>
          <h2>Une dérive mérite ton attention.</h2>
          <p>
            PRIME détecte {offPlan.length} trade
            {offPlan.length > 1 ? "s" : ""} hors plan dans ton
            historique évalué. Le résultat financier ne suffit pas
            à valider une décision.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="prime-reading">
      <div className="reading-icon">
        <Gauge size={23} />
      </div>

      <div>
        <p className="label">LECTURE PRIME</p>
        <h2>Ton exécution reste dans le cadre.</h2>
        <p>
          Les trades évalués respectent ton plan. PRIME continuera
          à surveiller la stabilité de cette discipline.
        </p>
      </div>
    </section>
  );
}

function TradeCard({ trade, onOpen }) {
  const duration = getDuration(
    trade.opened_at,
    trade.closed_at
  );

  const pnl = Number(trade.net_pnl || 0);

  return (
    <button
      className={`trade-card ${
        trade.plan_respected === false
          ? "trade-warning"
          : ""
      }`}
      onClick={onOpen}
    >
      <div
        className={`trade-accent ${
          pnl > 0
            ? "positive"
            : pnl < 0
            ? "negative"
            : "neutral"
        }`}
      />

      <div className="trade-content">
        <div className="trade-top">
          <div>
            <div className="trade-name">
              <h3>{trade.symbol || "—"}</h3>

              <span
                className={`side side-${trade.side}`}
              >
                {trade.side === "long"
                  ? "LONG"
                  : trade.side === "short"
                  ? "SHORT"
                  : "—"}
              </span>
            </div>

            <p>
              {formatTime(trade.opened_at)} →{" "}
              {formatTime(trade.closed_at)} · {duration}
            </p>
          </div>

          <strong
            className={
              pnl > 0
                ? "pnl-positive"
                : pnl < 0
                ? "pnl-negative"
                : ""
            }
          >
            {pnl > 0 ? "+" : ""}
            {formatMoney(pnl)}€
          </strong>
        </div>

        <div className="prices">
          <div>
            <span>Entrée</span>
            <strong>
              {formatPrice(trade.entry_price)}
            </strong>
          </div>

          <div className="price-arrow">→</div>

          <div>
            <span>Sortie</span>
            <strong>
              {formatPrice(trade.exit_price)}
            </strong>
          </div>
        </div>

        <div className="trade-bottom">
          <div className="trade-status">
            {trade.plan_respected === true && (
              <span className="status-good">
                Plan respecté
              </span>
            )}

            {trade.plan_respected === false && (
              <span className="status-warning">
                Hors plan
              </span>
            )}

            {trade.plan_respected === null ||
            trade.plan_respected === undefined ? (
              <span className="status-neutral">
                À évaluer
              </span>
            ) : null}

            {trade.behavioral_error && (
              <span className="error-tag">
                {trade.behavioral_error}
              </span>
            )}
          </div>

          <div className="trade-score">
            <span>PRIME</span>

            <strong>
              {trade.discipline_score !== null &&
              trade.discipline_score !== undefined
                ? `${trade.discipline_score}%`
                : "—"}
            </strong>

            <ChevronRight size={17} />
          </div>
        </div>
      </div>
    </button>
  );
}

function TradeModal({ trade, onClose }) {
  const pnl = Number(trade.net_pnl || 0);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-handle" />

        <div className="modal-head">
          <div>
            <p className="label">DOSSIER TRADE</p>

            <div className="modal-symbol">
              <h2>{trade.symbol || "—"}</h2>

              <span
                className={`side side-${trade.side}`}
              >
                {trade.side
                  ? trade.side.toUpperCase()
                  : "—"}
              </span>
            </div>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <section className="modal-main-metrics">
          <div>
            <span>PnL net</span>

            <strong
              className={
                pnl > 0
                  ? "pnl-positive"
                  : pnl < 0
                  ? "pnl-negative"
                  : ""
              }
            >
              {pnl > 0 ? "+" : ""}
              {formatMoney(pnl)}€
            </strong>
          </div>

          <div>
            <span>Discipline</span>

            <strong>
              {trade.discipline_score !== null &&
              trade.discipline_score !== undefined
                ? `${trade.discipline_score}%`
                : "—"}
            </strong>
          </div>
        </section>

        <p className="modal-section-title">
          DONNÉES TECHNIQUES
        </p>

        <div className="data-grid">
          <DataBox
            label="Entrée"
            value={formatPrice(trade.entry_price)}
          />

          <DataBox
            label="Sortie"
            value={formatPrice(trade.exit_price)}
          />

          <DataBox
            label="Volume"
            value={trade.volume ?? "—"}
          />

          <DataBox
            label="Durée"
            value={getDuration(
              trade.opened_at,
              trade.closed_at
            )}
          />

          <DataBox
            label="Stop Loss"
            value={formatPrice(trade.stop_loss)}
          />

          <DataBox
            label="Take Profit"
            value={formatPrice(trade.take_profit)}
          />

          <DataBox
            label="Commission"
            value={`${formatMoney(
              Number(trade.commission || 0)
            )}€`}
          />

          <DataBox
            label="PnL brut"
            value={`${
              Number(trade.gross_pnl || 0) > 0
                ? "+"
                : ""
            }${formatMoney(
              Number(trade.gross_pnl || 0)
            )}€`}
          />
        </div>

        <p className="modal-section-title">
          COMPORTEMENT PRIME
        </p>

        <div className="data-grid">
          <DataBox
            label="Setup"
            value={trade.setup || "À renseigner"}
          />

          <DataBox
            label="Plan"
            value={
              trade.plan_respected === true
                ? "Respecté"
                : trade.plan_respected === false
                ? "Non respecté"
                : "À renseigner"
            }
          />

          <DataBox
            label="Émotion"
            value={trade.emotion || "À renseigner"}
          />

          <DataBox
            label="Erreur"
            value={
              trade.behavioral_error ||
              "Aucune renseignée"
            }
          />
        </div>

        <section className="prime-analysis">
          <p className="label">ANALYSE PRIME</p>

          <h3>{getTradeInsightTitle(trade)}</h3>

          <p>{getTradeInsight(trade)}</p>
        </section>

        <section className="trade-note">
          <p className="label">NOTE DU TRADER</p>

          <p>
            {trade.comment ||
              "Aucune note ajoutée pour ce trade."}
          </p>
        </section>
      </div>
    </div>
  );
}

function DataBox({ label, value }) {
  return (
    <div className="data-box">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
    </div>
  );
}

function JournalStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #050505;
      }

      button {
        font: inherit;
      }

      .journal-v2-page {
        min-height: 100vh;
        padding: 30px 18px 128px;
        color: white;
        font-family: Inter, Arial, sans-serif;
        background: #050505;
      }

      .page {
        max-width: 460px;
        margin: 0 auto;
      }

      .hero {
        margin-bottom: 22px;
      }

      .hero-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
      }

      .brand,
      .label {
        color: #D4B06A;
        text-transform: uppercase;
        font-weight: 900;
      }

      .brand {
        margin: 0;
        font-size: 11px;
        letter-spacing: 4px;
      }

      .label {
        margin: 0 0 9px;
        font-size: 10px;
        letter-spacing: 2px;
      }

      .sync-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 10px;
        border-radius: 999px;
        color: rgba(255,255,255,.68);
        background: rgba(255,255,255,.035);
        border: 1px solid rgba(255,255,255,.07);
        font-size: 9px;
        font-weight: 850;
      }

      .sync-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #6BE28B;
        box-shadow: 0 0 10px rgba(107,226,139,.6);
      }

      .title {
        margin: 0;
        font-size: 46px;
        line-height: 1;
        font-weight: 950;
        letter-spacing: -2.6px;
      }

      .title span {
        display: block;
        color: rgba(255,255,255,.88);
      }

      .subtitle {
        margin: 14px 0 0;
        color: rgba(255,255,255,.58);
        font-size: 16px;
        line-height: 1.5;
      }

      .discipline-card,
      .metric-card,
      .prime-reading,
      .trade-card,
      .state-card {
        background: #101010;
        border: 1px solid rgba(255,255,255,.07);
        box-shadow: 0 18px 45px rgba(0,0,0,.38);
      }

      .discipline-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 22px;
        margin-bottom: 12px;
        border-radius: 26px;
        border-color: rgba(212,176,106,.2);
        background:
          radial-gradient(
            circle at top right,
            rgba(212,176,106,.13),
            transparent 48%
          ),
          #101010;
      }

      .discipline-value {
        font-size: 43px;
        line-height: 1;
        font-weight: 950;
      }

      .discipline-caption {
        margin: 8px 0 0;
        color: rgba(255,255,255,.5);
        font-size: 11px;
      }

      .discipline-ring {
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #D4B06A;
        border: 2px solid rgba(212,176,106,.45);
        background: rgba(212,176,106,.06);
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 12px;
      }

      .metric-card {
        min-height: 125px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-radius: 22px;
      }

      .metric-top {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        color: #D4B06A;
      }

      .metric-top p {
        margin: 0;
        font-size: 9px;
        letter-spacing: 1.4px;
        text-transform: uppercase;
        font-weight: 900;
      }

      .metric-card strong,
      .metric-card small {
        display: block;
      }

      .metric-card strong {
        font-size: 27px;
        line-height: 1;
        font-weight: 950;
      }

      .metric-card small {
        margin-top: 7px;
        color: rgba(255,255,255,.46);
        font-size: 11px;
      }

      .metric-positive strong,
      .metric-positive .metric-top {
        color: #6BE28B;
      }

      .metric-negative strong,
      .metric-negative .metric-top {
        color: #F05B5B;
      }

      .prime-reading {
        display: grid;
        grid-template-columns: 47px 1fr;
        gap: 14px;
        padding: 20px;
        margin-bottom: 30px;
        border-radius: 24px;
      }

      .reading-icon {
        width: 47px;
        height: 47px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        color: #D4B06A;
        background: rgba(212,176,106,.07);
        border: 1px solid rgba(212,176,106,.18);
      }

      .prime-reading h2 {
        margin: 0;
        font-size: 19px;
      }

      .prime-reading p:last-child {
        margin: 8px 0 0;
        color: rgba(255,255,255,.57);
        font-size: 12px;
        line-height: 1.5;
      }

      .section-title {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 12px;
        margin-bottom: 12px;
      }

      .section-title h2 {
        margin: 0;
        font-size: 25px;
        font-weight: 950;
      }

      .section-title > span {
        padding-bottom: 3px;
        color: rgba(255,255,255,.4);
        font-size: 10px;
        font-weight: 850;
      }

      .trade-list {
        display: grid;
        gap: 10px;
      }

      .trade-card {
        position: relative;
        width: 100%;
        display: grid;
        grid-template-columns: 5px 1fr;
        padding: 0;
        overflow: hidden;
        border-radius: 24px;
        color: white;
        text-align: left;
        cursor: pointer;
      }

      .trade-accent.positive {
        background: #6BE28B;
      }

      .trade-accent.negative {
        background: #F05B5B;
      }

      .trade-accent.neutral {
        background: #D4B06A;
      }

      .trade-warning {
        border-color: rgba(212,176,106,.2);
      }

      .trade-content {
        padding: 17px;
      }

      .trade-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }

      .trade-name {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .trade-name h3 {
        margin: 0;
        font-size: 18px;
      }

      .side {
        padding: 5px 7px;
        border-radius: 7px;
        font-size: 8px;
        letter-spacing: 1px;
        font-weight: 950;
      }

      .side-long {
        color: #6BE28B;
        background: rgba(107,226,139,.09);
      }

      .side-short {
        color: #F05B5B;
        background: rgba(240,91,91,.09);
      }

      .trade-top p {
        margin: 7px 0 0;
        color: rgba(255,255,255,.4);
        font-size: 10px;
      }

      .trade-top > strong {
        font-size: 20px;
        font-weight: 950;
      }

      .pnl-positive {
        color: #6BE28B !important;
      }

      .pnl-negative {
        color: #F05B5B !important;
      }

      .prices {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        padding: 13px;
        border-radius: 16px;
        background: rgba(255,255,255,.03);
        border: 1px solid rgba(255,255,255,.055);
      }

      .prices span,
      .prices strong {
        display: block;
      }

      .prices span {
        color: rgba(255,255,255,.37);
        font-size: 8px;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-weight: 850;
      }

      .prices strong {
        margin-top: 5px;
        font-size: 13px;
      }

      .price-arrow {
        color: rgba(255,255,255,.25);
      }

      .trade-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-top: 13px;
      }

      .trade-status {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .trade-status span {
        padding: 6px 8px;
        border-radius: 999px;
        font-size: 8px;
        font-weight: 900;
      }

      .status-good {
        color: #6BE28B;
        background: rgba(107,226,139,.08);
      }

      .status-warning,
      .error-tag {
        color: #D4B06A;
        background: rgba(212,176,106,.08);
      }

      .status-neutral {
        color: rgba(255,255,255,.55);
        background: rgba(255,255,255,.05);
      }

      .trade-score {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #D4B06A;
      }

      .trade-score span {
        font-size: 8px;
        letter-spacing: 1px;
        font-weight: 900;
      }

      .trade-score strong {
        font-size: 13px;
      }

      .state-card {
        padding: 30px 22px;
        border-radius: 26px;
        text-align: center;
      }

      .state-card h3 {
        margin: 10px 0 0;
        font-size: 21px;
      }

      .state-card > p:last-child {
        margin: 10px auto 0;
        max-width: 340px;
        color: rgba(255,255,255,.55);
        font-size: 13px;
        line-height: 1.55;
      }

      .empty-icon {
        width: 56px;
        height: 56px;
        display: grid;
        place-items: center;
        margin: 0 auto 18px;
        border-radius: 18px;
        color: #D4B06A;
        background: rgba(212,176,106,.07);
        border: 1px solid rgba(212,176,106,.18);
      }

      .loader {
        width: 34px;
        height: 34px;
        margin: 0 auto 18px;
        border-radius: 50%;
        border: 3px solid rgba(255,255,255,.08);
        border-top-color: #D4B06A;
        animation: spin .8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 16px;
        background: rgba(0,0,0,.76);
        backdrop-filter: blur(8px);
      }

      .modal-sheet {
        width: 100%;
        max-width: 460px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 18px 18px 34px;
        border-radius: 28px 28px 18px 18px;
        color: white;
        background: #0d0d0d;
        border: 1px solid rgba(255,255,255,.09);
      }

      .modal-handle {
        width: 46px;
        height: 4px;
        margin: 0 auto 18px;
        border-radius: 999px;
        background: rgba(255,255,255,.18);
      }

      .modal-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }

      .modal-symbol {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .modal-symbol h2 {
        margin: 0;
        font-size: 27px;
      }

      .modal-close {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        color: white;
        border-radius: 13px;
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.04);
      }

      .modal-main-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 18px;
      }

      .modal-main-metrics div,
      .data-box,
      .prime-analysis,
      .trade-note {
        padding: 14px;
        border-radius: 18px;
        background: rgba(255,255,255,.035);
        border: 1px solid rgba(255,255,255,.07);
      }

      .modal-main-metrics span,
      .modal-main-metrics strong {
        display: block;
      }

      .modal-main-metrics span {
        color: rgba(255,255,255,.42);
        font-size: 9px;
        letter-spacing: 1.3px;
        text-transform: uppercase;
        font-weight: 900;
      }

      .modal-main-metrics strong {
        margin-top: 8px;
        color: #D4B06A;
        font-size: 24px;
      }

      .modal-section-title {
        margin: 22px 0 10px;
        color: rgba(255,255,255,.35);
        font-size: 9px;
        letter-spacing: 2px;
        font-weight: 950;
      }

      .data-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9px;
      }

      .data-box span,
      .data-box strong {
        display: block;
      }

      .data-box span {
        color: rgba(255,255,255,.4);
        font-size: 8px;
        letter-spacing: 1.1px;
        text-transform: uppercase;
        font-weight: 900;
      }

      .data-box strong {
        margin-top: 7px;
        font-size: 13px;
      }

      .prime-analysis,
      .trade-note {
        margin-top: 14px;
      }

      .prime-analysis {
        border-color: rgba(212,176,106,.16);
      }

      .prime-analysis h3 {
        margin: 0;
        color: #D4B06A;
        font-size: 20px;
      }

      .prime-analysis p:last-child,
      .trade-note p:last-child {
        margin: 9px 0 0;
        color: rgba(255,255,255,.6);
        font-size: 12px;
        line-height: 1.55;
      }

      @media(max-width: 390px) {
        .journal-v2-page {
          padding-left: 14px;
          padding-right: 14px;
        }

        .title {
          font-size: 40px;
        }

        .metrics-grid {
          gap: 8px;
        }
      }
    `}</style>
  );
}

function formatTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(value) {
  if (!value) return "HISTORIQUE";

  return new Date(value)
    .toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

function formatPrice(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) return value;

  if (number < 10) {
    return number.toFixed(5).replace(".", ",");
  }

  if (Number.isInteger(number)) {
    return number.toLocaleString("fr-FR");
  }

  return number.toLocaleString("fr-FR", {
    maximumFractionDigits: 5,
  });
}

function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });
}

function getDuration(openedAt, closedAt) {
  if (!openedAt || !closedAt) return "—";

  const start = new Date(openedAt);
  const end = new Date(closedAt);

  const minutes = Math.max(
    0,
    Math.round(
      (end.getTime() - start.getTime()) / 60000
    )
  );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining
    ? `${hours}h ${remaining}min`
    : `${hours}h`;
}

function getTradeInsightTitle(trade) {
  const pnl = Number(trade.net_pnl || 0);

  if (
    trade.plan_respected === null ||
    trade.plan_respected === undefined
  ) {
    return "À compléter.";
  }

  if (trade.plan_respected === true && pnl < 0) {
    return "Bonne perte.";
  }

  if (trade.plan_respected === false && pnl > 0) {
    return "Gain trompeur.";
  }

  if (trade.plan_respected === false && pnl < 0) {
    return "Dérive coûteuse.";
  }

  if (pnl > 0) {
    return "Exécution maîtrisée.";
  }

  return "Trace enregistrée.";
}

function getTradeInsight(trade) {
  const pnl = Number(trade.net_pnl || 0);

  if (
    trade.plan_respected === null ||
    trade.plan_respected === undefined
  ) {
    return "Les données techniques de ce trade sont enregistrées. Complète sa lecture comportementale pour permettre à PRIME d'évaluer la qualité de l'exécution.";
  }

  if (trade.plan_respected === true && pnl < 0) {
    return "Le trade est perdant financièrement, mais ton scénario et ton cadre ont été respectés. PRIME considère cette exécution comme saine.";
  }

  if (trade.plan_respected === false && pnl > 0) {
    return "Le résultat est positif, mais l'exécution était hors plan. Ce gain ne doit pas renforcer une mauvaise décision.";
  }

  if (trade.plan_respected === false && pnl < 0) {
    return "La perte financière accompagne ici une dégradation du processus. C'est ce comportement que PRIME cherchera à empêcher de se répéter.";
  }

  return "Résultat et processus sont alignés. Cette exécution renforce une discipline rentable et reproductible.";
}

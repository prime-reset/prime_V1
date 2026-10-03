"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock3,
  Flame,
  Gauge,
  Minus,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

import BottomNav from "../components/BottomNav";

const DEMO_TRADES = [
  {
    id: "demo-1",
    symbol: "NAS100",
    side: "short",
    volume: 1,
    entry_price: 18245,
    exit_price: 18180,
    opened_at: "2026-10-03T14:42:00",
    closed_at: "2026-10-03T15:07:00",
    gross_pnl: 134,
    commission: -4,
    swap: 0,
    fees: 0,
    net_pnl: 130,
    result: "win",
    stop_loss: 18275,
    take_profit: 18180,
    setup: "Sweep + rejet",
    plan_respected: true,
    emotion: "Calme",
    behavioral_error: null,
    comment:
      "Entrée après confirmation. Pas de précipitation malgré le premier mouvement.",
    discipline_score: 94,
  },
  {
    id: "demo-2",
    symbol: "XAUUSD",
    side: "long",
    volume: 0.1,
    entry_price: 2661.4,
    exit_price: 2658.8,
    opened_at: "2026-10-03T15:31:00",
    closed_at: "2026-10-03T15:43:00",
    gross_pnl: -31,
    commission: -2,
    swap: 0,
    fees: 0,
    net_pnl: -33,
    result: "loss",
    stop_loss: 2658.8,
    take_profit: 2668,
    setup: "Pullback",
    plan_respected: true,
    emotion: "Neutre",
    behavioral_error: null,
    comment:
      "Stop respecté. Le scénario était valide malgré le résultat négatif.",
    discipline_score: 91,
  },
  {
    id: "demo-3",
    symbol: "EURUSD",
    side: "long",
    volume: 0.5,
    entry_price: 1.1732,
    exit_price: 1.174,
    opened_at: "2026-10-03T16:02:00",
    closed_at: "2026-10-03T16:11:00",
    gross_pnl: 38,
    commission: -3,
    swap: 0,
    fees: 0,
    net_pnl: 35,
    result: "win",
    stop_loss: 1.1727,
    take_profit: 1.174,
    setup: "Breakout",
    plan_respected: false,
    emotion: "Impatience",
    behavioral_error: "FOMO",
    comment:
      "Trade gagnant mais entrée anticipée. Le résultat ne valide pas l'exécution.",
    discipline_score: 61,
  },
];

export default function JournalV2Page() {
  const [selectedTrade, setSelectedTrade] = useState(null);

  const stats = useMemo(() => {
    const netPnl = DEMO_TRADES.reduce(
      (sum, trade) => sum + Number(trade.net_pnl || 0),
      0
    );

    const wins = DEMO_TRADES.filter((trade) => trade.net_pnl > 0);
    const losses = DEMO_TRADES.filter((trade) => trade.net_pnl < 0);

    const winRate = DEMO_TRADES.length
      ? Math.round((wins.length / DEMO_TRADES.length) * 100)
      : 0;

    const grossProfit = wins.reduce(
      (sum, trade) => sum + trade.net_pnl,
      0
    );

    const grossLoss = Math.abs(
      losses.reduce((sum, trade) => sum + trade.net_pnl, 0)
    );

    const profitFactor =
      grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : "—";

    const discipline =
      DEMO_TRADES.length > 0
        ? Math.round(
            DEMO_TRADES.reduce(
              (sum, trade) => sum + Number(trade.discipline_score || 0),
              0
            ) / DEMO_TRADES.length
          )
        : 0;

    return {
      netPnl,
      count: DEMO_TRADES.length,
      winRate,
      profitFactor,
      discipline,
    };
  }, []);

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
            <div className="discipline-value">{stats.discipline}%</div>
            <p className="discipline-caption">
              Qualité moyenne d&apos;exécution aujourd&apos;hui
            </p>
          </div>

          <div className="discipline-ring">
            <Flame size={29} />
          </div>
        </section>

        <section className="metrics-grid">
          <MetricCard
            label="PnL net"
            value={`${stats.netPnl > 0 ? "+" : ""}${stats.netPnl}€`}
            caption="Aujourd'hui"
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
            caption="Exécutions clôturées"
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

        <section className="prime-reading">
          <div className="reading-icon">
            <Gauge size={23} />
          </div>

          <div>
            <p className="label">LECTURE PRIME</p>
            <h2>Rentable, mais pas irréprochable.</h2>
            <p>
              Ton PnL est positif, mais un trade hors plan dégrade la qualité
              globale de ta journée. PRIME distingue le résultat de
              l&apos;exécution.
            </p>
          </div>
        </section>

        <div className="section-title">
          <div>
            <p className="label">3 OCTOBRE 2026</p>
            <h2>Trades de la journée</h2>
          </div>

          <span>3 trades</span>
        </div>

        <div className="trade-list">
          {DEMO_TRADES.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onOpen={() => setSelectedTrade(trade)}
            />
          ))}
        </div>

        <p className="demo-note">
          Maquette de développement · données fictives
        </p>
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

function TradeCard({ trade, onOpen }) {
  const duration = getDuration(trade.opened_at, trade.closed_at);
  const pnl = Number(trade.net_pnl || 0);

  return (
    <button
      className={`trade-card ${
        trade.plan_respected === false ? "trade-warning" : ""
      }`}
      onClick={onOpen}
    >
      <div
        className={`trade-accent ${
          pnl > 0 ? "positive" : pnl < 0 ? "negative" : "neutral"
        }`}
      />

      <div className="trade-content">
        <div className="trade-top">
          <div>
            <div className="trade-name">
              <h3>{trade.symbol}</h3>

              <span className={`side side-${trade.side}`}>
                {trade.side === "long" ? "LONG" : "SHORT"}
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
            {pnl}€
          </strong>
        </div>

        <div className="prices">
          <div>
            <span>Entrée</span>
            <strong>{formatPrice(trade.entry_price)}</strong>
          </div>

          <div className="price-arrow">→</div>

          <div>
            <span>Sortie</span>
            <strong>{formatPrice(trade.exit_price)}</strong>
          </div>
        </div>

        <div className="trade-bottom">
          <div className="trade-status">
            <span
              className={
                trade.plan_respected
                  ? "status-good"
                  : "status-warning"
              }
            >
              {trade.plan_respected
                ? "Plan respecté"
                : "Hors plan"}
            </span>

            {trade.behavioral_error && (
              <span className="error-tag">
                {trade.behavioral_error}
              </span>
            )}
          </div>

          <div className="trade-score">
            <span>PRIME</span>
            <strong>{trade.discipline_score}%</strong>
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-handle" />

        <div className="modal-head">
          <div>
            <p className="label">DOSSIER TRADE</p>
            <div className="modal-symbol">
              <h2>{trade.symbol}</h2>
              <span className={`side side-${trade.side}`}>
                {trade.side.toUpperCase()}
              </span>
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
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
              {pnl}€
            </strong>
          </div>

          <div>
            <span>Discipline</span>
            <strong>{trade.discipline_score}%</strong>
          </div>
        </section>

        <p className="modal-section-title">DONNÉES TECHNIQUES</p>

        <div className="data-grid">
          <DataBox
            label="Entrée"
            value={formatPrice(trade.entry_price)}
          />
          <DataBox
            label="Sortie"
            value={formatPrice(trade.exit_price)}
          />
          <DataBox label="Volume" value={trade.volume} />
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
            value={`${trade.commission}€`}
          />
          <DataBox
            label="PnL brut"
            value={`${trade.gross_pnl > 0 ? "+" : ""}${
              trade.gross_pnl
            }€`}
          />
        </div>

        <p className="modal-section-title">COMPORTEMENT PRIME</p>

        <div className="data-grid">
          <DataBox label="Setup" value={trade.setup || "—"} />
          <DataBox
            label="Plan"
            value={
              trade.plan_respected
                ? "Respecté"
                : "Non respecté"
            }
          />
          <DataBox
            label="Émotion"
            value={trade.emotion || "—"}
          />
          <DataBox
            label="Erreur"
            value={trade.behavioral_error || "Aucune"}
          />
        </div>

        <section className="prime-analysis">
          <p className="label">ANALYSE PRIME</p>

          <h3>
            {trade.plan_respected
              ? pnl < 0
                ? "Bonne perte."
                : "Exécution maîtrisée."
              : pnl > 0
              ? "Gain trompeur."
              : "Dérive coûteuse."}
          </h3>

          <p>{getTradeInsight(trade)}</p>
        </section>

        <section className="trade-note">
          <p className="label">NOTE DU TRADER</p>
          <p>{trade.comment || "Aucune note ajoutée."}</p>
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
      .trade-card {
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
        box-shadow: 0 0 30px rgba(212,176,106,.08);
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

      .prices div:not(.price-arrow) {
        min-width: 0;
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

      .demo-note {
        margin: 16px 0 0;
        color: rgba(255,255,255,.25);
        text-align: center;
        font-size: 9px;
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

function formatPrice(value) {
  if (value === null || value === undefined) return "—";

  const number = Number(value);

  if (Number.isNaN(number)) return value;

  if (number < 10) {
    return number.toFixed(5).replace(".", ",");
  }

  if (Number.isInteger(number)) {
    return number.toLocaleString("fr-FR");
  }

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
    Math.round((end.getTime() - start.getTime()) / 60000)
  );

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining
    ? `${hours}h ${remaining}min`
    : `${hours}h`;
}

function getTradeInsight(trade) {
  const pnl = Number(trade.net_pnl || 0);

  if (trade.plan_respected && pnl < 0) {
    return "Le trade est perdant financièrement, mais ton scénario et ton cadre ont été respectés. PRIME considère cette exécution comme saine.";
  }

  if (!trade.plan_respected && pnl > 0) {
    return "Le résultat est positif, mais l'exécution était hors plan. Ce gain ne doit pas renforcer une mauvaise décision.";
  }

  if (!trade.plan_respected && pnl < 0) {
    return "La perte financière accompagne ici une dégradation du processus. C'est ce comportement que PRIME cherchera à empêcher de se répéter.";
  }

  return "Résultat et processus sont alignés. Cette exécution renforce une discipline rentable et reproductible.";
}

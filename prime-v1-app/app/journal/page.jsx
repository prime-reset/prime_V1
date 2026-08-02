"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Flame,
  TrendingUp,
  CheckCircle,
  CalendarDays,
  ChevronRight,
  Sparkles,
  Search,
  X,
  Trophy,
  Layers3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "perfect", label: "100 %" },
  { key: "gains", label: "Gains" },
  { key: "stops", label: "Stops" },
  { key: "errors", label: "Erreurs" },
  { key: "plan", label: "Plan respecté" },
];

export default function JournalPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadJournal();
  }, []);

  const loadJournal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "closed")
      .order("created_at", { ascending: false });

    if (!error && data) setSessions(data);
    setLoading(false);
  };

  const weekDays = getCurrentWeekData(sessions);
  const weekPnl = weekDays.reduce((sum, day) => sum + day.pnl, 0);
  const weekSessions = weekDays.reduce(
    (sum, day) => sum + day.sessionsCount,
    0
  );
  const weekPlanRate = getWeekPlanRate(weekDays);

  const scores = sessions
    .map((session) => Number(session.discipline_score))
    .filter((score) => !Number.isNaN(score));

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const summary = getJournalSummary(sessions);
  const chapter = getPrimeChapter(sessions.length);
  const records = getBehaviorRecords(sessions);
  const turningPoints = getTurningPoints(sessions);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sessions.filter((session) => {
      const pnl = Number(session.session_pnl || 0);
      const score = Number(session.discipline_score || 0);

      const filterMatches =
        activeFilter === "all" ||
        (activeFilter === "perfect" && score === 100) ||
        (activeFilter === "gains" && pnl > 0) ||
        (activeFilter === "stops" && pnl < 0) ||
        (activeFilter === "errors" && Boolean(session.dominant_error)) ||
        (activeFilter === "plan" && session.plan_respected === true);

      if (!filterMatches) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        session.dominant_error,
        session.improvement_note,
        session.mental_state,
        session.post_mental_state,
        formatDate(session.created_at),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [sessions, activeFilter, query]);

  const visibleSessions = filteredSessions.slice(0, visibleCount);
  const groupedSessions = groupSessionsByMonth(visibleSessions);

  return (
    <main className="journal-page">
      <BaseStyles />

      <div className="page">
        <section className="hero">
          <p className="brand">JOURNAL PRIME</p>
          <h1 className="title">
            Ton histoire.
            <span>Session après session.</span>
          </h1>
          <p className="subtitle">
            PRIME ne te montre pas seulement ce que tu as fait. Il révèle ce que
            tu es en train de devenir.
          </p>
        </section>

        <section className="chapter-card">
          <div className="chapter-top">
            <div>
              <p className="label">CHAPITRE PRIME</p>
              <h2>{chapter.name}</h2>
              <p>{chapter.description}</p>
            </div>
            <div className="chapter-index">{chapter.number}</div>
          </div>

          <div className="chapter-progress">
            <div
              className="chapter-progress-bar"
              style={{ width: `${chapter.progress}%` }}
            />
          </div>

          <div className="chapter-meta">
            <span>{sessions.length} sessions</span>
            <span>{chapter.nextLabel}</span>
          </div>
        </section>

        <section className="summary-card">
          <div className="summary-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="label">LECTURE PRIME</p>
            <h2>{summary.title}</h2>
            <p>{summary.text}</p>
          </div>
        </section>

        <section className="metrics-grid">
          <MetricCard
            label="Discipline moyenne"
            value={`${averageScore}%`}
            caption={getScoreTrendLabel(sessions)}
            icon={<Flame size={21} />}
          />
          <MetricCard
            label="Total sessions"
            value={sessions.length}
            caption="Traces comportementales"
            icon={<BookOpen size={21} />}
          />
          <MetricCard
            label="Plan semaine"
            value={`${weekPlanRate}%`}
            caption={`${weekSessions} session(s) cette semaine`}
            icon={<CheckCircle size={21} />}
          />
          <MetricCard
            label="PnL semaine"
            value={`${weekPnl > 0 ? "+" : ""}${weekPnl}€`}
            caption={
              weekPnl > 0
                ? "Semaine positive"
                : weekPnl < 0
                ? "Semaine négative"
                : "Semaine neutre"
            }
            icon={
              weekPnl > 0 ? (
                <ArrowUpRight size={21} />
              ) : weekPnl < 0 ? (
                <ArrowDownRight size={21} />
              ) : (
                <Minus size={21} />
              )
            }
            tone={
              weekPnl > 0 ? "positive" : weekPnl < 0 ? "negative" : "neutral"
            }
          />
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <p className="label">SEMAINE EN COURS</p>
              <h2 className="card-title">Ta semaine d’exécution</h2>
            </div>
            <CalendarDays size={27} className="icon" />
          </div>

          <div className="week-dots">
            {weekDays.map((day) => (
              <div
                key={day.label}
                className="week-dot"
                style={getWeekDayStyle(day)}
              >
                <span className="week-label">{day.label}</span>
                <strong
                  className="week-pnl"
                  style={{
                    color:
                      day.pnl > 0
                        ? "#6BE28B"
                        : day.pnl < 0
                        ? "#F05B5B"
                        : "rgba(255,255,255,0.68)",
                  }}
                >
                  {day.pnl > 0 ? "+" : ""}
                  {day.pnl}€
                </strong>
              </div>
            ))}
          </div>
        </section>

        {turningPoints.length > 0 && (
          <section className="card">
            <div className="section-head">
              <div>
                <p className="label">TOURNANTS</p>
                <h2 className="card-title">
                  Les moments qui changent ton histoire
                </h2>
              </div>
              <TrendingUp size={27} className="icon" />
            </div>

            <div className="turning-list">
              {turningPoints.map((point) => (
                <div className="turning-item" key={point.id}>
                  <span className="turning-dot" />
                  <div>
                    <strong>{point.title}</strong>
                    <p>{point.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="card">
          <div className="section-head">
            <div>
              <p className="label">RECORDS COMPORTEMENTAUX</p>
              <h2 className="card-title">Ce que tu construis</h2>
            </div>
            <Trophy size={27} className="icon" />
          </div>

          <div className="record-grid">
            {records.map((record) => (
              <div className="record-card" key={record.label}>
                <span>{record.label}</span>
                <strong>{record.value}</strong>
                <small>{record.caption}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="journal-toolbar">
          <div className="search-wrap">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(10);
              }}
              placeholder="Rechercher une erreur, un mental, une note..."
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Effacer">
                <X size={17} />
              </button>
            )}
          </div>

          <div className="filters-wrap">
            <Filter size={17} />
            <div className="filters-scroll">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  className={
                    activeFilter === filter.key
                      ? "filter-pill active"
                      : "filter-pill"
                  }
                  onClick={() => {
                    setActiveFilter(filter.key);
                    setVisibleCount(10);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="timeline-heading">
          <Layers3 size={18} />
          <span>Timeline comportementale</span>
        </div>

        {loading && (
          <section className="card">
            <p className="empty">Chargement du journal...</p>
          </section>
        )}

        {!loading && sessions.length === 0 && (
          <section className="card">
            <p className="empty">
              Aucune session pour le moment. Enregistre ta première session pour
              ouvrir le premier chapitre de ton Journal PRIME.
            </p>
          </section>
        )}

        {!loading && sessions.length > 0 && filteredSessions.length === 0 && (
          <section className="card">
            <p className="empty">
              Aucune session ne correspond à ce filtre ou à cette recherche.
            </p>
          </section>
        )}

        {Object.entries(groupedSessions).map(([month, monthSessions]) => (
          <section className="month-section" key={month}>
            <div className="month-head">
              <div>
                <p>{month}</p>
                <span>{monthSessions.length} session(s) affichée(s)</span>
              </div>
            </div>

            <div className="session-list">
              {monthSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  index={sessions.findIndex((item) => item.id === session.id)}
                  onOpen={() => setSelectedSession(session)}
                />
              ))}
            </div>
          </section>
        ))}

        {visibleCount < filteredSessions.length && (
          <button
            className="load-more"
            onClick={() => setVisibleCount((count) => count + 10)}
          >
            Afficher 10 sessions de plus
            <ChevronRight size={19} />
          </button>
        )}
      </div>

      {selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {!selectedSession && <BottomNav active="Journal" />}
    </main>
  );
}

function MetricCard({ label, value, caption, icon, tone = "default" }) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <p className="metric-title">{label}</p>
        <span className="metric-icon">{icon}</span>
      </div>
      <div>
        <p className="metric-value">{value}</p>
        <p className="metric-caption">{caption}</p>
      </div>
    </div>
  );
}

function SessionCard({ session, index, onOpen }) {
  const pnl = Number(session.session_pnl || 0);
  const score = Number(session.discipline_score || 0);
  const tone = getSessionTone(session);
  const resultLabel = pnl > 0 ? "Gain" : pnl < 0 ? "Stop" : "Break Even";

  return (
    <button className={`session-card session-${tone}`} onClick={onOpen}>
      <div className="session-accent" />

      <div className="session-content">
        <div className="session-top">
          <div>
            <p className="session-date">{formatDate(session.created_at)}</p>
            <h3>Session #{index + 1}</h3>
          </div>
          <div className="session-score">{score}%</div>
        </div>

        <div className="session-quick">
          <div>
            <span>Résultat</span>
            <strong>
              {resultLabel}
              {pnl !== 0 ? ` · ${pnl > 0 ? "+" : ""}${pnl}€` : ""}
            </strong>
          </div>
          <div>
            <span>Plan</span>
            <strong>
              {session.plan_respected === true
                ? "Respecté"
                : session.plan_respected === false
                ? "Non respecté"
                : "Non renseigné"}
            </strong>
          </div>
          <div>
            <span>Erreur</span>
            <strong>{session.dominant_error || "Aucune"}</strong>
          </div>
        </div>

        <div className="session-insight">
          <p>{getSessionMeaning(session)}</p>
          <ChevronRight size={18} />
        </div>
      </div>
    </button>
  );
}

function SessionModal({ session, onClose }) {
  const pnl = Number(session.session_pnl || 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-head">
          <div>
            <p className="label">DOSSIER SESSION</p>
            <h2>{formatDate(session.created_at)}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <section className="modal-score">
          <div>
            <span>Score d’exécution</span>
            <strong>{session.discipline_score ?? 0}%</strong>
          </div>
          <div>
            <span>Résultat</span>
            <strong>
              {pnl > 0 ? "+" : ""}
              {pnl}€
            </strong>
          </div>
        </section>

        <div className="modal-grid">
          <DataBox
            label="Mental avant"
            value={session.mental_state || "Non renseigné"}
          />
          <DataBox
            label="Mental après"
            value={session.post_mental_state || "Non renseigné"}
          />
          <DataBox
            label="Plan"
            value={
              session.plan_respected === true
                ? "Respecté"
                : session.plan_respected === false
                ? "Non respecté"
                : "Non renseigné"
            }
          />
          <DataBox
            label="Erreur"
            value={session.dominant_error || "Aucune"}
          />
        </div>

        <section className="modal-analysis">
          <p className="label">ANALYSE PRIME</p>
          <h3>{getJournalInsightTitle(session)}</h3>
          <p>{getJournalInsight(session)}</p>
        </section>

        <section className="modal-note">
          <p className="label">TRACE PERSONNELLE</p>
          <p>{session.improvement_note || "Aucune note ajoutée."}</p>
        </section>
      </div>
    </div>
  );
}

function DataBox({ label, value }) {
  return (
    <div className="data-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}


function BaseStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: #050505;
      }

      button,
      input {
        font: inherit;
      }

      .journal-page {
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

      .brand,
      .label {
        color: #D4B06A;
        text-transform: uppercase;
        font-weight: 900;
      }

      .brand {
        letter-spacing: 7px;
        font-size: 13px;
        margin: 0 0 18px;
      }

      .label {
        font-size: 11px;
        letter-spacing: 2px;
        margin: 0 0 12px;
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
        color: rgba(255,255,255,0.88);
      }

      .subtitle {
        margin-top: 14px;
        font-size: 17px;
        line-height: 1.55;
        color: rgba(255,255,255,0.62);
      }

      .card,
      .chapter-card,
      .summary-card,
      .metric-card,
      .session-card,
      .journal-toolbar {
        border-radius: 26px;
        background: #101010;
        border: 1px solid rgba(255,255,255,0.07);
        box-shadow: 0 18px 45px rgba(0,0,0,0.38);
      }

      .chapter-card,
      .summary-card,
      .card {
        padding: 22px;
        margin-bottom: 14px;
      }

      .chapter-card {
        border-color: rgba(212,176,106,0.18);
        background:
          radial-gradient(circle at top right, rgba(212,176,106,0.12), transparent 44%),
          #101010;
      }

      .chapter-top,
      .section-head,
      .metric-top,
      .session-top,
      .modal-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }

      .chapter-top h2,
      .card-title {
        margin: 0;
        color: #D4B06A;
        font-weight: 950;
      }

      .chapter-top h2 {
        font-size: 27px;
      }

      .chapter-top p:last-child,
      .summary-card p:last-child,
      .turning-item p,
      .metric-caption,
      .empty {
        color: rgba(255,255,255,0.62);
      }

      .chapter-top p:last-child,
      .summary-card p:last-child {
        margin: 9px 0 0;
        font-size: 14px;
        line-height: 1.5;
      }

      .chapter-index {
        width: 58px;
        height: 58px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        color: #050505;
        background: #D4B06A;
        font-size: 21px;
        font-weight: 950;
        flex: 0 0 auto;
      }

      .chapter-progress {
        margin-top: 20px;
        height: 8px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255,255,255,0.08);
      }

      .chapter-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #99712f, #D4B06A, #fff0b0);
      }

      .chapter-meta {
        display: flex;
        justify-content: space-between;
        margin-top: 9px;
        color: rgba(255,255,255,0.46);
        font-size: 11px;
        font-weight: 850;
      }

      .summary-card {
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: 14px;
      }

      .summary-icon {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        color: #D4B06A;
        border-radius: 16px;
        border: 1px solid rgba(212,176,106,0.18);
        background: rgba(212,176,106,0.07);
      }

      .summary-card h2 {
        margin: 0;
        font-size: 21px;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 14px;
      }

      .metric-card {
        min-height: 132px;
        padding: 17px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .metric-title {
        margin: 0;
        color: #D4B06A;
        font-size: 10px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        font-weight: 900;
      }

      .metric-icon {
        color: #D4B06A;
      }

      .metric-value {
        margin: 12px 0 0;
        font-size: 27px;
        line-height: 1;
        font-weight: 950;
      }

      .metric-caption {
        margin: 8px 0 0;
        font-size: 12px;
        line-height: 1.4;
      }

      .metric-positive .metric-value,
      .metric-positive .metric-icon {
        color: #6BE28B;
      }

      .metric-negative .metric-value,
      .metric-negative .metric-icon {
        color: #F05B5B;
      }

      .card-title {
        font-size: 24px;
        line-height: 1.17;
      }

      .icon {
        color: #D4B06A;
      }

      .week-dots {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 7px;
        margin-top: 18px;
      }

      .week-dot {
        min-height: 62px;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .week-label {
        font-size: 10px;
        color: rgba(255,255,255,0.62);
        font-weight: 900;
      }

      .week-pnl {
        font-size: 11px;
        font-weight: 950;
      }

      .turning-list {
        display: grid;
        gap: 14px;
        margin-top: 18px;
      }

      .turning-item {
        display: grid;
        grid-template-columns: 14px 1fr;
        gap: 12px;
      }

      .turning-dot {
        width: 10px;
        height: 10px;
        margin-top: 5px;
        border-radius: 50%;
        background: #D4B06A;
        box-shadow: 0 0 16px rgba(212,176,106,0.55);
      }

      .turning-item p {
        margin: 5px 0 0;
        font-size: 13px;
        line-height: 1.45;
      }

      .record-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 18px;
      }

      .record-card {
        padding: 15px;
        border-radius: 18px;
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.07);
      }

      .record-card span,
      .record-card strong,
      .record-card small {
        display: block;
      }

      .record-card span {
        color: rgba(212,176,106,0.76);
        font-size: 9px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        font-weight: 900;
      }

      .record-card strong {
        margin-top: 10px;
        font-size: 23px;
      }

      .record-card small {
        margin-top: 5px;
        color: rgba(255,255,255,0.50);
        font-size: 11px;
      }

      .journal-toolbar {
        padding: 14px;
        margin-bottom: 18px;
      }

      .search-wrap {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
        padding: 12px 13px;
        border-radius: 16px;
        color: rgba(255,255,255,0.42);
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.07);
      }

      .search-wrap input {
        min-width: 0;
        border: none;
        outline: none;
        color: white;
        background: transparent;
        font-size: 13px;
      }

      .search-wrap button {
        border: none;
        color: rgba(255,255,255,0.55);
        background: transparent;
      }

      .filters-wrap {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: center;
        margin-top: 12px;
        color: rgba(255,255,255,0.42);
      }

      .filters-scroll {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .filters-scroll::-webkit-scrollbar {
        display: none;
      }

      .filter-pill {
        flex: 0 0 auto;
        padding: 9px 12px;
        border-radius: 999px;
        color: rgba(255,255,255,0.68);
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.035);
        font-size: 11px;
        font-weight: 850;
      }

      .filter-pill.active {
        color: #050505;
        border-color: #D4B06A;
        background: #D4B06A;
      }

      .timeline-heading {
        display: flex;
        align-items: center;
        gap: 9px;
        margin: 26px 0 14px;
        color: rgba(255,255,255,0.46);
        font-size: 11px;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        font-weight: 950;
      }

      .month-section {
        margin-bottom: 22px;
      }

      .month-head {
        margin-bottom: 10px;
      }

      .month-head p {
        margin: 0;
        font-size: 18px;
        font-weight: 950;
        text-transform: capitalize;
      }

      .month-head span {
        display: block;
        margin-top: 4px;
        color: rgba(255,255,255,0.38);
        font-size: 10px;
      }

      .session-list {
        display: grid;
        gap: 10px;
      }

      .session-card {
        position: relative;
        width: 100%;
        display: grid;
        grid-template-columns: 5px 1fr;
        overflow: hidden;
        padding: 0;
        text-align: left;
        color: white;
        cursor: pointer;
      }

      .session-accent {
        background: #D4B06A;
      }

      .session-positive .session-accent {
        background: #6BE28B;
      }

      .session-danger .session-accent {
        background: #F05B5B;
      }

      .session-content {
        padding: 17px;
      }

      .session-date {
        margin: 0;
        color: rgba(255,255,255,0.43);
        font-size: 9px;
        letter-spacing: 1.7px;
        text-transform: uppercase;
        font-weight: 900;
      }

      .session-top h3 {
        margin: 6px 0 0;
        font-size: 17px;
      }

      .session-score {
        color: #D4B06A;
        font-size: 22px;
        font-weight: 950;
      }

      .session-quick {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 15px;
      }

      .session-quick div {
        min-width: 0;
        padding: 11px;
        border-radius: 15px;
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.06);
      }

      .session-quick span,
      .session-quick strong {
        display: block;
      }

      .session-quick span {
        color: rgba(255,255,255,0.40);
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 850;
      }

      .session-quick strong {
        margin-top: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;
        font-size: 11px;
        white-space: nowrap;
      }

      .session-insight {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 13px;
        padding-top: 12px;
        color: rgba(255,255,255,0.60);
        border-top: 1px solid rgba(255,255,255,0.06);
      }

      .session-insight p {
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
      }

      .load-more {
        width: 100%;
        min-height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #D4B06A;
        border-radius: 18px;
        border: 1px solid rgba(212,176,106,0.18);
        background: rgba(212,176,106,0.05);
        font-weight: 900;
      }

      .empty {
        margin: 0;
        font-size: 15px;
        line-height: 1.55;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 16px;
        background: rgba(0,0,0,0.74);
        backdrop-filter: blur(8px);
      }

      .modal-sheet {
        position: relative;
        z-index: 100000;
        width: 100%;
        max-width: 460px;
        max-height: 88vh;
        overflow-y: auto;
        padding: 18px;
        padding-bottom: 34px;
        border-radius: 28px 28px 18px 18px;
        color: white;
        background: #0d0d0d;
        border: 1px solid rgba(255,255,255,0.09);
      }

      .modal-handle {
        width: 46px;
        height: 4px;
        margin: 0 auto 18px;
        border-radius: 999px;
        background: rgba(255,255,255,0.18);
      }

      .modal-head h2 {
        margin: 0;
        font-size: 25px;
      }

      .modal-close {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        color: white;
        border-radius: 13px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
      }

      .modal-score,
      .modal-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 18px;
      }

      .modal-score div,
      .data-box,
      .modal-analysis,
      .modal-note {
        padding: 14px;
        border-radius: 18px;
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.07);
      }

      .modal-score span,
      .modal-score strong,
      .data-box span,
      .data-box strong {
        display: block;
      }

      .modal-score span,
      .data-box span {
        color: rgba(255,255,255,0.42);
        font-size: 9px;
        letter-spacing: 1.3px;
        text-transform: uppercase;
        font-weight: 900;
      }

      .modal-score strong {
        margin-top: 8px;
        color: #D4B06A;
        font-size: 24px;
      }

      .data-box strong {
        margin-top: 8px;
        font-size: 13px;
      }

      .modal-analysis,
      .modal-note {
        margin-top: 14px;
      }

      .modal-note {
        margin-bottom: 8px;
      }

      .modal-analysis h3 {
        margin: 0;
        color: #D4B06A;
        font-size: 20px;
      }

      .modal-analysis p:last-child,
      .modal-note p:last-child {
        margin: 10px 0 0;
        color: rgba(255,255,255,0.64);
        font-size: 13px;
        line-height: 1.55;
      }

      @media(max-width:390px) {
        .journal-page {
          padding-left: 14px;
          padding-right: 14px;
        }

        .title {
          font-size: 40px;
        }

        .metrics-grid {
          gap: 10px;
        }

        .week-dots {
          gap: 5px;
        }

        .session-quick {
          grid-template-columns: 1fr 1fr;
        }
      }
    `}</style>
  );
}

function getCurrentWeekData(sessions) {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const daySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.created_at);
      return sessionDate.toDateString() === date.toDateString();
    });

    const pnl = daySessions.reduce(
      (sum, session) => sum + Number(session.session_pnl || 0),
      0
    );

    const hasSession = daySessions.length > 0;
    const respectedCount = daySessions.filter(
      (session) => session.plan_respected === true
    ).length;
    const notRespectedCount = daySessions.filter(
      (session) => session.plan_respected === false
    ).length;

    return {
      label,
      date,
      pnl,
      hasSession,
      planRespected:
        hasSession && notRespectedCount === 0 && respectedCount > 0,
      planNotRespected: hasSession && notRespectedCount > 0,
      sessionsCount: daySessions.length,
    };
  });
}

function getWeekDayStyle(day) {
  if (!day.hasSession) {
    return {
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.07)",
    };
  }

  if (day.planRespected) {
    return {
      background: "rgba(107,226,139,0.12)",
      border: "1px solid rgba(107,226,139,0.30)",
    };
  }

  if (day.planNotRespected && day.pnl < 0) {
    return {
      background: "rgba(240,91,91,0.13)",
      border: "1px solid rgba(240,91,91,0.32)",
    };
  }

  return {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
  };
}

function getWeekPlanRate(days) {
  const tradedDays = days.filter((day) => day.hasSession);
  if (tradedDays.length === 0) return 0;

  const respectedDays = tradedDays.filter((day) => day.planRespected).length;
  return Math.round((respectedDays / tradedDays.length) * 100);
}

function getPrimeChapter(count) {
  if (count < 20) {
    return {
      number: "01",
      name: "Découverte",
      description:
        "Tu construis les premières traces fiables de ton comportement réel.",
      progress: Math.round((count / 20) * 100),
      nextLabel: `${Math.max(20 - count, 0)} avant Stabilisation`,
    };
  }

  if (count < 50) {
    return {
      number: "02",
      name: "Stabilisation",
      description:
        "Tes habitudes deviennent lisibles. PRIME distingue désormais les accidents des vrais patterns.",
      progress: Math.round(((count - 20) / 30) * 100),
      nextLabel: `${Math.max(50 - count, 0)} avant Construction`,
    };
  }

  if (count < 100) {
    return {
      number: "03",
      name: "Construction",
      description:
        "Ton identité se renforce et tes automatismes deviennent mesurables.",
      progress: Math.round(((count - 50) / 50) * 100),
      nextLabel: `${Math.max(100 - count, 0)} avant Maîtrise`,
    };
  }

  return {
    number: "04",
    name: "Maîtrise",
    description:
      "Ton journal raconte désormais une transformation durable.",
    progress: 100,
    nextLabel: "Chapitre actuel",
  };
}

function getJournalSummary(sessions) {
  if (sessions.length === 0) {
    return {
      title: "Ton histoire commence ici.",
      text:
        "Ta première session ouvrira le premier chapitre de ton évolution comportementale.",
    };
  }

  const recent = sessions.slice(0, 10);
  const previous = sessions.slice(10, 20);
  const recentAvg = average(
    recent.map((s) => Number(s.discipline_score || 0))
  );
  const previousAvg = previous.length
    ? average(previous.map((s) => Number(s.discipline_score || 0)))
    : recentAvg;
  const trend = recentAvg - previousAvg;
  const planRate = Math.round(
    (recent.filter((s) => s.plan_respected === true).length /
      Math.max(recent.length, 1)) *
      100
  );
  const dominantError = getDominantValue(
    recent.map((s) => s.dominant_error).filter(Boolean)
  );

  if (trend >= 8) {
    return {
      title: "Ta dynamique est clairement positive.",
      text: `Ta discipline progresse de ${trend} points. Ton plan a été respecté ${planRate}% du temps${
        dominantError ? `, mais ${dominantError} reste à surveiller.` : "."
      }`,
    };
  }

  if (trend <= -8) {
    return {
      title: "Une dérive récente mérite ton attention.",
      text: `Ta discipline recule de ${Math.abs(
        trend
      )} points. Le plan a été respecté ${planRate}% du temps${
        dominantError ? ` et ${dominantError} apparaît comme signal dominant.` : "."
      }`,
    };
  }

  return {
    title: "Ta structure reste globalement stable.",
    text: `Sur les 10 dernières sessions, ton plan a été respecté ${planRate}% du temps${
      dominantError
        ? ` et l’erreur la plus fréquente reste ${dominantError}.`
        : ", sans erreur dominante répétée."
    }`,
  };
}

function getBehaviorRecords(sessions) {
  const bestScore = sessions.length
    ? Math.max(...sessions.map((s) => Number(s.discipline_score || 0)))
    : 0;

  let bestPlanStreak = 0;
  let currentPlanStreak = 0;
  let bestNoErrorStreak = 0;
  let currentNoErrorStreak = 0;

  [...sessions].reverse().forEach((session) => {
    if (session.plan_respected === true) {
      currentPlanStreak += 1;
      bestPlanStreak = Math.max(bestPlanStreak, currentPlanStreak);
    } else {
      currentPlanStreak = 0;
    }

    if (!session.dominant_error) {
      currentNoErrorStreak += 1;
      bestNoErrorStreak = Math.max(bestNoErrorStreak, currentNoErrorStreak);
    } else {
      currentNoErrorStreak = 0;
    }
  });

  return [
    { label: "Meilleur score", value: `${bestScore}%`, caption: "Plus haute discipline" },
    { label: "Série plan", value: bestPlanStreak, caption: "Sessions consécutives" },
    { label: "Sans erreur", value: bestNoErrorStreak, caption: "Meilleure série" },
    {
      label: "Sessions parfaites",
      value: sessions.filter(
        (session) => Number(session.discipline_score || 0) === 100
      ).length,
      caption: "Scores à 100 %",
    },
  ];
}

function getTurningPoints(sessions) {
  const chronological = [...sessions].reverse();
  const points = [];

  const firstPerfect = chronological.find(
    (session) => Number(session.discipline_score || 0) === 100
  );

  if (firstPerfect) {
    points.push({
      id: "first-perfect",
      title: "Première session à 100 %",
      text: `${formatDate(firstPerfect.created_at)} : ton processus a été exécuté sans dégradation mesurée.`,
    });
  }

  const recentFive = sessions.slice(0, 5);
  const recentPlanRate =
    recentFive.length === 5
      ? Math.round(
          (recentFive.filter((s) => s.plan_respected === true).length / 5) *
            100
        )
      : 0;

  if (recentPlanRate === 100) {
    points.push({
      id: "plan-streak",
      title: "Cinq sessions consécutives dans le cadre",
      text: "Ton plan est devenu une constante sur tes cinq dernières sessions.",
    });
  }

  return points.slice(0, 3);
}

function getScoreTrendLabel(sessions) {
  if (sessions.length < 4) return "Baseline en construction";

  const recent = average(
    sessions.slice(0, 5).map((s) => Number(s.discipline_score || 0))
  );
  const previousSlice = sessions.slice(5, 10);

  if (!previousSlice.length) return "Première tendance";

  const previous = average(
    previousSlice.map((s) => Number(s.discipline_score || 0))
  );
  const delta = recent - previous;

  if (delta > 5) return `+${delta} pts récemment`;
  if (delta < -5) return `${delta} pts récemment`;
  return "Tendance stable";
}

function groupSessionsByMonth(sessions) {
  return sessions.reduce((groups, session) => {
    const month = new Date(session.created_at).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    if (!groups[month]) groups[month] = [];
    groups[month].push(session);
    return groups;
  }, {});
}

function getSessionTone(session) {
  const score = Number(session.discipline_score || 0);

  if (
    session.plan_respected === false ||
    session.dominant_error ||
    score < 65
  ) {
    return "danger";
  }

  if (session.plan_respected === true && score >= 85) {
    return "positive";
  }

  return "neutral";
}

function getSessionMeaning(session) {
  const pnl = Number(session.session_pnl || 0);

  if (session.plan_respected === true && pnl < 0) {
    return "Bonne perte : ton processus a été respecté malgré le résultat.";
  }

  if (session.plan_respected === false && pnl > 0) {
    return "Gain trompeur : le résultat positif ne valide pas la décision.";
  }

  if (session.dominant_error) {
    return `Signal détecté : ${session.dominant_error}.`;
  }

  if (Number(session.discipline_score || 0) >= 90) {
    return "Cette session confirme ta progression.";
  }

  return "Cette session enrichit ton identité PRIME.";
}

function getJournalInsightTitle(session) {
  const pnl = Number(session.session_pnl || 0);

  if (session.plan_respected === true && pnl < 0) return "Bonne perte.";
  if (session.plan_respected === false && pnl > 0) return "Gain à surveiller.";
  if (session.plan_respected === false && pnl < 0) return "Dérive coûteuse.";
  if (pnl > 0) return "Session positive.";
  return "Trace enregistrée.";
}

function getJournalInsight(session) {
  const pnl = Number(session.session_pnl || 0);

  if (session.plan_respected === true && pnl < 0) {
    return "Tu as perdu de l’argent, mais tu as respecté ton plan. PRIME considère cette session comme une bonne décision d’exécution.";
  }

  if (session.plan_respected === false && pnl > 0) {
    return "Le PnL est positif, mais la décision était hors plan. Ce type de gain peut renforcer un mauvais comportement.";
  }

  if (session.dominant_error) {
    return `Cette session confirme un signal de ${session.dominant_error}. PRIME surveillera sa répétition dans les prochaines sessions.`;
  }

  if ((session.discipline_score || 0) >= 85) {
    return "Très bonne trace comportementale. Le processus semble avoir été respecté avec stabilité.";
  }

  return "Trace enregistrée. PRIME construit ton historique psycho-financier.";
}

function getDominantValue(values) {
  if (!values || values.length === 0) return null;

  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatDate(value) {
  if (!value) return "Date inconnue";

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

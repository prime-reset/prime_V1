"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  Flame,
  Gauge,
  Lock,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  User,
  Zap,
} from "lucide-react";

const traderProfiles = [
  {
    id: "SMC",
    name: "Structure & Liquidité",
    tagline: "Tu trades les zones, les sweeps, les BOS et les réactions propres.",
  },
  {
    id: "SCALP",
    name: "Scalper discipliné",
    tagline: "Tu cherches des exécutions rapides, mais ton risque principal est l'impulsivité.",
  },
  {
    id: "TREND",
    name: "Continuation & Momentum",
    tagline: "Tu veux capter les expansions, mais tu dois éviter d'entrer trop tard.",
  },
];

const baseChecklist = [
  { block: "Contexte", item: "J'ai identifié la structure HTF et la direction dominante.", weight: 18 },
  { block: "Liquidité", item: "Je sais quelle liquidité le marché vient chercher ou vient de balayer.", weight: 16 },
  { block: "Setup", item: "Mon entrée correspond à un setup précis, pas à une intuition.", weight: 20 },
  { block: "Risque", item: "Mon stop, mon invalidation et mon risque sont définis avant l'entrée.", weight: 22 },
  { block: "Mental", item: "Je suis calme, disponible et je n'essaie pas de me refaire.", weight: 24 },
];

const errorFamilies = [
  { id: "revenge", label: "Revenge trading", family: "Mental", gravity: 5 },
  { id: "overtrade", label: "Overtrading", family: "Discipline", gravity: 4 },
  { id: "late", label: "Entrée tardive", family: "Exécution", gravity: 3 },
  { id: "stop", label: "Stop déplacé", family: "Risque", gravity: 5 },
  { id: "plan", label: "Plan ignoré", family: "Process", gravity: 4 },
];

const mockJournal = [
  { day: "Lundi", score: 82, note: "Bonne patience. Une seule entrée, plan respecté." },
  { day: "Mardi", score: 64, note: "Entrée trop rapide après le sweep. Setup incomplet." },
  { day: "Mercredi", score: 91, note: "Très bonne exécution. Aucune erreur critique." },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function PremiumCard({ children, className = "" }) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur", className)}>
      {children}
    </div>
  );
}

function Pill({ children, active = false }) {
  return (
    <span className={cn("rounded-full border px-3 py-1 text-xs", active ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/65")}>
      {children}
    </span>
  );
}

function ProgressRing({ value }) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="7" fill="none" className="text-white/10" />
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="currentColor"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-white"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">score</span>
      </div>
    </div>
  );
}

function NavButton({ label, icon: Icon, active, onClick }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] transition", active ? "bg-white text-black" : "text-white/55 hover:bg-white/5 hover:text-white")}>
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );
}

export default function PrimeAppV1() {
  const [screen, setScreen] = useState("home");
  const [profile, setProfile] = useState(traderProfiles[0]);
  const [checked, setChecked] = useState({});
  const [selectedErrors, setSelectedErrors] = useState([]);
  const [disciplineOn, setDisciplineOn] = useState(false);

  const checklistScore = useMemo(() => {
    return baseChecklist.reduce((sum, row, index) => sum + (checked[index] ? row.weight : 0), 0);
  }, [checked]);

  const errorPenalty = useMemo(() => {
    return selectedErrors.reduce((sum, id) => {
      const err = errorFamilies.find((e) => e.id === id);
      return sum + (err ? err.gravity * 6 : 0);
    }, 0);
  }, [selectedErrors]);

  const disciplineScore = Math.max(0, Math.min(100, checklistScore + (disciplineOn ? 10 : 0) - errorPenalty));

  const dominantError = useMemo(() => {
    if (!selectedErrors.length) return null;
    return selectedErrors
      .map((id) => errorFamilies.find((e) => e.id === id))
      .filter(Boolean)
      .sort((a, b) => b.gravity - a.gravity)[0];
  }, [selectedErrors]);

  const prescription = dominantError
    ? {
        title: dominantError.id === "revenge" ? "Prescription anti-revenge" : dominantError.id === "overtrade" ? "Prescription anti-overtrading" : "Prescription d'exécution",
        rule:
          dominantError.id === "revenge"
            ? "Pendant 7 jours : après une perte, pause obligatoire de 20 minutes. Aucun second trade sans revalidation complète du plan."
            : dominantError.id === "overtrade"
            ? "Pendant 7 jours : maximum 2 trades par session. Le troisième trade est bloqué sauf setup A+."
            : "Pendant 7 jours : aucune entrée sans invalidation écrite et checklist validée à 80 minimum.",
      }
    : {
        title: "Prescription active",
        rule: "Maintiens ta discipline constante : checklist validée avant session, risque défini, aucun trade émotionnel.",
      };

  const nav = [
    ["home", "Prime", Sparkles],
    ["session", "Session", Play],
    ["coach", "Coach", Brain],
    ["journal", "Journal", BarChart3],
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-white/40">PRIME.</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Trading Discipline OS</h1>
          </div>
          <button className="rounded-full border border-white/10 bg-white/5 p-3">
            <User size={18} />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {screen === "home" && (
            <motion.main key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              <PremiumCard className="overflow-hidden p-0">
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Pill active>Founder V1</Pill>
                    <Pill>Mobile-first</Pill>
                  </div>
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight">Les choses sérieuses commencent maintenant.</h2>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    Ton objectif : maintenir une discipline constante. PRIME transforme tes données, tes erreurs et ton comportement en prescriptions concrètes pour devenir un trader régulier.
                  </p>
                  <button onClick={() => setScreen("session")} className="mt-6 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-black">
                    Commencer ma session <ArrowRight size={18} />
                  </button>
                </div>
                <div className="border-t border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/35">Score actuel</p>
                      <p className="mt-1 text-sm text-white/65">Basé sur ton process, pas ton PnL.</p>
                    </div>
                    <ProgressRing value={disciplineScore} />
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Profil trader</h3>
                    <p className="mt-1 text-xs text-white/45">Personnalise la checklist et le coaching.</p>
                  </div>
                  <ShieldCheck className="text-white/70" size={22} />
                </div>
                <div className="space-y-2">
                  {traderProfiles.map((p) => (
                    <button key={p.id} onClick={() => setProfile(p)} className={cn("w-full rounded-2xl border p-4 text-left transition", profile.id === p.id ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white")}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p.name}</span>
                        {profile.id === p.id ? <Check size={18} /> : <ChevronRight size={18} className="opacity-40" />}
                      </div>
                      <p className={cn("mt-1 text-xs leading-5", profile.id === p.id ? "text-black/65" : "text-white/45")}>{p.tagline}</p>
                    </button>
                  ))}
                </div>
              </PremiumCard>
            </motion.main>
          )}

          {screen === "session" && (
            <motion.main key="session" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              <PremiumCard>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/35">Session active</p>
                    <h2 className="mt-2 text-2xl font-semibold">Checklist {profile.id}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">Valide uniquement ce qui est objectivement présent. PRIME ne récompense pas l'envie de trader, il récompense le respect du plan.</p>
                  </div>
                  <button onClick={() => setDisciplineOn(!disciplineOn)} className={cn("rounded-2xl border px-3 py-2 text-xs", disciplineOn ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/55")}>
                    {disciplineOn ? "Activée" : "Activer"}
                  </button>
                </div>
              </PremiumCard>

              <div className="space-y-3">
                {baseChecklist.map((row, index) => (
                  <button key={row.item} onClick={() => setChecked((prev) => ({ ...prev, [index]: !prev[index] }))} className={cn("w-full rounded-3xl border p-4 text-left transition", checked[index] ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.045]")}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-[0.25em] opacity-55">{row.block}</span>
                      <span className="rounded-full border border-current px-2 py-1 text-[10px]">+{row.weight}</span>
                    </div>
                    <p className="text-sm leading-6">{row.item}</p>
                  </button>
                ))}
              </div>

              <PremiumCard>
                <h3 className="mb-3 flex items-center gap-2 font-semibold"><AlertTriangle size={18} /> Erreurs détectées</h3>
                <div className="flex flex-wrap gap-2">
                  {errorFamilies.map((err) => (
                    <button key={err.id} onClick={() => setSelectedErrors((prev) => (prev.includes(err.id) ? prev.filter((x) => x !== err.id) : [...prev, err.id]))} className={cn("rounded-full border px-3 py-2 text-xs transition", selectedErrors.includes(err.id) ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/55")}>
                      {err.label}
                    </button>
                  ))}
                </div>
              </PremiumCard>
            </motion.main>
          )}

          {screen === "coach" && (
            <motion.main key="coach" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              <PremiumCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/35">Coach intelligent</p>
                    <h2 className="mt-2 text-2xl font-semibold">Diagnostic PRIME</h2>
                  </div>
                  <ProgressRing value={disciplineScore} />
                </div>
              </PremiumCard>

              <PremiumCard>
                <div className="mb-3 flex items-center gap-2">
                  <Brain size={20} />
                  <h3 className="font-semibold">Analyse comportementale</h3>
                </div>
                {dominantError ? (
                  <p className="text-sm leading-6 text-white/62">Ton erreur dominante actuelle est <span className="font-semibold text-white">{dominantError.label}</span>. Elle appartient à la famille <span className="font-semibold text-white">{dominantError.family}</span> et impacte fortement ton score de discipline.</p>
                ) : (
                  <p className="text-sm leading-6 text-white/62">Aucune erreur critique sélectionnée. Ton objectif est de conserver une discipline stable sur plusieurs sessions, pas seulement sur une journée.</p>
                )}
              </PremiumCard>

              <PremiumCard className="border-white/20 bg-white text-black">
                <div className="mb-3 flex items-center gap-2">
                  <Lock size={18} />
                  <h3 className="font-semibold">{prescription.title}</h3>
                </div>
                <p className="text-sm leading-6 text-black/70">{prescription.rule}</p>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl bg-black/5 p-3"><Timer className="mx-auto mb-1" size={17} />7 jours</div>
                  <div className="rounded-2xl bg-black/5 p-3"><Target className="mx-auto mb-1" size={17} />Mesurable</div>
                  <div className="rounded-2xl bg-black/5 p-3"><Trophy className="mx-auto mb-1" size={17} />Progressif</div>
                </div>
              </PremiumCard>

              <button onClick={() => { setChecked({}); setSelectedErrors([]); setDisciplineOn(false); }} className="flex w-full items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
                <RefreshCcw size={18} /> Lancer un reset comportemental
              </button>
            </motion.main>
          )}

          {screen === "journal" && (
            <motion.main key="journal" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              <PremiumCard>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Timeline</p>
                <h2 className="mt-2 text-2xl font-semibold">Ton identité de trader évolue.</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">PRIME garde la trace de ce que tu répètes. C'est ta régularité qui construit ton edge.</p>
              </PremiumCard>

              <div className="grid grid-cols-3 gap-3">
                <PremiumCard className="p-4 text-center"><Gauge className="mx-auto mb-2" size={20} /><div className="text-xl font-semibold">{disciplineScore}</div><div className="text-[10px] text-white/40">Score</div></PremiumCard>
                <PremiumCard className="p-4 text-center"><Flame className="mx-auto mb-2" size={20} /><div className="text-xl font-semibold">3</div><div className="text-[10px] text-white/40">Streak</div></PremiumCard>
                <PremiumCard className="p-4 text-center"><Zap className="mx-auto mb-2" size={20} /><div className="text-xl font-semibold">A-</div><div className="text-[10px] text-white/40">Qualité</div></PremiumCard>
              </div>

              <div className="space-y-3">
                {mockJournal.map((entry) => (
                  <PremiumCard key={entry.day}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{entry.day}</h3>
                        <p className="mt-1 text-sm leading-6 text-white/55">{entry.note}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-black">{entry.score}</div>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            </motion.main>
          )}
        </AnimatePresence>

        <nav className="fixed bottom-4 left-1/2 z-20 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 grid-cols-4 gap-1 rounded-3xl border border-white/10 bg-black/80 p-2 shadow-2xl backdrop-blur-xl">
          {nav.map(([id, label, Icon]) => (
            <NavButton key={id} label={label} icon={Icon} active={screen === id} onClick={() => setScreen(id)} />
          ))}
        </nav>
      </div>
    </div>
  );
}

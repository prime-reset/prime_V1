"use client";

import { Flame, ShieldCheck, CalendarCheck, Trophy } from "lucide-react";

export default function StreakCard() {
  const streak = 4;
  const bestStreak = 12;
  const weeklyGoal = 5;
  const completedDays = 4;

  const progress = Math.min((completedDays / weeklyGoal) * 100, 100);

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-black/40 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Streak PRIME
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {streak} jours disciplinés
          </h2>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
          <Flame size={28} />
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/60">
        Tu construis ta régularité. Chaque journée où tu respectes ton plan
        renforce ton identité de trader discipliné.
      </p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-white/50">
          <span>Objectif semaine</span>
          <span>
            {completedDays}/{weeklyGoal} jours
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <CalendarCheck className="mb-2 text-white/70" size={18} />
          <p className="text-xs text-white/40">Série</p>
          <p className="text-lg font-semibold text-white">{streak}j</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <Trophy className="mb-2 text-white/70" size={18} />
          <p className="text-xs text-white/40">Record</p>
          <p className="text-lg font-semibold text-white">{bestStreak}j</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <ShieldCheck className="mb-2 text-white/70" size={18} />
          <p className="text-xs text-white/40">Statut</p>
          <p className="text-lg font-semibold text-white">Actif</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white/[0.04] p-4">
        <p className="text-sm font-medium text-white">
          Mission du jour
        </p>
        <p className="mt-1 text-sm text-white/55">
          Remplis ta session + respecte ton plan pour maintenir ta série.
        </p>
      </div>
    </div>
  );
}

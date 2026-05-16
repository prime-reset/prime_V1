import {
  Flame,
  ShieldCheck,
  Brain,
  BarChart3,
  Target,
  Sparkles,
} from "lucide-react";

import BottomNav from "./components/BottomNav";
import StreakCard from "./components/StreakCard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white pb-28">
      <section className="relative min-h-screen overflow-hidden px-5 pt-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_35%)]" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                PRIME.
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Discipline Mode
              </h1>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Sparkles size={22} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                <Brain size={22} />
              </div>

              <div>
                <p className="text-sm text-white/50">Coach PRIME</p>
                <h2 className="text-lg font-semibold">
                  Les choses sérieuses commencent.
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Ton objectif est simple : maintenir une discipline constante.
              PRIME t’aide à identifier tes erreurs, corriger ton comportement
              et construire le trader que tu deviens.
            </p>
          </div>

          <div className="mt-5">
            <StreakCard />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck size={20} />
              </div>

              <p className="text-xs text-white/40">
                Score discipline
              </p>

              <p className="mt-1 text-2xl font-semibold">
                82%
              </p>

              <p className="mt-2 text-xs text-white/45">
                Très bon contrôle aujourd’hui.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Flame size={20} />
              </div>

              <p className="text-xs text-white/40">
                État mental
              </p>

              <p className="mt-1 text-2xl font-semibold">
                Stable
              </p>

              <p className="mt-2 text-xs text-white/45">
                Tu peux trader avec clarté.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Target size={20} />
              </div>

              <div>
                <p className="text-xs text-white/40">
                  Prescription active
                </p>

                <h3 className="font-semibold">
                  Maximum 2 trades aujourd’hui
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Ta priorité n’est pas de faire plus. Ta priorité est de respecter
              ton plan, limiter l’impulsivité et protéger ton capital mental.
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <BarChart3 size={20} />
              </div>

              <div>
                <p className="text-xs text-white/40">
                  Progression PRIME
                </p>

                <h3 className="font-semibold">
                  Niveau 3 — Trader structuré
                </h3>
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[64%] rounded-full bg-white" />
            </div>

            <div className="mt-2 flex justify-between text-xs text-white/40">
              <span>640 XP</span>
              <span>1000 XP</span>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

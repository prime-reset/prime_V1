"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Comment fonctionne le Discipline Score ?",
    a: "Le Discipline Score mesure la qualité de ton exécution : respect du plan, checklist, gestion émotionnelle et erreurs comportementales. Il ne juge pas uniquement ton PnL.",
  },
  {
    q: "Comment les prescriptions sont-elles générées ?",
    a: "PRIME analyse les patterns récurrents comme le revenge trading, le FOMO ou l’overtrading, puis propose une règle de correction à suivre sur plusieurs jours.",
  },
  {
    q: "Quelle différence entre Founder et Standard ?",
    a: "Founder est limité aux premiers membres, avec un tarif bloqué à vie et une participation directe à l’évolution de PRIME. Standard inclut 7 jours d’essai gratuit.",
  },
  {
    q: "L’essai gratuit est-il disponible pour Founder ?",
    a: "Non. L’essai gratuit de 7 jours concerne uniquement l’offre Standard. L’offre Founder donne accès à un tarif privilégié à vie.",
  },
  {
    q: "Comment contacter le support ?",
    a: "Depuis Settings, clique sur Contacter PRIME ou Signaler un bug. L’adresse support officielle sera support@theprimeapp.com.",
  },
];

export default function HelpPage() {
  const router = useRouter();

  return (
    <main className="legal-page">
      <style>{`
        body { margin: 0; background: #000; }
        .legal-page {
          min-height: 100vh;
          padding: 30px 16px 80px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background: radial-gradient(circle at 80% 0%, rgba(212,176,106,.12), transparent 28%), #000;
        }
        .page { max-width: 720px; margin: 0 auto; }
        .back {
          width: 44px; height: 44px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05); color: white;
          display: grid; place-items: center; margin-bottom: 26px;
        }
        .badge {
          width: fit-content; padding: 8px 12px; border-radius: 999px;
          background: rgba(212,176,106,.09); border: 1px solid rgba(212,176,106,.25);
          color: #D4B06A; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;
        }
        h1 { font-size: 48px; line-height: .95; margin: 18px 0; letter-spacing: -2px; }
        .intro { color: rgba(255,255,255,.65); line-height: 1.6; }
        .card {
          margin-top: 14px; padding: 20px; border-radius: 24px;
          background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.09);
        }
        h2 { margin: 0 0 10px; color: #D4B06A; font-size: 18px; }
        p { color: rgba(255,255,255,.7); line-height: 1.6; margin: 0; }
      `}</style>

      <div className="page">
        <button className="back" onClick={() => router.push("/settings")}><ArrowLeft size={20} /></button>
        <div className="badge">Centre d’aide</div>
        <h1>Questions fréquentes</h1>
        <p className="intro">Les réponses essentielles pour comprendre et utiliser PRIME avant le lancement officiel.</p>

        {faqs.map((item) => (
          <section className="card" key={item.q}>
            <h2>{item.q}</h2>
            <p>{item.a}</p>
          </section>
        ))}
      </div>
    </main>
  );
}


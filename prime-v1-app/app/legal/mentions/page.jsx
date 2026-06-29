"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function LegalPage() {
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
        h1 { font-size: 44px; line-height: .98; margin: 18px 0; letter-spacing: -2px; }
        h2 { color: #D4B06A; margin: 28px 0 10px; font-size: 20px; }
        p, li { color: rgba(255,255,255,.7); line-height: 1.65; }
        .notice {
          padding: 16px; border-radius: 18px; background: rgba(212,176,106,.08);
          border: 1px solid rgba(212,176,106,.18); color: rgba(255,255,255,.78);
          margin: 18px 0;
        }
      `}</style>

      <div className="page">
        <button className="back" onClick={() => router.push("/settings")}><ArrowLeft size={20} /></button>
        <div className="badge">Légal</div>
        <h1>Mentions légales</h1>
        <div className="notice">
          Document préparatoire à relire et valider avant lancement officiel.
        </div>
        
        <h2>Éditeur</h2>
        <p>PRIME — Informations légales de l’éditeur à compléter avant lancement officiel.</p>

        <h2>Nom commercial</h2>
        <p>PRIME.</p>

        <h2>Domaine</h2>
        <p>theprimeapp.com</p>

        <h2>Contact</h2>
        <p>support@theprimeapp.com</p>

        <h2>Hébergement</h2>
        <p>Application hébergée via Vercel. Base de données et authentification via Supabase.</p>

      </div>
    </main>
  );
}


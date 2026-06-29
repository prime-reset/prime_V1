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
        <div className="badge">Confidentialité</div>
        <h1>Politique de confidentialité</h1>
        <div className="notice">
          Document préparatoire à relire et valider avant lancement officiel.
        </div>
        
        <h2>1. Données collectées</h2>
        <p>PRIME peut collecter l’adresse e-mail, les informations de profil, les données de sessions, les scores de discipline, les erreurs comportementales et les prescriptions générées.</p>

        <h2>2. Finalité</h2>
        <p>Ces données servent à faire fonctionner l’application, personnaliser l’expérience utilisateur, générer des analyses comportementales et améliorer PRIME.</p>

        <h2>3. Conservation</h2>
        <p>Les données sont conservées tant que le compte utilisateur est actif, sauf demande de suppression.</p>

        <h2>4. Droits utilisateur</h2>
        <p>L’utilisateur peut demander l’accès, la correction, l’export ou la suppression de ses données.</p>

        <h2>5. Contact</h2>
        <p>Pour toute demande liée aux données personnelles : support@theprimeapp.com.</p>

      </div>
    </main>
  );
}


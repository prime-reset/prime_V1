"use client";

import { useState } from "react";
import {
  Fingerprint,
  Target,
  Brain,
  ShieldCheck,
  Sparkles,
  CheckCircle,
} from "lucide-react";

import BottomNav from "../components/BottomNav";

export default function PrimeIdentityPage() {
  const [profile, setProfile] = useState({
    tradingStyle: "",
    customStyle: "",
    asset: "",
    experience: "",
    availability: "",
    weakness: "",
    psychology: "",
    goal: "",
    entryCriteria: "",
    invalidation: "",
  });

  const [result, setResult] = useState(null);

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isCustom = profile.tradingStyle === "Autre / personnalisé";

  const isComplete =
    profile.tradingStyle &&
    profile.asset &&
    profile.experience &&
    profile.availability &&
    profile.weakness &&
    profile.psychology &&
    profile.goal &&
    (!isCustom ||
      (profile.customStyle && profile.entryCriteria && profile.invalidation));

  const generateProfile = () => {
    let detectedProfile = "Trader en construction";
    let risk = profile.weakness || "Discipline à renforcer";
    let strength = "Capacité à structurer ton évolution";
    let weakness = "Manque de données comportementales";
    let prescription = "Respecter une checklist complète avant chaque entrée.";

    let checklist = [
      "Contexte marché validé",
      "Setup conforme au plan",
      "Risque défini avant l’entrée",
      "État mental stable",
      "Invalidation claire",
    ];

    if (profile.tradingStyle === "SMC / Liquidité") {
      detectedProfile = "Structure & Liquidité";
      strength = "Lecture du contexte et zones clés";
      weakness = "Risque d’anticiper avant confirmation";
      prescription = "Attendre sweep, réaction et confirmation avant exécution.";
      checklist = [
        "Biais HTF validé",
        "Liquidité identifiée",
        "Sweep ou réaction confirmé",
        "BOS / CHOCH propre",
        "Risque défini avant l’entrée",
      ];
    }

    if (profile.tradingStyle === "Scalping") {
      detectedProfile = "Scalper sous pression";
      strength = "Réactivité et vitesse d’exécution";
      weakness = "Risque de sur-exécution";
      prescription = "Limiter la session à 2 trades maximum.";
      checklist = [
        "Setup rapide mais validé",
        "Pas d’entrée par ennui",
        "Risque fixe respecté",
        "Maximum 2 trades aujourd’hui",
        "Pause obligatoire après perte",
      ];
    }

    if (profile.weakness === "Revenge trade") {
      detectedProfile = "Trader émotionnel après perte";
      risk = "Revenge trade";
      weakness = "Difficulté à accepter une perte sans vouloir récupérer";
      prescription = "Après une perte : pause obligatoire de 20 minutes.";
      checklist = [
        "Ai-je perdu le trade précédent ?",
        "Ai-je attendu 20 minutes ?",
        "Le setup est-il réellement valide ?",
        "Mon risque est-il réduit ?",
        "Suis-je en train de me refaire ?",
      ];
    }

    if (profile.weakness === "Overtrading") {
      detectedProfile = "Trader en sur-exécution";
      risk = "Overtrading";
      weakness = "Confusion entre activité et efficacité";
      prescription = "Maximum 2 trades par session pendant 7 jours.";
    }

    if (profile.weakness === "FOMO") {
      detectedProfile = "Trader impulsif sur mouvement";
      risk = "FOMO";
      weakness = "Difficulté à laisser partir un mouvement";
      prescription = "Aucune entrée sans pullback ou confirmation complète.";
    }

    if (isCustom) {
      detectedProfile = profile.customStyle;
      strength = "Méthode personnelle et différenciée";
      weakness = profile.weakness;
      prescription =
        "Respecter tes critères personnels avant toute exécution.";
      checklist = [
        profile.entryCriteria,
        profile.invalidation,
        "Risque défini avant entrée",
        "État mental stable",
        "Trade conforme à TA méthode",
      ];
    }

    const generatedProfile = {
      detectedProfile,
      risk,
      strength,
      weakness,
      prescription,
      checklist,
      answers: profile,
    };

    setResult(generatedProfile);
    localStorage.setItem("primeProfile", JSON.stringify(generatedProfile));
  };

  return (
    <main className="identity-page">
      <style>{`
        * { box-sizing: border-box; }

        .identity-page {
          min-height: 100vh;
          padding: 32px 20px 150px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.86),
              rgba(0,0,0,0.96)
            ),
            #000;
        }

        .page {
          max-width: 460px;
          margin: 0 auto;
        }

        .brand {
          color: #D4B06A;
          letter-spacing: 6px;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .title {
          font-size: 58px;
          line-height: 0.92;
          font-weight: 900;
          letter-spacing: -3px;
          margin: 0;
        }

        .title span {
          display: block;
          color: rgba(255,255,255,0.88);
        }

        .subtitle {
          margin-top: 24px;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255,255,255,0.68);
          margin-bottom: 30px;
        }

        .card {
          padding: 26px;
          margin-bottom: 18px;
          border-radius: 34px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.02)
            ),
            rgba(5,5,5,0.78);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(22px);
          box-shadow:
            0 20px 60px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .icon-box {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          background: rgba(212,176,106,0.10);
          border: 1px solid rgba(212,176,106,0.18);
          color: #D4B06A;
        }

        .card-label {
          color: rgba(212,176,106,0.82);
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .question {
          font-size: 21px;
          line-height: 1.4;
          font-weight: 800;
          margin-bottom: 16px;
        }

        select,
        textarea {
          width: 100%;
          background: rgba(15,15,15,0.86);
          color: white;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 18px;
          padding: 17px;
          font-size: 16px;
          outline: none;
          font-family: Arial, sans-serif;
        }

        textarea {
          min-height: 105px;
          resize: vertical;
          margin-top: 12px;
        }

        .button {
          width: 100%;
          border: none;
          border-radius: 22px;
          padding: 18px;
          font-size: 16px;
          font-weight: 900;
          color: #000;
          background: linear-gradient(90deg, #9d742f, #d6b25f, #fff2b8);
          cursor: pointer;
          opacity: 1;
          margin-bottom: 18px;
        }

        .button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .result-title {
          font-size: 30px;
          line-height: 1.16;
          color: #D4B06A;
          margin: 0 0 16px;
        }

        .text {
          color: rgba(255,255,255,0.72);
          font-size: 17px;
          line-height: 1.7;
        }

        .list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 14px;
        }

        .list-text {
          margin: 0;
          color: rgba(255,255,255,0.78);
          font-size: 16px;
          line-height: 1.55;
        }

        @media(max-width:520px) {
          .title { font-size: 50px; }
        }
      `}</style>

      <div className="page">
        <section>
          <div className="brand">PRIME IDENTITY</div>

          <h1 className="title">
            Ton ADN
            <span>de trader.</span>
          </h1>

          <p className="subtitle">
            PRIME s’adapte à ta méthode, même si ton système ne rentre dans
            aucune case.
          </p>
        </section>

        <QuestionCard
          icon={<Fingerprint size={26} />}
          label="STYLE"
          title="Quel est ton style principal ?"
          value={profile.tradingStyle}
          onChange={(v) => updateField("tradingStyle", v)}
          options={[
            "SMC / Liquidité",
            "Scalping",
            "Breakout",
            "Price Action",
            "Trend Following",
            "Autre / personnalisé",
          ]}
        />

        {isCustom && (
          <section className="card">
            <div className="icon-box">
              <Sparkles size={26} />
            </div>

            <div className="card-label">STYLE PERSONNALISÉ</div>

            <p className="question">Décris ta méthode</p>
            <textarea
              value={profile.customStyle}
              onChange={(e) => updateField("customStyle", e.target.value)}
              placeholder="Ex : liquidité + orderflow + volume profile"
            />

            <p className="question" style={{ marginTop: "22px" }}>
              Tes critères d’entrée obligatoires
            </p>
            <textarea
              value={profile.entryCriteria}
              onChange={(e) => updateField("entryCriteria", e.target.value)}
              placeholder="Ex : sweep + absorption + confirmation M5"
            />

            <p className="question" style={{ marginTop: "22px" }}>
              Qu’est-ce qui invalide ton setup ?
            </p>
            <textarea
              value={profile.invalidation}
              onChange={(e) => updateField("invalidation", e.target.value)}
              placeholder="Ex : clôture au-dessus du niveau invalidant"
            />
          </section>
        )}

        <QuestionCard
          icon={<Target size={26} />}
          label="MARCHÉ"
          title="Ton actif principal ?"
          value={profile.asset}
          onChange={(v) => updateField("asset", v)}
          options={["Nasdaq", "Gold", "Forex", "Crypto", "Indices", "Autre"]}
        />

        <QuestionCard
          icon={<Brain size={26} />}
          label="EXPÉRIENCE"
          title="Ton niveau d’expérience ?"
          value={profile.experience}
          onChange={(v) => updateField("experience", v)}
          options={["Débutant", "Intermédiaire", "Avancé", "Prop Firm Trader"]}
        />

        <QuestionCard
          icon={<ShieldCheck size={26} />}
          label="TEMPS"
          title="Temps disponible par jour ?"
          value={profile.availability}
          onChange={(v) => updateField("availability", v)}
          options={["Moins de 1h", "1 à 2h", "2 à 4h", "Plus de 4h"]}
        />

        <QuestionCard
          icon={<FlameIcon />}
          label="RISQUE"
          title="Ton plus gros problème émotionnel ?"
          value={profile.weakness}
          onChange={(v) => updateField("weakness", v)}
          options={[
            "Revenge trade",
            "Overtrading",
            "FOMO",
            "Stop déplacé",
            "Entrées impulsives",
          ]}
        />

        <QuestionCard
          icon={<Brain size={26} />}
          label="MENTAL"
          title="Comment te décrirais-tu ?"
          value={profile.psychology}
          onChange={(v) => updateField("psychology", v)}
          options={["Patient", "Impulsif", "Discipliné", "Stressé", "Agressif"]}
        />

        <QuestionCard
          icon={<Target size={26} />}
          label="OBJECTIF"
          title="Ton objectif principal ?"
          value={profile.goal}
          onChange={(v) => updateField("goal", v)}
          options={[
            "Discipline",
            "Consistance",
            "Passer un challenge",
            "Obtenir un payout",
            "Scaler",
          ]}
        />

        <button
          className="button"
          onClick={generateProfile}
          disabled={!isComplete}
        >
          Générer mon profil PRIME
        </button>

        {result && (
          <section className="card">
            <div className="icon-box">
              <Sparkles size={26} />
            </div>

            <div className="card-label">PROFIL PRIME DÉTECTÉ</div>

            <h2 className="result-title">{result.detectedProfile}</h2>

            <p className="text">
              <strong>Force :</strong> {result.strength}
            </p>

            <p className="text">
              <strong>Point de vigilance :</strong> {result.weakness}
            </p>

            <p className="text">
              <strong>Prescription :</strong> {result.prescription}
            </p>

            <div className="card-label" style={{ marginTop: "24px" }}>
              CHECKLIST PERSONNALISÉE
            </div>

            {result.checklist.map((item) => (
              <div key={item} className="list-item">
                <CheckCircle size={18} color="#D4B06A" />
                <p className="list-text">{item}</p>
              </div>
            ))}
          </section>
        )}
      </div>

      <BottomNav active="Setup" />
    </main>
  );
}

function QuestionCard({ icon, label, title, value, onChange, options }) {
  return (
    <section className="card">
      <div className="icon-box">{icon}</div>

      <div className="card-label">{label}</div>

      <p className="question">{title}</p>

      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choisir</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </section>
  );
}

function FlameIcon() {
  return <span style={{ fontSize: "26px" }}>🔥</span>;
}

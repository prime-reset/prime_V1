"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Check,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

export default function OfferPage() {
  const router = useRouter();

  const handleSelectOffer = (plan) => {
    localStorage.setItem("prime_selected_offer", plan);
    router.push(`/checkout?plan=${plan}`);
  };

  return (
    <main className="offer-page">
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #000; }

        .offer-page {
          min-height: 100vh;
          padding: 34px 16px 80px;
          color: white;
          font-family: Inter, Arial, sans-serif;
          background:
            radial-gradient(circle at 82% 4%, rgba(214,178,95,0.13), transparent 26%),
            radial-gradient(circle at 8% 18%, rgba(255,255,255,0.035), transparent 20%),
            linear-gradient(180deg, #030303 0%, #000 52%, #000 100%);
          overflow-x: hidden;
        }

        .page {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
        }

        .hero {
          max-width: 820px;
          margin: 0 auto 38px;
          text-align: center;
          animation: fadeUp .55s ease both;
        }

        .brand {
          margin: 0;
          color: #D4B06A;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: 10px;
          text-transform: uppercase;
        }

        .badge {
          width: fit-content;
          margin: 22px auto 0;
          padding: 9px 14px;
          border-radius: 999px;
          color: #D4B06A;
          background: rgba(212,176,106,0.09);
          border: 1px solid rgba(212,176,106,0.28);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .title {
          margin: 26px 0 0;
          font-size: clamp(42px, 7vw, 76px);
          line-height: .92;
          letter-spacing: -4px;
          font-weight: 1000;
        }

        .title span {
          display: block;
          background: linear-gradient(180deg, #fff 0%, #D4B06A 88%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          max-width: 680px;
          margin: 24px auto 0;
          color: rgba(255,255,255,0.68);
          font-size: 18px;
          line-height: 1.65;
        }

        .hero-points {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 760px;
          margin: 28px auto 0;
        }

        .hero-point {
          padding: 14px 12px;
          border-radius: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.075);
          color: rgba(255,255,255,0.86);
          font-size: 13px;
          font-weight: 850;
        }

        .hero-point span {
          color: #D4B06A;
          margin-right: 6px;
        }

        .truth-card {
          max-width: 840px;
          margin: 0 auto 28px;
          padding: 22px;
          border-radius: 28px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.018)),
            rgba(10,10,10,0.92);
          border: 1px solid rgba(212,176,106,0.20);
          box-shadow: 0 22px 70px rgba(0,0,0,0.62);
          text-align: center;
          animation: fadeUp .65s ease both;
        }

        .truth-card p {
          margin: 0;
          font-size: 22px;
          line-height: 1.35;
          font-weight: 900;
          letter-spacing: -0.7px;
        }

        .truth-card span { color: #D4B06A; }

        .comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 900px;
          margin: 0 auto 34px;
          animation: fadeUp .72s ease both;
        }

        .compare-card {
          padding: 22px;
          border-radius: 28px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.018)),
            rgba(10,10,10,0.92);
          border: 1px solid rgba(255,255,255,0.085);
          box-shadow: 0 18px 60px rgba(0,0,0,0.52);
        }

        .compare-card.positive { border-color: rgba(212,176,106,0.24); }

        .compare-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 16px;
          font-size: 20px;
          font-weight: 950;
        }

        .compare-title.good { color: #D4B06A; }

        .compare-list {
          display: grid;
          gap: 12px;
        }

        .compare-item {
          display: flex;
          gap: 10px;
          color: rgba(255,255,255,0.72);
          font-size: 14px;
          line-height: 1.45;
          font-weight: 650;
        }

        .compare-item svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .section-title {
          max-width: 780px;
          margin: 44px auto 22px;
          text-align: center;
        }

        .section-title p {
          margin: 0 0 12px;
          color: #D4B06A;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .section-title h2 {
          margin: 0;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1;
          letter-spacing: -2px;
          font-weight: 1000;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          max-width: 920px;
          margin: 0 auto;
          align-items: stretch;
        }

        .price-card {
          position: relative;
          overflow: hidden;
          padding: 26px;
          border-radius: 34px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.018)),
            rgba(9,9,9,0.94);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 26px 80px rgba(0,0,0,0.64);
          display: flex;
          flex-direction: column;
          min-height: 560px;
          animation: fadeUp .78s ease both;
        }

        .price-card.founder {
          border-color: rgba(212,176,106,0.38);
          box-shadow:
            0 26px 80px rgba(0,0,0,0.66),
            0 0 70px rgba(212,176,106,0.12);
        }

        .price-card.founder::before {
          content: "";
          position: absolute;
          inset: -40%;
          background: radial-gradient(circle, rgba(212,176,106,0.14), transparent 42%);
          animation: slowGlow 5s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .price-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .plan-badge {
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          color: #D4B06A;
          background: rgba(212,176,106,0.10);
          border: 1px solid rgba(212,176,106,0.25);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .standard .plan-badge {
          color: rgba(255,255,255,0.76);
          background: rgba(255,255,255,0.045);
          border-color: rgba(255,255,255,0.10);
        }

        .plan-name {
          margin: 22px 0 0;
          font-size: 36px;
          line-height: 1;
          font-weight: 1000;
          letter-spacing: -1.7px;
        }

        .plan-copy {
          margin: 12px 0 0;
          color: rgba(255,255,255,0.65);
          font-size: 15px;
          line-height: 1.55;
        }

        .price {
          margin: 24px 0 0;
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .price strong {
          font-size: 56px;
          line-height: .9;
          font-weight: 1000;
          letter-spacing: -3px;
          color: #D4B06A;
        }

        .standard .price strong { color: white; }

        .price span {
          color: rgba(255,255,255,0.54);
          font-size: 15px;
          font-weight: 800;
          padding-bottom: 7px;
        }

        .trial {
          margin-top: 12px;
          padding: 12px;
          border-radius: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.80);
          font-size: 14px;
          line-height: 1.4;
          font-weight: 750;
        }

        .trial.gold {
          background: rgba(212,176,106,0.10);
          border-color: rgba(212,176,106,0.22);
          color: #D4B06A;
        }

        .features {
          display: grid;
          gap: 13px;
          margin: 26px 0 28px;
        }

        .feature {
          display: flex;
          gap: 10px;
          color: rgba(255,255,255,0.78);
          font-size: 14px;
          line-height: 1.45;
          font-weight: 650;
        }

        .feature svg {
          color: #D4B06A;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .plan-button {
          margin-top: auto;
          width: 100%;
          border: none;
          border-radius: 20px;
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 1000;
          text-transform: uppercase;
          letter-spacing: .7px;
          cursor: pointer;
        }

        .plan-button.gold {
          background: linear-gradient(95deg, #9d742f, #d6b25f 52%, #fff2b8);
          color: #000;
          box-shadow: 0 18px 40px rgba(212,176,106,0.18);
        }

        .plan-button.dark {
          background: rgba(255,255,255,0.055);
          color: white;
          border: 1px solid rgba(255,255,255,0.11);
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          max-width: 980px;
          margin: 26px auto 0;
        }

        .product-card {
          padding: 20px;
          border-radius: 26px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.065), rgba(255,255,255,0.016)),
            rgba(10,10,10,0.94);
          border: 1px solid rgba(255,255,255,0.085);
          box-shadow: 0 18px 60px rgba(0,0,0,0.48);
        }

        .product-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #D4B06A;
          background: rgba(212,176,106,0.09);
          border: 1px solid rgba(212,176,106,0.19);
          margin-bottom: 16px;
        }

        .product-card h3 {
          margin: 0;
          font-size: 18px;
          line-height: 1.12;
          font-weight: 950;
          letter-spacing: -0.5px;
        }

        .product-card p {
          margin: 10px 0 0;
          color: rgba(255,255,255,0.62);
          font-size: 13.5px;
          line-height: 1.48;
        }

        .quote {
          max-width: 760px;
          margin: 42px auto 0;
          padding: 28px;
          border-radius: 30px;
          background:
            linear-gradient(145deg, rgba(212,176,106,0.10), rgba(255,255,255,0.018)),
            rgba(10,10,10,0.94);
          border: 1px solid rgba(212,176,106,0.20);
          text-align: center;
        }

        .quote p {
          margin: 0;
          font-size: 25px;
          line-height: 1.32;
          font-weight: 950;
          letter-spacing: -0.9px;
        }

        .quote span {
          display: block;
          margin-top: 16px;
          color: rgba(255,255,255,0.54);
          font-size: 14px;
          font-weight: 750;
        }

        .footer {
          margin-top: 54px;
          text-align: center;
          color: rgba(255,255,255,0.52);
        }

        .footer strong {
          display: block;
          color: #D4B06A;
          letter-spacing: 8px;
          font-size: 14px;
          margin-bottom: 12px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slowGlow {
          from { transform: rotate(0deg) scale(1); opacity: .55; }
          to { transform: rotate(14deg) scale(1.08); opacity: 1; }
        }

        @media(max-width: 820px) {
          .offer-page { padding: 28px 15px 70px; }

          .hero-points,
          .comparison,
          .pricing-grid,
          .product-grid {
            grid-template-columns: 1fr;
          }

          .hero { margin-bottom: 30px; }
          .title { letter-spacing: -2.6px; }

          .price-card {
            min-height: auto;
            border-radius: 30px;
            padding: 23px;
          }
        }

        @media(max-width: 420px) {
          .brand {
            font-size: 16px;
            letter-spacing: 8px;
          }

          .subtitle { font-size: 16px; }

          .truth-card p,
          .quote p {
            font-size: 21px;
          }

          .price strong { font-size: 50px; }
        }
      `}</style>

      <div className="page">
        <section className="hero">
          <p className="brand">PRIME.</p>

          <div className="badge">Application de discipline pour traders</div>

          <h1 className="title">
            Le marché ne détruit pas les traders.
            <span>Leur comportement, si.</span>
          </h1>

          <p className="subtitle">
            PRIME analyse chacune de tes sessions, détecte les erreurs que tu répètes
            et t’aide à construire une discipline durable.
          </p>

          <div className="hero-points">
            <div className="hero-point"><span>✓</span>Discipline Score</div>
            <div className="hero-point"><span>✓</span>Coach IA</div>
            <div className="hero-point"><span>✓</span>Prescriptions</div>
            <div className="hero-point"><span>✓</span>Journal intelligent</div>
          </div>
        </section>

        <section className="truth-card">
          <p>
            Le problème n’est pas toujours ton setup.
            <br />
            <span>C’est le comportement que tu répètes.</span>
          </p>
        </section>

        <section className="comparison">
          <div className="compare-card negative">
            <h2 className="compare-title">
              <X size={22} color="#ff6868" />
              Sans PRIME
            </h2>

            <div className="compare-list">
              <CompareBad text="Tu répètes les mêmes erreurs sans les voir clairement." />
              <CompareBad text="Tu juges ta session uniquement avec ton PnL." />
              <CompareBad text="Tu trades sous émotion, puis tu analyses trop tard." />
              <CompareBad text="Tu progresses au hasard, sans correction structurée." />
            </div>
          </div>

          <div className="compare-card positive">
            <h2 className="compare-title good">
              <Check size={22} color="#D4B06A" />
              Avec PRIME
            </h2>

            <div className="compare-list">
              <CompareGood text="Chaque session enrichit ton profil comportemental." />
              <CompareGood text="Ta discipline est mesurée indépendamment du résultat financier." />
              <CompareGood text="Tes patterns sont détectés : revenge, FOMO, overtrading." />
              <CompareGood text="PRIME te donne une prescription concrète pour corriger." />
            </div>
          </div>
        </section>

        <section className="section-title">
          <p>Choisis ton accès</p>
          <h2>Deux offres. Une seule discipline.</h2>
        </section>

        <section className="pricing-grid">
          <article className="price-card founder">
            <div className="price-content">
              <div className="plan-badge">20 places seulement</div>

              <h2 className="plan-name">Founder</h2>

              <p className="plan-copy">
                Pour les premiers traders qui veulent entrer dans PRIME avant le lancement public.
              </p>

              <div className="price">
                <strong>9,99€</strong>
                <span>/ mois</span>
              </div>

              <div className="trial gold">
                Tarif bloqué à vie. Pas d’essai gratuit sur l’offre Founder.
              </div>

              <div className="features">
                <Feature text="Toutes les fonctionnalités PRIME." />
                <Feature text="Prix Founder conservé à vie." />
                <Feature text="Badge Founder dans ton profil." />
                <Feature text="Accès aux futures mises à jour." />
                <Feature text="Priorité sur les retours et améliorations." />
              </div>

              <button
                className="plan-button gold"
                onClick={() => handleSelectOffer("founder")}
              >
                Je réserve ma place
                <ArrowRight size={18} />
              </button>
            </div>
          </article>

          <article className="price-card standard">
            <div className="price-content">
              <div className="plan-badge">Offre standard</div>

              <h2 className="plan-name">Standard</h2>

              <p className="plan-copy">
                Pour tester PRIME gratuitement avant de décider si tu veux continuer.
              </p>

              <div className="price">
                <strong>24,99€</strong>
                <span>/ mois</span>
              </div>

              <div className="trial">
                7 jours gratuits, puis 24,99€/mois. Annulation possible avant la fin de l’essai.
              </div>

              <div className="features">
                <Feature text="Cockpit PRIME complet." />
                <Feature text="Coach comportemental." />
                <Feature text="Discipline Score et graphique d’évolution." />
                <Feature text="Prescriptions intelligentes." />
                <Feature text="Journal et historique de sessions." />
              </div>

              <button
                className="plan-button dark"
                onClick={() => handleSelectOffer("standard")}
              >
                Essayer gratuitement
                <ArrowRight size={18} />
              </button>
            </div>
          </article>
        </section>

        <section className="section-title">
          <p>Pourquoi PRIME ?</p>
          <h2>Ton comportement devient enfin mesurable.</h2>
        </section>

        <section className="product-grid">
          <ProductCard
            icon={<Brain size={23} />}
            title="Coach comportemental"
            text="Détecte les dérives avant qu’elles deviennent des pertes répétées."
          />

          <ProductCard
            icon={<TrendingUp size={23} />}
            title="Discipline Score"
            text="Mesure ta qualité d’exécution indépendamment de ton PnL."
          />

          <ProductCard
            icon={<Target size={23} />}
            title="Prescriptions"
            text="PRIME construit un plan clair pour corriger tes habitudes."
          />

          <ProductCard
            icon={<ShieldCheck size={23} />}
            title="Journal intelligent"
            text="Chaque session nourrit ton historique et ton identité de trader."
          />
        </section>

        <section className="quote">
          <p>
            “Le problème n’a jamais été ma stratégie.
            <br />
            C’était moi.”
          </p>
          <span>Chaque trader finit par comprendre cette phrase.</span>
        </section>

        <footer className="footer">
          <strong>PRIME.</strong>
          Construis le trader que tu veux devenir.
        </footer>
      </div>
    </main>
  );
}

function CompareBad({ text }) {
  return (
    <div className="compare-item">
      <X size={16} color="#ff6868" />
      {text}
    </div>
  );
}

function CompareGood({ text }) {
  return (
    <div className="compare-item">
      <Check size={16} color="#D4B06A" />
      {text}
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="feature">
      <Check size={17} />
      {text}
    </div>
  );
}

function ProductCard({ icon, title, text }) {
  return (
    <div className="product-card">
      <div className="product-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}


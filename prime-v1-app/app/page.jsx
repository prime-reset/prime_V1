import {
  Flame,
  ShieldCheck,
  Brain,
  BarChart3,
  Target,
  Sparkles,
  Trophy,
  CalendarCheck,
} from "lucide-react";

import BottomNav from "./components/BottomNav";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.12), transparent 30%), #000",
        color: "white",
        padding: "28px 18px 110px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 430, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: 4,
                color: "rgba(255,255,255,0.45)",
                margin: 0,
              }}
            >
              PRIME.
            </p>
            <h1 style={{ fontSize: 34, margin: "8px 0 0", fontWeight: 700 }}>
              Discipline Mode
            </h1>
          </div>

          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={22} />
          </div>
        </header>

        <Card>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <IconBox light>
              <Brain size={22} />
            </IconBox>
            <div>
              <p style={label}>Coach PRIME</p>
              <h2 style={{ margin: 0, fontSize: 19 }}>
                Les choses sérieuses commencent.
              </h2>
            </div>
          </div>

          <p style={text}>
            Ton objectif est simple : maintenir une discipline constante. PRIME
            t’aide à identifier tes erreurs, corriger ton comportement et
            construire le trader que tu deviens.
          </p>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={label}>Streak PRIME</p>
              <h2 style={{ fontSize: 28, margin: "8px 0 0" }}>
                4 jours disciplinés
              </h2>
            </div>

            <IconBox light>
              <Flame size={28} />
            </IconBox>
          </div>

          <p style={text}>
            Tu construis ta régularité. Chaque journée où tu respectes ton plan
            renforce ton identité de trader discipliné.
          </p>

          <div style={{ marginTop: 20 }}>
            <div style={rowBetween}>
              <span>Objectif semaine</span>
              <span>4/5 jours</span>
            </div>

            <div style={progressBg}>
              <div style={{ ...progressFill, width: "80%" }} />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginTop: 18,
            }}
          >
            <MiniStat icon={<CalendarCheck size={18} />} title="Série" value="4j" />
            <MiniStat icon={<Trophy size={18} />} title="Record" value="12j" />
            <MiniStat icon={<ShieldCheck size={18} />} title="Statut" value="Actif" />
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <SmallCard
            icon={<ShieldCheck size={20} />}
            title="Score discipline"
            value="82%"
            desc="Très bon contrôle aujourd’hui."
          />

          <SmallCard
            icon={<Flame size={20} />}
            title="État mental"
            value="Stable"
            desc="Tu peux trader avec clarté."
          />
        </div>

        <Card>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <IconBox>
              <Target size={20} />
            </IconBox>
            <div>
              <p style={label}>Prescription active</p>
              <h3 style={{ margin: 0 }}>Maximum 2 trades aujourd’hui</h3>
            </div>
          </div>

          <p style={text}>
            Ta priorité n’est pas de faire plus. Ta priorité est de respecter
            ton plan, limiter l’impulsivité et protéger ton capital mental.
          </p>
        </Card>

        <Card>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <IconBox>
              <BarChart3 size={20} />
            </IconBox>
            <div>
              <p style={label}>Progression PRIME</p>
              <h3 style={{ margin: 0 }}>Niveau 3 — Trader structuré</h3>
            </div>
          </div>

          <div style={{ ...progressBg, marginTop: 20 }}>
            <div style={{ ...progressFill, width: "64%" }} />
          </div>

          <div style={rowBetween}>
            <span>640 XP</span>
            <span>1000 XP</span>
          </div>
        </Card>
      </div>

      <BottomNav />
    </main>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.045)",
        borderRadius: 28,
        padding: 20,
        marginBottom: 18,
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        backdropFilter: "blur(18px)",
      }}
    >
      {children}
    </div>
  );
}

function IconBox({ children, light }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 18,
        background: light ? "white" : "rgba(255,255,255,0.08)",
        color: light ? "black" : "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

function MiniStat({ icon, title, value }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 20,
        padding: 12,
        background: "rgba(255,255,255,0.035)",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.7)" }}>{icon}</div>
      <p style={{ ...label, marginTop: 8 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{value}</p>
    </div>
  );
}

function SmallCard({ icon, title, value, desc }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.045)",
        borderRadius: 26,
        padding: 16,
        marginBottom: 18,
      }}
    >
      <IconBox>{icon}</IconBox>
      <p style={{ ...label, marginTop: 14 }}>{title}</p>
      <p style={{ margin: "4px 0", fontSize: 26, fontWeight: 700 }}>{value}</p>
      <p style={{ ...text, fontSize: 12 }}>{desc}</p>
    </div>
  );
}

const label = {
  margin: 0,
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
};

const text = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.62)",
  marginTop: 16,
};

const rowBetween = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
  marginTop: 10,
};

const progressBg = {
  width: "100%",
  height: 8,
  borderRadius: 999,
  background: "rgba(255,255,255,0.10)",
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  borderRadius: 999,
  background: "white",
};

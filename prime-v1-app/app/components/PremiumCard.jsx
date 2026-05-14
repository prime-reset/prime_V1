export default function PremiumCard({ children }) {
  return (
    <div
      style={{
        background: "rgba(15,15,15,0.55)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "28px",
        padding: "28px",
        marginBottom: "22px",
        backdropFilter: "blur(12px)",

        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",

        transition: "0.35s ease",
      }}
    >
      {children}
    </div>
  );
}

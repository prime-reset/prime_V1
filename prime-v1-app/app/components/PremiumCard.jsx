export default function PremiumCard({ children }) {
  return (
    <div
      style={{
        background: "rgba(12,12,12,0.42)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "30px",
        padding: "30px",
        marginBottom: "24px",

        backdropFilter: "blur(14px)",

        boxShadow: `
          0 10px 40px rgba(0,0,0,0.35),
          inset 0 1px 0 rgba(255,255,255,0.03)
        `,

        transition: "all 0.35s ease",

        animation: "floating 5s ease-in-out infinite",
      }}
    >
      {children}
    </div>
  );
}

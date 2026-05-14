export default function PremiumCard({
  children,
  gradient = false,
}) {
  return (
    <div
      style={{
        background: gradient
          ? "linear-gradient(180deg,#141414 0%,#0B0B0B 100%)"
          : "#0D0D0D",

        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "30px",
        padding: "28px",
        marginBottom: "24px",

        boxShadow:
          "0 10px 40px rgba(0,0,0,0.35)",

        transition: "all 0.25s ease",
      }}
    >
      {children}
    </div>
  );
}

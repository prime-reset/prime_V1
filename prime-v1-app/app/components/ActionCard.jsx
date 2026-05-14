import Link from "next/link";

export default function ActionCard({ href, title, subtitle }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "rgba(12,12,12,0.42)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "30px",
          padding: "28px",
          marginBottom: "22px",
          backdropFilter: "blur(14px)",
          boxShadow: `
            0 10px 40px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.03)
          `,
          animation: "floating 5s ease-in-out infinite",
        }}
      >
        <p style={{ color: "white", fontSize: "20px", fontWeight: "700", margin: 0 }}>
          {title}
        </p>

        {subtitle && (
          <p style={{ color: "#8B8B8B", fontSize: "15px", lineHeight: "24px", marginTop: "10px", marginBottom: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}

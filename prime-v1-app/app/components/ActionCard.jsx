"use client";

import Link from "next/link";

export default function ActionCard({ href, title, subtitle }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "rgba(10,10,10,0.42)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "30px",
          padding: "28px",
          marginBottom: "24px",
          backdropFilter: "blur(14px)",
          boxShadow: `
            0 10px 40px rgba(0,0,0,0.38),
            inset 0 1px 0 rgba(255,255,255,0.04)
          `,
          transform: "translateY(0px)",
          transition: "all 0.35s ease",
          animation: "floating 5s ease-in-out infinite",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
          e.currentTarget.style.border = "1px solid rgba(212,176,106,0.22)";
          e.currentTarget.style.boxShadow =
            "0 18px 50px rgba(0,0,0,0.45), 0 0 30px rgba(212,176,106,0.10)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0px) scale(1)";
          e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
          e.currentTarget.style.boxShadow =
            "0 10px 40px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04)";
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: "22px",
            fontWeight: "700",
            margin: 0,
          }}
        >
          {title}
        </p>

        {subtitle && (
          <p
            style={{
              color: "rgba(255,255,255,0.48)",
              fontSize: "16px",
              lineHeight: "26px",
              marginTop: "12px",
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}

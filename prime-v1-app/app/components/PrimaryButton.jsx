"use client";

export default function PrimaryButton({ children }) {
  return (
    <button
      style={{
        width: "100%",
        padding: "24px",
        borderRadius: "30px",
        border: "none",

        background: `
          linear-gradient(
            135deg,
            #E1BE7A,
            #D4B06A,
            #C89A43
          )
        `,

        color: "black",
        fontSize: "22px",
        fontWeight: "700",
        cursor: "pointer",

        boxShadow: `
          0 0 50px rgba(212,176,106,0.18),
          0 12px 30px rgba(0,0,0,0.35)
        `,

        transition: "all 0.28s ease",

        animation: "buttonGlow 4s ease-in-out infinite",
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}

"use client";

export default function PrimaryButton({ children }) {
  return (
    <button
      style={{
        width: "100%",
        background: "linear-gradient(135deg, #E0BC72 0%, #D4B06A 100%)",
        color: "black",
        border: "none",
        borderRadius: "30px",
        padding: "26px 24px",
        fontSize: "22px",
        fontWeight: "700",
        cursor: "pointer",
        marginBottom: "28px",
        transition: "all 0.35s ease",
        boxShadow: `
          0 0 40px rgba(212,176,106,0.22),
          0 12px 40px rgba(0,0,0,0.45)
        `,
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.01)";
        e.currentTarget.style.boxShadow =
          "0 0 60px rgba(212,176,106,0.35), 0 18px 50px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px) scale(1)";
        e.currentTarget.style.boxShadow =
          "0 0 40px rgba(212,176,106,0.22), 0 12px 40px rgba(0,0,0,0.45)";
      }}
    >
      <span
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {children}
      </span>

      <div
        style={{
          position: "absolute",
          top: "-120%",
          left: "-40%",
          width: "60%",
          height: "320%",
          background: "rgba(255,255,255,0.18)",
          transform: "rotate(25deg)",
          filter: "blur(14px)",
        }}
      />
    </button>
  );
}

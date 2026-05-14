import Link from "next/link";

export default function BottomNav({ active }) {
  const items = [
    ["Prime", "/"],
    ["Session", "/session"],
    ["Coach", "/coach"],
    ["Journal", "/journal"],
    ["Profil", "/profile"],
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "18px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        maxWidth: "520px",
        background: "rgba(15,15,15,0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "26px",
        display: "flex",
        justifyContent: "space-around",
        padding: "16px 10px",
        backdropFilter: "blur(14px)",
        zIndex: 50,
      }}
    >
      {items.map(([label, href]) => (
        <Link
          key={label}
          href={href}
          style={{
            color: active === label ? "#D4B06A" : "#8B8B8B",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: active === label ? "700" : "500",
          }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

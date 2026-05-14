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
        borderRadius: "28px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "16px 10px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.55)",
        zIndex: 50,
      }}
    >
      {items.map(([label, href]) => {
        const isActive = active === label;

        return (
          <Link
            key={label}
            href={href}
            style={{
              color: isActive ? "#D4B06A" : "#777",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: isActive ? "700" : "500",
              padding: "8px 6px",
              borderRadius: "14px",
              background: isActive
                ? "rgba(212,176,106,0.10)"
                : "transparent",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

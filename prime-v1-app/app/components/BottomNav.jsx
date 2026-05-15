import Link from "next/link";

export default function BottomNav({ active }) {
  const items = [
    ["Prime", "/"],
    ["Session", "/session"],
    ["Coach", "/coach"],
    ["Journal", "/journal"],
    ["Profil", "/profile"],
    ["Setup", "/onboarding"],
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "18px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "94%",
        maxWidth: "540px",
        background: "rgba(10,10,10,0.55)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "28px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "14px 8px",
        backdropFilter: "blur(18px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
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
              color: isActive ? "#D4B06A" : "#8B8B8B",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: isActive ? "700" : "500",
              padding: "8px 7px",
              borderRadius: "16px",
              background: isActive
                ? "rgba(212,176,106,0.12)"
                : "transparent",
              boxShadow: isActive
                ? "0 0 24px rgba(212,176,106,0.12)"
                : "none",
              transition: "all 0.25s ease",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

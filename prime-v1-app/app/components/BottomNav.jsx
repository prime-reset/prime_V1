import Link from "next/link";

export default function BottomNav({ active }) {
  const items = [
    ["Prime", "/"],
    ["Identity", "/onboarding"],
    ["Profil", "/profile"],
    ["Session", "/session"],
    ["Coach", "/coach"],
    ["Journal", "/journal"],
  ];

  return (
    <div style={nav}>
      {items.map(([label, href]) => {
        const isActive = active === label;

        return (
          <Link
            key={label}
            href={href}
            style={{
              ...item,
              color: isActive ? "#D4B06A" : "#8B8B8B",
              fontWeight: isActive ? "800" : "600",
              background: isActive
                ? "rgba(212,176,106,0.12)"
                : "transparent",
              boxShadow: isActive
                ? "0 0 20px rgba(212,176,106,0.12)"
                : "none",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

const nav = {
  position: "fixed",
  bottom: "14px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "96%",
  maxWidth: "540px",
  background: "rgba(5,5,5,0.68)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 6px",
  backdropFilter: "blur(22px)",
  boxShadow:
    "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
  zIndex: 999,
};

const item = {
  flex: 1,
  textAlign: "center",
  textDecoration: "none",
  fontSize: "11px",
  lineHeight: "1",
  padding: "9px 2px",
  borderRadius: "14px",
  transition: "all 0.25s ease",
  whiteSpace: "nowrap",
};

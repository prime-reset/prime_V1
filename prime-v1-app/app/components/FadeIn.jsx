export default function FadeIn({ children, delay = 0 }) {
  return (
    <div
      style={{
        opacity: 0,
        animation: `fadeUp 0.95s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`,
      }}
    >
      {children}
    </div>
  );
}

export default function FadeIn({ children, delay = 0 }) {
  return (
    <div
      style={{
        animation: `fadeUp 0.6s ease ${delay}s both`,
      }}
    >
      {children}
    </div>
  );
}

import "./globals.css";

export const metadata = {
  title: "PRIME. Trading Discipline OS",
  description: "V1 prototype of PRIME, a trading discipline and behavioral coaching app.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

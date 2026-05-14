import "./globals.css";

export const metadata = {
  title: "PRIME",
  description: "Trading Discipline OS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "PRIME",
  description: "Trading Discipline OS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <div className="prime-global-bg" />

        <div className="prime-app">
          {children}
        </div>
      </body>
    </html>
  );
}

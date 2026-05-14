export const metadata = {
  title: "PRIME",
  description: "Trading Discipline OS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          background: "#050505",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}

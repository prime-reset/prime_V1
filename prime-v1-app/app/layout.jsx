import "./globals.css";
import { PrimeToastProvider } from "./components/PrimeToast";
export const metadata = {
  title: "PRIME",
  description: "Trading Discipline OS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
  <PrimeToastProvider>
    {children}
  </PrimeToastProvider>
</body>
    </html>
  );
}

import "./globals.css";
import { Anton, Inter } from "next/font/google";
import Link from "next/link";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "Crossover — Basketball & Soccer, Live",
  description:
    "Auto-updating basketball and soccer headlines, sourced from major outlets worldwide and refreshed every five minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="wordmark">
            CROSS<span className="wordmark-x">✕</span>OVER
          </Link>
          <nav className="site-nav">
            <Link href="/basketball" className="nav-link nav-basketball">
              Basketball
            </Link>
            <Link href="/soccer" className="nav-link nav-soccer">
              Soccer
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Headlines link out to their original publishers. Built by Nate Smyth.
          </p>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
const geist = Geist({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "DairyFlat Air – Premium Charter Flights",
  description: "Luxury point-to-point flights from Dairy Flat Airport",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen bg-slate-950 text-white`}>
        <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-amber-400 hover:text-amber-300 transition-colors">
              <span className="text-2xl">✈</span>DairyFlat Air
            </Link>
            <div className="flex gap-6 text-sm text-slate-300">
              <Link href="/search" className="hover:text-amber-400 transition-colors">Search Flights</Link>
              <Link href="/my-bookings" className="hover:text-amber-400 transition-colors">My Bookings</Link>
            </div>
          </div>
        </nav>
        {children}
        <footer className="border-t border-slate-800 mt-20 py-8 text-center text-slate-500 text-sm">
          <p>© 2026 DairyFlat Air · Operating from NZNE Dairy Flat Airport, Auckland</p>
        </footer>
      </body>
    </html>
  );
}

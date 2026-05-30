'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const AIRPORTS: Record<string, string> = {
  NZNE: 'Auckland – Dairy Flat', YSSY: 'Sydney', NZRO: 'Rotorua',
  NZCI: 'Chatham Islands', NZGB: 'Great Barrier Island', NZTL: 'Lake Tekapo',
};
const AIRPORT_LIST = Object.entries(AIRPORTS).map(([code, label]) => ({ code, label }));

interface Flight {
  _id: string; flightNumber: string; from: string; to: string;
  aircraft: string; seats: number; seatsBooked: number;
  departureUTC: string; arrivalUTC: string; departureLocal: string; arrivalLocal: string;
  price: number; date: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function duration(dep: string, arr: string) {
  const mins = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;
  return `${Math.floor(mins/60)}h${mins%60>0?' '+(mins%60)+'m':''}`;
}

function SearchContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [from, setFrom] = useState(sp.get('from') || '');
  const [to, setTo] = useState(sp.get('to') || '');
  const [date, setDate] = useState(sp.get('date') || '');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  async function search(f: string, t: string, d: string) {
    setLoading(true); setSearched(true);
    const params = new URLSearchParams();
    if (f) params.set('from', f);
    if (t) params.set('to', t);
    if (d) params.set('date', d);
    const res = await fetch(`/api/flights?${params}`);
    const data = await res.json();
    setFlights(data.flights || []);
    setLoading(false);
  }

  useEffect(() => { if (sp.get('from') || sp.get('to')) search(sp.get('from')||'', sp.get('to')||'', sp.get('date')||''); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (date) params.set('date', date);
    router.push(`/search?${params}`);
    search(from, to, date);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Search Flights</h1>
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm">
              <option value="">Any origin</option>
              {AIRPORT_LIST.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">To</label>
            <select value={to} onChange={e => setTo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm">
              <option value="">Any destination</option>
              {AIRPORT_LIST.filter(a => a.code !== from).map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Date (optional)</label>
            <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-2.5 rounded-xl transition-colors">Search</button>
          </div>
        </div>
        {!date && <p className="text-slate-500 text-xs mt-3">💡 Leave date blank to see all upcoming flights on this route</p>}
      </form>
      {loading && <div className="text-center py-20 text-slate-400"><div className="text-4xl mb-4 animate-bounce">✈️</div><p>Searching flights…</p></div>}
      {!loading && searched && flights.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg font-semibold text-white mb-2">No flights found</p>
          <p>Try different dates or <Link href="/" className="text-amber-400 hover:underline">browse all routes</Link>.</p>
        </div>
      )}
      {!loading && flights.length > 0 && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm mb-4">{flights.length} flight{flights.length !== 1 ? 's' : ''} found</p>
          {flights.map(f => {
            const available = f.seats - f.seatsBooked;
            const full = available === 0;
            return (
              <div key={f._id} className={`bg-slate-900 border rounded-xl p-5 transition-all ${full ? 'border-slate-800 opacity-60' : 'border-slate-700 hover:border-amber-400/50'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{f.departureLocal}</div>
                      <div className="text-xs text-slate-400">{f.from}</div>
                      <div className="text-xs text-slate-500">{AIRPORTS[f.from]}</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-xs text-slate-500 mb-1">{duration(f.departureUTC, f.arrivalUTC)}</div>
                      <div className="border-t border-slate-600 relative"><span className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 text-xs">✈</span></div>
                      <div className="text-xs text-slate-500 mt-1">{f.flightNumber}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{f.arrivalLocal}</div>
                      <div className="text-xs text-slate-400">{f.to}</div>
                      <div className="text-xs text-slate-500">{AIRPORTS[f.to]}</div>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <div className="text-slate-400 text-sm mb-1">{formatDate(f.departureUTC)}</div>
                    <div className="text-2xl font-bold text-amber-400 mb-1">NZD ${f.price}</div>
                    <div className="text-xs text-slate-400 mb-3">{f.aircraft} · {available} seat{available !== 1 ? 's' : ''} left</div>
                    {full ? <span className="bg-red-900/50 text-red-400 border border-red-800 text-xs px-3 py-1.5 rounded-lg">Full</span>
                      : <Link href={`/book/${f._id}`} className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm px-5 py-2 rounded-lg transition-colors inline-block">Book Now</Link>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}

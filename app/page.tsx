'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AIRPORTS = [
  { code: 'NZNE', label: 'Auckland – Dairy Flat (NZNE)' },
  { code: 'YSSY', label: 'Sydney, Australia (YSSY)' },
  { code: 'NZRO', label: 'Rotorua (NZRO)' },
  { code: 'NZCI', label: 'Chatham Islands – Tuuta (NZCI)' },
  { code: 'NZGB', label: 'Great Barrier Island – Claris (NZGB)' },
  { code: 'NZTL', label: 'Lake Tekapo (NZTL)' },
];

const ROUTES = [
  { from: 'NZNE', to: 'YSSY', label: 'Auckland → Sydney', freq: 'Weekly (Fri)', icon: '✈️', price: 'from NZD $850' },
  { from: 'NZNE', to: 'NZRO', label: 'Auckland → Rotorua', freq: 'Twice daily, weekdays', icon: '🏔️', price: 'from NZD $180' },
  { from: 'NZNE', to: 'NZGB', label: 'Auckland → Great Barrier', freq: '3× weekly', icon: '🏝️', price: 'from NZD $220' },
  { from: 'NZNE', to: 'NZCI', label: 'Auckland → Chatham Islands', freq: 'Twice weekly', icon: '🌊', price: 'from NZD $420' },
  { from: 'NZNE', to: 'NZTL', label: 'Auckland → Lake Tekapo', freq: 'Weekly (Mon)', icon: '🏔️', price: 'from NZD $310' },
];

export default function Home() {
  const router = useRouter();
  const [from, setFrom] = useState('NZNE');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const today = new Date().toISOString().split('T')[0];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (date) params.set('date', date);
    router.push(`/search?${params}`);
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1 text-amber-400 text-sm mb-6">
            Premium charter flights from Dairy Flat Airport
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Fly in luxury.<br />
            <span className="text-amber-400">Arrive in style.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Point-to-point private jet service across New Zealand and beyond. Up to 6 passengers, no crowds, no queues.
          </p>

          {/* Search Box */}
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-5 max-w-3xl mx-auto shadow-2xl">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <select value={from} onChange={e => setFrom(e.target.value)}
                  className="bg-slate-700 border border-slate-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors w-full">
                  {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
                </select>
                <select value={to} onChange={e => setTo(e.target.value)}
                  className="bg-slate-700 border border-slate-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors w-full">
                  <option value="">To – any destination</option>
                  {AIRPORTS.filter(a => a.code !== from).map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
                </select>
                <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
                  className="bg-slate-700 border border-slate-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors w-full" />
              </div>
              <button type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl transition-colors text-lg">
                Search Flights →
              </button>
              <p className="text-slate-500 text-xs mt-2">Leave date blank to see all upcoming flights</p>
            </form>
          </div>
        </div>
      </section>

      {/* Routes */}
      <section className="bg-slate-950 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">Our Routes</h2>
          <p className="text-slate-400 text-center mb-10">Click any route to see available flights</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROUTES.map(r => (
              <button key={r.label}
                onClick={() => router.push(`/search?from=${r.from}&to=${r.to}`)}
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 rounded-xl p-5 text-left transition-all w-full">
                <div className="text-3xl mb-3">{r.icon}</div>
                <div className="font-semibold text-white group-hover:text-amber-400 transition-colors mb-1">{r.label}</div>
                <div className="text-slate-400 text-sm">{r.freq}</div>
                <div className="text-amber-400 text-sm font-semibold mt-2">{r.price}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section className="bg-slate-900 border-t border-slate-800 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-white">Our Fleet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'SyberJet SJ30i', seats: 6, desc: 'Our flagship prestige jet. Ultra-long range with luxurious 6-passenger cabin.', badge: 'Prestige' },
              { name: 'Cirrus SF50', seats: 4, desc: 'Efficient single-engine jet perfect for short hops around NZ.', badge: 'Regional' },
              { name: 'HondaJet Elite', seats: 5, desc: 'Over-the-engine nacelle design reduces cabin noise for a smoother ride.', badge: 'Island Hopper' },
            ].map(a => (
              <div key={a.name} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">🛩️</span>
                  <span className="bg-amber-400/10 text-amber-400 text-xs px-2 py-1 rounded-full border border-amber-400/30">{a.badge}</span>
                </div>
                <h3 className="font-bold text-lg mb-1 text-white">{a.name}</h3>
                <p className="text-slate-400 text-sm mb-3">{a.desc}</p>
                <div className="text-amber-400 font-semibold text-sm">Up to {a.seats} passengers</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

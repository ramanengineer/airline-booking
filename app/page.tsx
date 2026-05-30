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
  { from: 'NZNE', to: 'YSSY', label: 'Auckland → Sydney', freq: 'Weekly (Fri)', icon: '✈️' },
  { from: 'NZNE', to: 'NZRO', label: 'Auckland → Rotorua', freq: 'Twice daily, weekdays', icon: '🏔️' },
  { from: 'NZNE', to: 'NZGB', label: 'Auckland → Great Barrier', freq: '3× weekly', icon: '🏝️' },
  { from: 'NZNE', to: 'NZCI', label: 'Auckland → Chatham Islands', freq: 'Twice weekly', icon: '🌊' },
  { from: 'NZNE', to: 'NZTL', label: 'Auckland → Lake Tekapo', freq: 'Weekly (Mon)', icon: '🏔️' },
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

  function quickSearch(f: string, t: string) {
    router.push(`/search?from=${f}&to=${t}`);
  }

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #f59e0b 0%, transparent 50%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-block bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1 text-amber-400 text-sm mb-6">
            Premium charter flights from Dairy Flat Airport
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-amber-300 bg-clip-text text-transparent">
            Fly in luxury.<br />Arrive in style.
          </h1>
          <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">
            Point-to-point private jet service across New Zealand and beyond. Up to 6 passengers, no crowds, no queues.
          </p>
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 max-w-3xl mx-auto shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <select value={from} onChange={e => setFrom(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors">
                <option value="">From…</option>
                {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
              </select>
              <select value={to} onChange={e => setTo(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors">
                <option value="">To…</option>
                {AIRPORTS.filter(a => a.code !== from).map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
              </select>
              <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors" />
              <button type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors whitespace-nowrap">
                Search →
              </button>
            </form>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">Our Routes</h2>
        <p className="text-slate-400 text-center mb-10">Click any route to see available flights</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROUTES.map(r => (
            <button key={r.label} onClick={() => quickSearch(r.from, r.to)}
              className="group bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl p-5 text-left transition-all">
              <div className="text-3xl mb-3">{r.icon}</div>
              <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">{r.label}</div>
              <div className="text-slate-400 text-sm mt-1">{r.freq}</div>
              <div className="mt-3 text-amber-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">View flights →</div>
            </button>
          ))}
        </div>
      </section>
      <section className="border-t border-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Our Fleet</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'SyberJet SJ30i', seats: 6, desc: 'Our flagship prestige jet. Ultra-long range with luxurious cabin.', badge: 'Prestige' },
              { name: 'Cirrus SF50', seats: 4, desc: 'Efficient single-engine jet perfect for short hops around NZ.', badge: 'Regional' },
              { name: 'HondaJet Elite', seats: 5, desc: 'Over-the-engine nacelle design reduces cabin noise for a smoother ride.', badge: 'Island Hopper' },
            ].map(a => (
              <div key={a.name} className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">🛩️</span>
                  <span className="bg-amber-400/10 text-amber-400 text-xs px-2 py-1 rounded-full border border-amber-400/30">{a.badge}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{a.name}</h3>
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

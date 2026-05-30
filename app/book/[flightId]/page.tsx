'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AIRPORTS: Record<string, string> = {
  NZNE: 'Auckland – Dairy Flat', YSSY: 'Sydney', NZRO: 'Rotorua',
  NZCI: 'Chatham Islands', NZGB: 'Great Barrier Island', NZTL: 'Lake Tekapo',
};

interface Flight {
  _id: string; flightNumber: string; from: string; to: string;
  aircraft: string; seats: number; seatsBooked: number;
  departureUTC: string; arrivalUTC: string; departureLocal: string; arrivalLocal: string;
  price: number; date: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function duration(dep: string, arr: string) {
  const mins = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;
  return `${Math.floor(mins/60)}h${mins%60>0?' '+(mins%60)+'m':''}`;
}

export default function BookPage({ params }: { params: Promise<{ flightId: string }> }) {
  const { flightId } = use(params);
  const router = useRouter();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [passengers, setPassengers] = useState(1);

  useEffect(() => {
    fetch(`/api/flights/${flightId}`)
      .then(r => r.json())
      .then(data => { setFlight(data.flight || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [flightId]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!flight) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: flight._id, passengerName: name, passengerEmail: email, passengers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Booking failed'); setSubmitting(false); return; }
      router.push(`/confirmation/${data.booking.bookingRef}`);
    } catch { setError('Something went wrong.'); setSubmitting(false); }
  }

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="text-slate-400 text-center"><div className="text-4xl mb-4 animate-bounce">✈️</div><p>Loading flight details…</p></div></div>;
  if (!flight) return <div className="text-center py-20"><p className="text-slate-400">Flight not found.</p><Link href="/search" className="text-amber-400 hover:underline mt-4 block">← Back to search</Link></div>;

  const available = flight.seats - flight.seatsBooked;
  const total = flight.price * passengers;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/search" className="text-slate-400 hover:text-amber-400 text-sm mb-6 inline-block transition-colors">← Back to search</Link>
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="font-semibold text-amber-400 mb-4 text-sm uppercase tracking-wider">Flight Details</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{flight.departureLocal}</div>
              <div className="text-sm text-slate-400 mt-1">{flight.from}</div>
              <div className="text-xs text-slate-500">{AIRPORTS[flight.from]}</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xs text-slate-500 mb-2">{duration(flight.departureUTC, flight.arrivalUTC)}</div>
              <div className="border-t border-slate-600 relative"><span className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400">✈</span></div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{flight.arrivalLocal}</div>
              <div className="text-sm text-slate-400 mt-1">{flight.to}</div>
              <div className="text-xs text-slate-500">{AIRPORTS[flight.to]}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm border-t border-slate-700 pt-4">
            <div className="flex justify-between"><span className="text-slate-400">Date</span><span>{formatDate(flight.departureUTC)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Flight</span><span>{flight.flightNumber}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Aircraft</span><span>{flight.aircraft}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Seats available</span><span className="text-green-400">{available}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Price per seat</span><span className="text-amber-400 font-semibold">NZD ${flight.price}</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between text-lg font-bold">
              <span>Total ({passengers} seat{passengers !== 1 ? 's' : ''})</span>
              <span className="text-amber-400">NZD ${total}</span>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="font-semibold text-amber-400 mb-4 text-sm uppercase tracking-wider">Passenger Details</h2>
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Smith"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email Address *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. jane@example.com"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors" />
              <p className="text-xs text-slate-500 mt-1">Used to retrieve your bookings later</p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Number of Passengers *</label>
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors">
                {Array.from({ length: available }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} passenger{n !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>}
            <button type="submit" disabled={submitting}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl transition-colors text-lg mt-2">
              {submitting ? 'Confirming…' : `Confirm Booking · NZD $${total}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

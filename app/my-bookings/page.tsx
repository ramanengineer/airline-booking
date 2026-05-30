'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Booking {
  _id: string; bookingRef: string; flightNumber: string; from: string; to: string;
  aircraft: string; departureUTC: string; arrivalUTC: string;
  departureLocal: string; arrivalLocal: string;
  passengerName: string; passengers: number; price: number; status: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function isPast(iso: string) { return new Date(iso) < new Date(); }

function BookingCard({ booking, showCancel = true }: { booking: Booking; showCancel?: boolean }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-amber-400 font-bold">{booking.bookingRef}</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{booking.flightNumber}</span>
          </div>
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span>{booking.from}</span><span className="text-amber-400">→</span><span>{booking.to}</span>
          </div>
          <div className="text-slate-400 text-sm mt-1">{formatDate(booking.departureUTC)} · {booking.departureLocal} – {booking.arrivalLocal}</div>
          <div className="text-slate-500 text-xs mt-1">{booking.aircraft} · {booking.passengers} passenger{booking.passengers !== 1 ? 's' : ''} · NZD ${booking.price}</div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/confirmation/${booking.bookingRef}`} className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg transition-colors">View</Link>
          {showCancel && !isPast(booking.departureUTC) && (
            <Link href={`/cancel/${booking.bookingRef}`} className="text-sm bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 px-3 py-2 rounded-lg transition-colors">Cancel</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setSearched(true); setError('');
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error); setBookings([]); } else setBookings(data.bookings || []);
    } catch { setError('Failed to fetch bookings'); }
    setLoading(false);
  }

  const upcoming = bookings.filter(b => !isPast(b.departureUTC));
  const past = bookings.filter(b => isPast(b.departureUTC));

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-slate-400 mb-8">Enter your email address to retrieve all your bookings.</p>
      <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-8">
        <div className="flex gap-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors" />
          <button type="submit" className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">Find Bookings</button>
        </div>
      </form>
      {loading && <div className="text-center py-12 text-slate-400"><div className="text-3xl mb-3 animate-bounce">✈️</div><p>Looking up your bookings…</p></div>}
      {!loading && searched && bookings.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-lg text-white font-semibold mb-2">No bookings found</p>
          <p>No confirmed bookings for <strong>{email}</strong></p>
          <Link href="/search" className="mt-4 inline-block text-amber-400 hover:underline">Search for flights →</Link>
        </div>
      )}
      {!loading && bookings.length > 0 && (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-amber-400 mb-3">Upcoming Flights ({upcoming.length})</h2>
              <div className="space-y-3">{upcoming.map(b => <BookingCard key={b._id} booking={b} />)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-400 mb-3">Past Flights ({past.length})</h2>
              <div className="space-y-3 opacity-60">{past.map(b => <BookingCard key={b._id} booking={b} showCancel={false} />)}</div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

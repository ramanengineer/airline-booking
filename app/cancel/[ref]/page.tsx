'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AIRPORTS: Record<string, string> = {
  NZNE: 'Auckland – Dairy Flat', YSSY: 'Sydney', NZRO: 'Rotorua',
  NZCI: 'Chatham Islands', NZGB: 'Great Barrier Island', NZTL: 'Lake Tekapo',
};

interface Booking {
  bookingRef: string; flightNumber: string; from: string; to: string;
  aircraft: string; departureUTC: string; arrivalUTC: string;
  departureLocal: string; arrivalLocal: string;
  passengerName: string; passengers: number; price: number; status: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CancelPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/bookings/${ref}`)
      .then(r => r.json())
      .then(data => { if (data.error) setError(data.error); else setBooking(data.booking); setLoading(false); });
  }, [ref]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${ref}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setCancelling(false); return; }
      setCancelled(true);
    } catch { setError('Failed to cancel booking'); setCancelling(false); }
  }

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="text-slate-400 text-center"><div className="text-4xl mb-4 animate-pulse">✈️</div><p>Loading booking…</p></div></div>;

  if (cancelled) return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Booking Cancelled</h1>
      <p className="text-slate-400 mb-2">Your booking <span className="font-mono text-amber-400">{ref}</span> has been cancelled.</p>
      <p className="text-slate-500 text-sm mb-8">The seats have been released back to availability.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/search" className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">Book Another Flight</Link>
        <Link href="/my-bookings" className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-6 py-3 rounded-xl transition-colors">My Bookings</Link>
      </div>
    </main>
  );

  if (error || !booking) return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="text-4xl mb-4">❌</div>
      <p className="text-red-400 mb-4">{error || 'Booking not found'}</p>
      <Link href="/my-bookings" className="text-amber-400 hover:underline">← My Bookings</Link>
    </main>
  );

  if (booking.status === 'cancelled') return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="text-4xl mb-4">ℹ️</div>
      <h1 className="text-2xl font-bold mb-2">Already Cancelled</h1>
      <p className="text-slate-400 mb-6">This booking has already been cancelled.</p>
      <Link href="/my-bookings" className="text-amber-400 hover:underline">← My Bookings</Link>
    </main>
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-red-400">Cancel Booking</h1>
      <div className="bg-slate-900 border border-red-900 rounded-2xl p-6 mb-6">
        <h2 className="text-sm uppercase text-slate-500 tracking-wider mb-4">You are about to cancel</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center"><div className="text-2xl font-bold">{booking.departureLocal}</div><div className="text-sm text-slate-400">{booking.from}</div></div>
          <div className="flex-1 text-center text-amber-400 text-xl">→</div>
          <div className="text-center"><div className="text-2xl font-bold">{booking.arrivalLocal}</div><div className="text-sm text-slate-400">{booking.to}</div></div>
        </div>
        <div className="space-y-2 text-sm border-t border-slate-700 pt-4">
          <div className="flex justify-between"><span className="text-slate-400">Date</span><span>{formatDate(booking.departureUTC)}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Passenger</span><span>{booking.passengerName}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Booking ref</span><span className="font-mono text-amber-400">{booking.bookingRef}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Total paid</span><span>NZD ${booking.price}</span></div>
        </div>
      </div>
      <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-6 text-sm text-amber-300">
        ⚠️ This action cannot be undone. Seats will be released back to availability.
      </div>
      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl p-3 mb-4 text-sm">{error}</div>}
      <div className="flex gap-3">
        <Link href={`/confirmation/${ref}`} className="flex-1 text-center bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold py-3 rounded-xl transition-colors">Keep Booking</Link>
        <button onClick={handleCancel} disabled={cancelling}
          className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
          {cancelling ? 'Cancelling…' : 'Yes, Cancel Booking'}
        </button>
      </div>
    </main>
  );
}

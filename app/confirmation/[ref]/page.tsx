'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';

const AIRPORTS: Record<string, string> = {
  NZNE: 'Auckland – Dairy Flat', YSSY: 'Sydney', NZRO: 'Rotorua',
  NZCI: 'Chatham Islands', NZGB: 'Great Barrier Island', NZTL: 'Lake Tekapo',
};

interface Booking {
  bookingRef: string; flightNumber: string; from: string; to: string;
  aircraft: string; departureUTC: string; arrivalUTC: string;
  departureLocal: string; arrivalLocal: string; date: string;
  passengerName: string; passengerEmail: string;
  passengers: number; price: number; pricePerSeat: number; status: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function duration(dep: string, arr: string) {
  const mins = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;
  return `${Math.floor(mins/60)}h${mins%60>0?' '+(mins%60)+'m':''}`;
}

export default function ConfirmationPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/bookings/${ref}`)
      .then(r => r.json())
      .then(data => { if (data.error) setError(data.error); else setBooking(data.booking); setLoading(false); });
  }, [ref]);

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="text-slate-400 text-center"><div className="text-4xl mb-4 animate-bounce">✈️</div><p>Loading your booking…</p></div></div>;
  if (error || !booking) return <div className="text-center py-20"><p className="text-red-400">Booking not found: {ref}</p></div>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Booking Confirmed!</h1>
        <p className="text-slate-400">Your booking reference is:</p>
        <div className="inline-block bg-amber-400/10 border border-amber-400/40 rounded-2xl px-8 py-4 mt-3">
          <span className="text-4xl font-mono font-bold text-amber-400 tracking-widest">{booking.bookingRef}</span>
        </div>
        <p className="text-slate-500 text-sm mt-3">Save this reference to manage your booking</p>
      </div>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6">
          <div className="flex justify-between items-center">
            <div><div className="text-amber-400 font-bold text-xl">✈ DairyFlat Air</div><div className="text-slate-400 text-sm mt-1">Boarding Pass & Receipt</div></div>
            <div className="text-right"><div className="font-mono text-lg font-bold">{booking.bookingRef}</div><div className="text-slate-400 text-xs mt-1">{booking.flightNumber}</div></div>
          </div>
        </div>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-6">
            <div className="text-center flex-1">
              <div className="text-4xl font-bold">{booking.departureLocal}</div>
              <div className="text-lg font-semibold mt-1">{booking.from}</div>
              <div className="text-slate-400 text-sm">{AIRPORTS[booking.from]}</div>
            </div>
            <div className="text-center px-4">
              <div className="text-slate-400 text-xs mb-2">{duration(booking.departureUTC, booking.arrivalUTC)}</div>
              <div className="text-amber-400 text-2xl">→</div>
              <div className="text-slate-500 text-xs mt-2">{booking.aircraft}</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-4xl font-bold">{booking.arrivalLocal}</div>
              <div className="text-lg font-semibold mt-1">{booking.to}</div>
              <div className="text-slate-400 text-sm">{AIRPORTS[booking.to]}</div>
            </div>
          </div>
          <div className="text-center mt-4 text-slate-400 text-sm">{formatDate(booking.departureUTC)}</div>
        </div>
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xs uppercase text-slate-500 tracking-wider mb-3">Passenger Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-semibold">{booking.passengerName}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Email</span><span>{booking.passengerEmail}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Passengers</span><span>{booking.passengers}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-green-400 font-semibold">✓ Confirmed</span></div>
          </div>
        </div>
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xs uppercase text-slate-500 tracking-wider mb-3">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Price per seat</span><span>NZD ${booking.pricePerSeat}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Passengers</span><span>× {booking.passengers}</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-slate-700 pt-2 mt-2">
              <span>Total Charged</span><span className="text-amber-400">NZD ${booking.price}</span>
            </div>
          </div>
        </div>
        <div className="p-6 flex gap-3 flex-col sm:flex-row">
          <Link href="/search" className="flex-1 text-center bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl transition-colors">Book Another Flight</Link>
          <Link href="/my-bookings" className="flex-1 text-center bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold py-3 rounded-xl transition-colors">My Bookings</Link>
          <Link href={`/cancel/${booking.bookingRef}`} className="flex-1 text-center bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 font-semibold py-3 rounded-xl transition-colors">Cancel Booking</Link>
        </div>
      </div>
    </main>
  );
}

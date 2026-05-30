import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'DF';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, passengerName, passengerEmail, passengers } = body;
    if (!flightId || !passengerName || !passengerEmail) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const count = passengers || 1;
    const client = await clientPromise;
    const db = client.db('airline');
    const flight = await db.collection('flights').findOne({ _id: new ObjectId(flightId) });
    if (!flight) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    if (flight.seats - flight.seatsBooked < count) return NextResponse.json({ error: 'Not enough seats available' }, { status: 400 });
    let bookingRef = generateRef();
    let exists = await db.collection('bookings').findOne({ bookingRef });
    while (exists) { bookingRef = generateRef(); exists = await db.collection('bookings').findOne({ bookingRef }); }
    const booking = {
      bookingRef, flightId: new ObjectId(flightId), flightNumber: flight.flightNumber,
      from: flight.from, to: flight.to, fromCity: flight.fromCity, toCity: flight.toCity,
      aircraft: flight.aircraft, departureUTC: flight.departureUTC, arrivalUTC: flight.arrivalUTC,
      departureLocal: flight.departureLocal, arrivalLocal: flight.arrivalLocal, date: flight.date,
      passengerName, passengerEmail: passengerEmail.toLowerCase(), passengers: count,
      price: flight.price * count, pricePerSeat: flight.price, status: 'confirmed', createdAt: new Date(),
    };
    await db.collection('bookings').insertOne(booking);
    await db.collection('flights').updateOne({ _id: new ObjectId(flightId) }, { $inc: { seatsBooked: count } });
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  try {
    const client = await clientPromise;
    const db = client.db('airline');
    const bookings = await db.collection('bookings').find({ passengerEmail: email.toLowerCase(), status: 'confirmed' }).sort({ departureUTC: 1 }).toArray();
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

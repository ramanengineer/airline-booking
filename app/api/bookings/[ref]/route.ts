import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  try {
    const client = await clientPromise;
    const db = client.db('airline');
    const booking = await db.collection('bookings').findOne({ bookingRef: ref });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  try {
    const client = await clientPromise;
    const db = client.db('airline');
    const booking = await db.collection('bookings').findOne({ bookingRef: ref, status: 'confirmed' });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    await db.collection('bookings').updateOne({ bookingRef: ref }, { $set: { status: 'cancelled', cancelledAt: new Date() } });
    await db.collection('flights').updateOne({ _id: new ObjectId(booking.flightId) }, { $inc: { seatsBooked: -booking.passengers } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}

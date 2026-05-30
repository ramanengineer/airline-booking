import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const client = await clientPromise;
    const db = client.db('airline');
    const flight = await db.collection('flights').findOne({ _id: new ObjectId(id) });
    if (!flight) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    return NextResponse.json({ flight });
  } catch {
    return NextResponse.json({ error: 'Invalid flight ID' }, { status: 400 });
  }
}

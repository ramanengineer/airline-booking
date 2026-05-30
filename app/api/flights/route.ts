import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  try {
    const client = await clientPromise;
    const db = client.db('airline');
    const query: Record<string, unknown> = {};
    if (from) query.from = from;
    if (to) query.to = to;
    if (date) query.date = date;
    const flights = await db.collection('flights').find(query).sort({ departureUTC: 1 }).limit(100).toArray();
    return NextResponse.json({ flights });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch flights' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const token = await getAuthCookie();

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userDeposits = await db.query.deposits.findMany({
      where: eq(deposits.userId, payload.userId),
      orderBy: desc(deposits.createdAt),
    });

    return NextResponse.json({
      transactions: userDeposits
    });

  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
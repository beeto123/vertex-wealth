import { NextResponse } from 'next/server';
import { db } from '@/db';
import { balances, users } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

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

    const balance = await db.query.balances.findFirst({
      where: eq(balances.userId, payload.userId),
    });

    if (!balance) {
      return NextResponse.json({
        currentBalance: "0",
        totalDeposited: "0",
        totalProfit: "0"
      });
    }

    return NextResponse.json(balance);

  } catch (error) {
    console.error('Balance error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
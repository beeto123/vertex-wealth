import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { withdrawals, balances } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { amount, walletAddress } = await request.json();

    const balance = await db.query.balances.findFirst({
      where: eq(balances.userId, payload.userId),
    });

    if (!balance || parseFloat(balance.currentBalance ?? '0') < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    await db.insert(withdrawals).values({
      userId: payload.userId,
      amount: amount.toString(),
      walletAddress,
      status: 'pending',
    });

    return NextResponse.json({ success: true, message: 'Withdrawal requested' });

  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

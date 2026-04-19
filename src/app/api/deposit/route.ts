import { NextResponse } from 'next/server';
import { db } from '@/db';
import { balances } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Single source of truth: Use balances table
    const balanceRecord = await db.query.balances.findFirst({
      where: eq(balances.userId, payload.userId),
    });

    if (!balanceRecord) {
      return NextResponse.json({
        currentBalance: "0.00",
        totalDeposited: "0.00",
        totalWithdrawn: "0.00",
        totalInterestEarned: "0.00"
      });
    }

    return NextResponse.json({
      currentBalance: balanceRecord.currentBalance?.toString() || "0.00",
      totalDeposited: balanceRecord.totalDeposited?.toString() || "0.00",
      totalWithdrawn: balanceRecord.totalWithdrawn?.toString() || "0.00",
      totalInterestEarned: balanceRecord.totalInterestEarned?.toString() || "0.00"
    });

  } catch (error) {
    console.error('Balance error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

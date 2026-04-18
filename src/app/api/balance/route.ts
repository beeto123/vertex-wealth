import { NextResponse } from 'next/server';
import { db } from '@/db';
import { balances, users, deposits } from '@/db/schema';
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

    // Calculate balance from CONFIRMED deposits only
    const confirmedDeposits = await db.select().from(deposits)
      .where(eq(deposits.userId, payload.userId))
      .where(eq(deposits.status, 'confirmed'));

    const totalConfirmed = confirmedDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);

    // Get existing balance record or create one
    let balance = await db.query.balances.findFirst({
      where: eq(balances.userId, payload.userId),
    });

    if (!balance) {
      return NextResponse.json({
        currentBalance: totalConfirmed.toString(),
        totalDeposited: totalConfirmed.toString(),
        totalWithdrawn: "0",
        totalInterestEarned: "0"
      });
    }

    // Return the calculated balance (not the stored one)
    return NextResponse.json({
      currentBalance: totalConfirmed.toString(),
      totalDeposited: totalConfirmed.toString(),
      totalWithdrawn: balance.totalWithdrawn || "0",
      totalInterestEarned: balance.totalInterestEarned || "0"
    });

  } catch (error) {
    console.error('Balance error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

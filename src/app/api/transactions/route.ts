import { NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits, withdrawals, interestTransactions } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = payload.userId;

    const [userDeposits, userWithdrawals, userInterests] = await Promise.all([
      db.query.deposits.findMany({
        where: eq(deposits.userId, userId),
        orderBy: desc(deposits.createdAt),
      }),
      db.query.withdrawals.findMany({
        where: eq(withdrawals.userId, userId),
        orderBy: desc(withdrawals.requestedAt),
      }),
      db.query.interestTransactions.findMany({
        where: eq(interestTransactions.userId, userId),
        orderBy: desc(interestTransactions.creditedAt),
      })
    ]);

    const transactions = [
      // Deposits
      ...userDeposits.map(d => ({
        ...d,
        type: 'deposit',
        amount: d.amount,
        status: d.status || 'confirmed',
        date: d.createdAt || d.confirmedAt
      })),
      // Withdrawals
      ...userWithdrawals.map(w => ({
        ...w,
        type: 'withdrawal',
        amount: w.amount,
        status: w.status || 'pending',
        date: w.requestedAt || w.processedAt
      })),
      // Interest
      ...userInterests.map(i => ({
        ...i,
        type: 'interest',
        amount: i.interestAmount,
        status: 'confirmed',
        date: i.creditedAt
      }))
    ].sort((a, b) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );

    return NextResponse.json({ transactions });

  } catch (error: any) {
    console.error('Transactions Error:', error);
    return NextResponse.json({ 
      error: 'Failed to load history',
      message: error.message 
    }, { status: 500 });
  }
}
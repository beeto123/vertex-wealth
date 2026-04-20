import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { withdrawals, users, balances } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { sendWithdrawalApproved } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const admin = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
    if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { withdrawalId } = await request.json();

    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, withdrawalId),
    });

    if (!withdrawal || !withdrawal.userId) {
      return NextResponse.json({ error: 'Invalid withdrawal' }, { status: 400 });
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid withdrawal' }, { status: 400 });
    }

    const balance = await db.query.balances.findFirst({
      where: eq(balances.userId, withdrawal.userId),
    });

    if (balance) {
      const newBalance = parseFloat(balance.currentBalance ?? '0') - parseFloat(withdrawal.amount ?? '0');
      const newTotalWithdrawn = parseFloat(balance.totalWithdrawn ?? '0') + parseFloat(withdrawal.amount ?? '0');

      await db.update(balances)
        .set({
          currentBalance: newBalance.toString(),
          totalWithdrawn: newTotalWithdrawn.toString(),
        })
        .where(eq(balances.userId, withdrawal.userId));
    }

    await db.update(withdrawals)
      .set({ status: 'approved', processedAt: new Date() })
      .where(eq(withdrawals.id, withdrawalId));

    const user = await db.query.users.findFirst({
      where: eq(users.id, withdrawal.userId),
    });

    if (user?.email) {
      await sendWithdrawalApproved(
        user.email,
        withdrawal.amount.toString(),
        user.fullName ?? '',
        withdrawal.walletAddress ?? 'N/A'
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Approve withdrawal error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

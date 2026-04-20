import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { withdrawals, users } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { sendWithdrawalRejected } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const admin = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
    if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { withdrawalId, reason } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, withdrawalId),
    });

    if (!withdrawal || !withdrawal.userId) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    await db.update(withdrawals)
      .set({ status: 'rejected', adminMessage: reason, processedAt: new Date() })
      .where(eq(withdrawals.id, withdrawalId));

    const user = await db.query.users.findFirst({
      where: eq(users.id, withdrawal.userId),
    });

    if (user?.email) {
      await sendWithdrawalRejected(
        user.email,
        withdrawal.amount.toString(),
        user.fullName ?? '',
        reason
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Reject withdrawal error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

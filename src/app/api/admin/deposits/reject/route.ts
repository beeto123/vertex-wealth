import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits, users } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { sendDepositRejected } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const admin = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
    if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { depositId, reason } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const deposit = await db.query.deposits.findFirst({
      where: eq(deposits.id, depositId),
    });

    if (!deposit || !deposit.userId) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    await db.update(deposits)
      .set({ status: 'rejected', adminNote: reason })
      .where(eq(deposits.id, depositId));

    const user = await db.query.users.findFirst({
      where: eq(users.id, deposit.userId),
    });

    if (user?.email) {
      await sendDepositRejected(user.email, deposit.amount.toString(), user.fullName ?? '', reason);
    }

    return NextResponse.json({ success: true, message: 'Deposit rejected' });

  } catch (error) {
    console.error('Reject deposit error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

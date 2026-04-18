import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits, users, balances } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { sendDepositApproved } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const admin = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { depositId } = await request.json();

    const deposit = await db.query.deposits.findFirst({
      where: eq(deposits.id, depositId),
    });

    // FIXED: Proper null check to prevent TypeScript error
    if (!deposit || !deposit.userId) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    if (deposit.status !== 'pending') {
      return NextResponse.json({ error: 'Deposit already processed' }, { status: 400 });
    }

    // Update deposit status
    await db.update(deposits)
      .set({ status: 'confirmed', confirmedAt: new Date() })
      .where(eq(deposits.id, depositId));

    // Update user balance - Now safe
    const balance = await db.query.balances.findFirst({
      where: eq(balances.userId, deposit.userId),
    });

    if (balance) {
      const newBalance = parseFloat(balance.currentBalance) + parseFloat(deposit.amount);
      const newTotalDeposited = parseFloat(balance.totalDeposited) + parseFloat(deposit.amount);

      await db.update(balances)
        .set({
          currentBalance: newBalance.toString(),
          totalDeposited: newTotalDeposited.toString(),
        })
        .where(eq(balances.userId, deposit.userId));
    }

    // Send success email
    const user = await db.query.users.findFirst({
      where: eq(users.id, deposit.userId),
    });

    if (user?.email) {
      await sendDepositApproved(user.email, deposit.amount.toString(), user.fullName);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Deposit approved successfully' 
    });

  } catch (error) {
    console.error('Approve deposit error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
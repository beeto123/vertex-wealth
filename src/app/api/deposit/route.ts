import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits, balances } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { sendDepositPending } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { amount, transactionHash, walletAddress } = await request.json();

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create deposit record
    const [newDeposit] = await db.insert(deposits).values({
      userId: payload.userId,
      amount: amount.toString(),
      transactionHash,
      walletAddress,
      status: 'pending',
    }).returning();

    // Update user balance - FIXED with null check
    if (payload.userId) {
      const balance = await db.query.balances.findFirst({
        where: eq(balances.userId, payload.userId),
      });

      if (balance) {
        const newBalance = parseFloat(balance.currentBalance) + parseFloat(amount);
        const newTotalDeposited = parseFloat(balance.totalDeposited) + parseFloat(amount);

        await db.update(balances)
          .set({
            currentBalance: newBalance.toString(),
            totalDeposited: newTotalDeposited.toString(),
          })
          .where(eq(balances.userId, payload.userId));
      }
    }

    // Send confirmation email
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (user?.email) {
      await sendDepositPending(user.email, amount.toString(), user.fullName);
    }

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted successfully',
      deposit: newDeposit
    });

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong' 
    }, { status: 500 });
  }
}
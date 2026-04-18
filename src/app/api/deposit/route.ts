import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits, balances } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { amount, transactionHash } = await request.json();

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!transactionHash) {
      return NextResponse.json({ error: 'Transaction hash required' }, { status: 400 });
    }

    // Check for duplicate transaction hash
    const existingDeposit = await db.query.deposits.findFirst({
      where: eq(deposits.txHash, transactionHash),
    });

    if (existingDeposit) {
      return NextResponse.json({ error: 'Transaction hash already submitted' }, { status: 400 });
    }

    // Create deposit record with status 'pending' — NO balance update here!
    const [newDeposit] = await db.insert(deposits).values({
      userId: payload.userId,
      amount: amount.toString(),
      txHash: transactionHash,
      status: 'pending',
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted successfully. Awaiting admin approval.',
      deposit: newDeposit
    });

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

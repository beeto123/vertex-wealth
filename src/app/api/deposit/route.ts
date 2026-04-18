import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, txHash } = body;

    // Validation
    if (!amount || amount < 500) {
      return NextResponse.json(
        { error: 'Minimum deposit is $500' },
        { status: 400 }
      );
    }

    if (!txHash || txHash.length < 10) {
      return NextResponse.json(
        { error: 'Valid transaction hash is required' },
        { status: 400 }
      );
    }

    // Create deposit record
    await db.insert(deposits).values({
      userId: payload.userId,
      amount: amount.toString(),
      txHash,
      network: 'TRC-20',
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted for verification',
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
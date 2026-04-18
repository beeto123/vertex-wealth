import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, balances } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
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

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get balance
    const balance = await db.query.balances.findFirst({
      where: eq(balances.userId, payload.userId),
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      },
      balance: balance || {
        currentBalance: '0.00',
        totalDeposited: '0.00',
        totalWithdrawn: '0.00',
        totalInterestEarned: '0.00',
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
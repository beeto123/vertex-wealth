import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, balances, interestTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const activeUsers = await db.select({
      id: users.id,
      fullName: users.fullName,
      interestRate: users.interestRate,
    }).from(users).where(eq(users.status, 'active'));

    let processed = 0;

    for (const user of activeUsers) {
      const userBalance = await db.query.balances.findFirst({
        where: eq(balances.userId, user.id),
      });

      if (!userBalance || parseFloat(userBalance.currentBalance ?? '0') < 500) continue;

      const currentBalance = parseFloat(userBalance.currentBalance ?? '0');
      const rate = parseFloat(user.interestRate ?? '11') / 100;
      const interest = currentBalance * rate;

      await db.update(balances)
        .set({
          currentBalance: (currentBalance + interest).toFixed(2),
          totalInterestEarned: (parseFloat(userBalance.totalInterestEarned ?? '0') + interest).toFixed(2),
        })
        .where(eq(balances.userId, user.id));

      await db.insert(interestTransactions).values({
        userId: user.id,
        baseAmount: currentBalance.toFixed(2),
        interestAmount: interest.toFixed(2),
        rateApplied: user.interestRate ?? '11',
        creditedAt: new Date(),
      });

      processed++;
    }

    return NextResponse.json({
      success: true,
      processed,
      message: `Interest added to ${processed} investors`
    });

  } catch (error: unknown) {
    console.error("Interest Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

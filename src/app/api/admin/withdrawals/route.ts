import { NextResponse } from 'next/server';
import { db } from '@/db';
import { withdrawals, users } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allWithdrawals = await db.select().from(withdrawals).orderBy(desc(withdrawals.requestedAt));
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    const withdrawalsWithUsers = allWithdrawals.map(w => ({
      ...w,
      user: userMap.get(w.userId) || null
    }));

    return NextResponse.json({ withdrawals: withdrawalsWithUsers });
  } catch (error) {
    console.error('Admin withdrawals error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
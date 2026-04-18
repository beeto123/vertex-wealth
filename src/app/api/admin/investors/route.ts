import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, balances } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const admin = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
    if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const allUsers = await db.select().from(users).where(eq(users.isAdmin, false));
    const allBalances = await db.select().from(balances);
    const balanceMap = new Map(allBalances.map(b => [b.userId, b]));

    const investorsWithBalance = allUsers.map(u => ({
      ...u,
      balance: balanceMap.get(u.id) || null
    }));

    return NextResponse.json({ investors: investorsWithBalance });
  } catch (error) {
    console.error('Investors error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
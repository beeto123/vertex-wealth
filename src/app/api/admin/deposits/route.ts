import { NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits, users } from '@/db/schema';
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
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Get all deposits
    const allDeposits = await db.select().from(deposits).orderBy(desc(deposits.createdAt));

    // Get all users and map them
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    // Attach user data manually
    const depositsWithUsers = allDeposits.map(d => ({
      ...d,
      user: userMap.get(d.userId) || null
    }));

    return NextResponse.json({ deposits: depositsWithUsers });
  } catch (error) {
    console.error('Admin deposits error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
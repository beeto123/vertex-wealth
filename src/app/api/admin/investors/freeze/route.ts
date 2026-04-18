import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const admin = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
    if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, status } = await request.json();

    await db.update(users).set({ status }).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Verify admin from database instead of token
    const admin = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allUsers = await db.query.users.findMany();

    return NextResponse.json({ users: allUsers });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

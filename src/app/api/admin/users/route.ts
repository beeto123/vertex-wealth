import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';

export async function GET() {
  try {
    const token = await getAuthCookie();

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allUsers = await db.query.users.findMany();

    return NextResponse.json({
      users: allUsers
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
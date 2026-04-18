import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { systemSettings, users } from '@/db/schema';
import { verifyToken, getAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  const token = await getAuthCookie();
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const admin = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
  if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const settings = await db.query.systemSettings.findMany();
  return NextResponse.json({ settings: Object.fromEntries(settings.map(s => [s.key, s.value])) });
}

export async function POST(request: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const admin = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
  if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { key, value } = await request.json();
  
  await db.insert(systemSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: systemSettings.key, set: { value, updatedAt: new Date() } });

  return NextResponse.json({ success: true });
}
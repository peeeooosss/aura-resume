import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { getInitialCredits } from '@/lib/constants/credits';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ available: false, error: 'Username must be 3-20 characters, letters, numbers, and underscores only' });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    return NextResponse.json({ available: !existing });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const { name, username } = await req.json();

    if (!name || !username) {
      return NextResponse.json({ error: 'Name and username are required' }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: 'Username must be 3-20 characters, letters, numbers, and underscores only' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        username,
        onboarded: true,
      },
    });

    const existingBalance = await prisma.creditBalance.findUnique({
      where: { userId: user.id },
    });

    if (!existingBalance) {
      await prisma.creditBalance.create({
        data: {
          userId: user.id,
          balance: getInitialCredits('free'),
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id, username: user.username });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

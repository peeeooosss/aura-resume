import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getInitialCredits } from '@/lib/constants/credits';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, username } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: 'Username must be 3-20 characters, letters, numbers, and underscores only' }, { status: 400 });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    const passwordHash = await bcrypt.hash(password, 12);

    if (existingEmail) {
      if (existingEmail.passwordHash) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      if (existingUsername && existingUsername.id !== existingEmail.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }

      const user = await prisma.user.update({
        where: { id: existingEmail.id },
        data: {
          name: name || existingEmail.name || username,
          username,
          passwordHash,
          onboarded: true,
        },
      });

      await prisma.creditBalance.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          balance: getInitialCredits('free'),
        },
      });

      return NextResponse.json({ userId: user.id, email: user.email, username: user.username });
    }

    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || username,
        username,
        passwordHash,
        onboarded: true,
      },
    });

    await prisma.creditBalance.create({
      data: {
        userId: user.id,
        balance: getInitialCredits('free'),
      },
    });

    return NextResponse.json({ userId: user.id, email: user.email, username: user.username });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireSessionUserId();
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: params.id, userId },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();

    const existing = await prisma.portfolio.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const { title, slug, template, theme, data, description, isPublished } = body;

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.portfolio.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
      }
    }

    const portfolio = await prisma.portfolio.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(template !== undefined && { template }),
        ...(theme !== undefined && { theme }),
        ...(data !== undefined && { data }),
        ...(description !== undefined && { description }),
        ...(isPublished !== undefined && {
          isPublished,
          publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
        }),
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Update portfolio error:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireSessionUserId();

    const existing = await prisma.portfolio.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    await prisma.portfolio.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}

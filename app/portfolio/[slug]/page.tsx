import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PortfolioPublicView } from '@/components/dashboard/portfolio/PortfolioPublicView';

export default async function PublicPortfolioPage({
  params,
}: {
  params: { slug: string };
}) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: { user: { select: { name: true, email: true, image: true } } },
  });

  if (!portfolio) {
    notFound();
  }

  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { views: { increment: 1 } },
  });

  return (
    <PortfolioPublicView
      portfolio={{
        title: portfolio.title,
        slug: portfolio.slug,
        template: portfolio.template || 'modern',
        theme: portfolio.theme as any,
        data: portfolio.data as any,
        views: portfolio.views + 1,
        userName: portfolio.user.name || 'Anonymous',
      }}
    />
  );
}

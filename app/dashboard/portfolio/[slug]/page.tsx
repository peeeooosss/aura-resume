import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PortfolioPreview } from '@/components/dashboard/portfolio/PortfolioPreview';

export default function PortfolioPreviewPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <DashboardLayout>
      <PortfolioPreview slug={params.slug} />
    </DashboardLayout>
  );
}

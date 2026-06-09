import { useEffect } from 'react';
import { APP_NAME } from '@/lib/constants';
import { AnimatedHero } from '@/components/home/AnimatedHero';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { FlashDealsSection } from '@/components/home/FlashDealsSection';
import { AIRecommendationsStrip } from '@/components/home/AIRecommendationsStrip';
import { TrendingStats } from '@/components/home/TrendingStats';
import { CategoryBanners } from '@/components/home/CategoryBanners';
import { NewArrivals } from '@/components/home/NewArrivals';
import { NewsletterPromo } from '@/components/home/NewsletterPromo';

export default function HomePage() {
  useEffect(() => {
    document.title = `${APP_NAME} — Shop Premium. Shop Smart.`;
  }, []);

  return (
    <>
      <AnimatedHero />
      <CategoryStrip />
      <FlashDealsSection />
      <AIRecommendationsStrip />
      <TrendingStats />
      <CategoryBanners />
      <NewArrivals />
      <NewsletterPromo />
    </>
  );
}

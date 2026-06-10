import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useUIStore } from '@/stores/uiStore';
import { GradientOrbs } from '@/components/common/GradientOrbs';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const openSearch = useUIStore((s) => s.setSearchOpen);

  useEffect(() => {
    document.title = `Page not found · ${APP_NAME}`;
  }, []);

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      <GradientOrbs />
      <div className="container relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-display text-[96px] font-bold leading-none text-gradient-gold md:text-[140px]"
        >
          404
        </motion.h1>
        <h2 className="mt-2 font-display text-xl font-semibold text-foreground">Oops! Page not found</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          The page you're looking for doesn't exist or may have moved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg"><Link to="/"><Home /> Go to Homepage</Link></Button>
          <Button size="lg" variant="outline" onClick={() => navigate(-1)}><ArrowLeft /> Go Back</Button>
          <Button size="lg" variant="ghost" onClick={() => openSearch(true)}><Search /> Search</Button>
        </div>
      </div>
    </section>
  );
}

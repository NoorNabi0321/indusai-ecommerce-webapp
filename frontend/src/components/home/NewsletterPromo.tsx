import { useState } from 'react';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

export function NewsletterPromo() {
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    toast.success('Thanks for subscribing! Your 10% code is on its way.');
    setEmail('');
  }

  return (
    <section className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass relative overflow-hidden rounded-3xl px-6 py-12 text-center"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold-base/20 blur-3xl" />
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-gold-base/10 text-gold-base">
          <MailCheck className="size-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Get 10% off your first order</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Join our newsletter for exclusive deals, AI picks, and new arrivals.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="h-11 flex-1 rounded-md border border-input bg-bg-base px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold-dim focus:ring-2 focus:ring-ring/30"
          />
          <Button type="submit" size="lg">Subscribe</Button>
        </form>
      </motion.div>
    </section>
  );
}

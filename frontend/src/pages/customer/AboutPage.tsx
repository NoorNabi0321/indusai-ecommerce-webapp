import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Truck, HeartHandshake, Mail, Phone, MapPin } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useCountUp } from '@/hooks/useCountUp';
import { GradientOrbs } from '@/components/common/GradientOrbs';
import { Button } from '@/components/ui/button';

const STATS = [
  { value: 12000, suffix: '+', label: 'Orders Delivered' },
  { value: 8500, suffix: '+', label: 'Happy Customers' },
  { value: 500, suffix: '+', label: 'Products' },
  { value: 40, suffix: '+', label: 'Cities Served' },
];

const VALUES = [
  { icon: Sparkles, title: 'AI-Powered', text: 'Smart recommendations and search tailored to you.' },
  { icon: ShieldCheck, title: 'Authentic & Secure', text: 'Genuine products and encrypted, safe payments.' },
  { icon: Truck, title: 'Fast Delivery', text: 'Quick, reliable shipping across Pakistan with COD.' },
];

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, value: current } = useCountUp(value);
  return (
    <div className="text-center">
      <span ref={ref} className="font-display text-3xl font-bold text-gradient-gold tabular-nums">
        {current.toLocaleString('en-PK')}{suffix}
      </span>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  useEffect(() => {
    document.title = `About · ${APP_NAME}`;
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <GradientOrbs />
        <div className="container relative z-10 py-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground md:text-4xl"
          >
            Premium shopping, <span className="text-gradient-gold">powered by AI</span>
          </motion.h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            IndusAI Technology brings shirts, shoes, jewellery and electronics together with
            intelligent recommendations, local payments and fast delivery — built for Pakistan.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-bg-surface p-8">
          <div className="mb-3 inline-flex items-center gap-2 text-gold-base">
            <HeartHandshake className="size-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Our Mission</span>
          </div>
          <p className="text-md leading-relaxed text-muted-foreground">
            We're on a mission to make premium online shopping effortless and personal. By combining a
            curated catalogue with AI that understands what you're looking for, we help you discover the
            right products faster — and get them delivered with the payment methods you already trust.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-bg-surface/50 py-12">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => <Stat key={s.label} {...s} />)}
        </div>
      </section>

      {/* Values */}
      <section className="container py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">What we stand for</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-bg-surface p-6 text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-gold-base/10 text-gold-base">
                <v.icon className="size-6" />
              </div>
              <h3 className="font-display text-md font-semibold text-foreground">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="container pb-20">
        <div className="grid gap-4 rounded-2xl border border-border bg-bg-surface p-8 sm:grid-cols-3">
          <a href="mailto:support@indusai.pk" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
            <Mail className="size-5 text-gold-base" /> support@indusai.pk
          </a>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone className="size-5 text-gold-base" /> +92 300 0000000
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="size-5 text-gold-base" /> Karachi, Pakistan
          </div>
        </div>
        <div className="mt-8 text-center">
          <Button asChild size="lg"><Link to="/shop/shirts">Explore the store</Link></Button>
        </div>
      </section>
    </div>
  );
}

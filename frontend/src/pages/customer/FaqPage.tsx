import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface FaqItem {
  q: string;
  a: string;
}
const FAQ: { category: string; items: FaqItem[] }[] = [
  {
    category: 'Orders & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days; Express is 1–2 business days. You can track your order any time from your account.' },
      { q: 'Do you offer Cash on Delivery?', a: 'Yes. COD is available across Pakistan. Please keep the exact amount ready for the courier.' },
      { q: 'How can I track my order?', a: 'Go to Account → Orders and open your order to see a live status timeline.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'Which payment methods are accepted?', a: 'We support Cash on Delivery, credit/debit cards (Stripe), JazzCash and Easypaisa.' },
      { q: 'Are my payment details secure?', a: 'Absolutely. Payments are processed over 256-bit SSL and we never store your full card details.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'You can request a return within 7 days of delivery for eligible items. Start a request from your order details page.' },
      { q: 'How long do refunds take?', a: 'Refunds are processed within 5–7 business days to your original payment method or as store credit.' },
    ],
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I reset my password?', a: 'On the sign-in page, click “Forgot password?” and follow the emailed code to set a new password.' },
      { q: 'Can I change my email address?', a: 'Your email is fixed for security. Contact support if you need it changed.' },
    ],
  },
];

export default function FaqPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    document.title = `FAQ · ${APP_NAME}`;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.map((group) => ({
      ...group,
      items: group.items.filter((it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-center font-display text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
      <p className="mt-2 text-center text-muted-foreground">Find quick answers to common questions.</p>

      <div className="relative mx-auto mt-6 max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="h-11 w-full rounded-md border border-input bg-bg-surface pl-9 pr-3 text-sm text-foreground outline-none focus:border-gold-dim"
        />
      </div>

      <div className="mt-8 space-y-8">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No results. Try different keywords.</p>
        ) : (
          filtered.map((group) => (
            <div key={group.category}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-base">{group.category}</h2>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg-surface">
                {group.items.map((it) => {
                  const id = `${group.category}:${it.q}`;
                  const isOpen = open === id;
                  return (
                    <div key={id}>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : id)}
                        className="flex w-full items-center justify-between gap-4 p-4 text-left"
                      >
                        <span className="text-sm font-medium text-foreground">{it.q}</span>
                        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 text-sm text-muted-foreground">{it.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-bg-surface p-8 text-center">
        <MessageCircleQuestion className="mx-auto mb-3 size-10 text-gold-base" />
        <h2 className="font-display text-lg font-semibold text-foreground">Still need help?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Our support team is here for you.</p>
        <Button asChild className="mt-4"><Link to="/support">Contact Support</Link></Button>
      </div>
    </div>
  );
}

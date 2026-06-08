import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { FOOTER_LINKS } from '@/lib/nav';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-bg-surface">
      <div className="container grid grid-cols-1 gap-10 py-14 md:grid-cols-3">
        {/* Col 1 — brand */}
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Premium shopping, powered by AI. Shirts, shoes, jewellery & electronics —
            delivered across Pakistan.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-gold-dim hover:text-gold-base"
                aria-label="Social link"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — quick links */}
        <div className="grid grid-cols-2 gap-8">
          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
          <FooterColumn title="Company" links={FOOTER_LINKS.company} />
        </div>

        {/* Col 3 — contact + newsletter */}
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Stay in the loop</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get 10% off your first order.
          </p>
          <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email"
              className="h-10 flex-1 rounded-md border border-input bg-bg-base px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold-dim focus:ring-2 focus:ring-ring/40"
            />
            <Button type="submit" size="sm">
              Subscribe
            </Button>
          </form>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4" /> support@indusai.pk
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" /> +92 300 0000000
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/faq" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/faq" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; to: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-sm text-muted-foreground hover:text-gold-base">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

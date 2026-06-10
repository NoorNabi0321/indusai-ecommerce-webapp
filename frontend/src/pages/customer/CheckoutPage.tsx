import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin, Plus, CreditCard, Wallet, Banknote, Truck, Zap, Lock, Pencil,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import type { PaymentMethod } from '@/types/order.types';
import type { Address } from '@/types/user.types';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cartStore';
import { getAddresses } from '@/lib/api/account.api';
import { createOrder } from '@/lib/api/order.api';
import { computeShipping } from '@/components/cart/OrderSummary';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { AddressForm } from '@/components/account/AddressForm';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

const STEPS = ['Delivery', 'Payment', 'Review'];
const EXPRESS_FEE = 500;

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard; note: string }[] = [
  { id: 'COD', label: 'Cash on Delivery', icon: Banknote, note: 'Pay with cash when your order arrives.' },
  { id: 'STRIPE', label: 'Credit / Debit Card', icon: CreditCard, note: 'Visa, Mastercard — secured by Stripe.' },
  { id: 'JAZZCASH', label: 'JazzCash', icon: Wallet, note: 'Pay from your JazzCash wallet.' },
  { id: 'EASYPAISA', label: 'Easypaisa', icon: Wallet, note: 'Pay from your Easypaisa wallet.' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const clearGuest = useCartStore((s) => s.clearGuest);
  const { items, count, subtotal } = useCart();

  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('COD');
  const [walletPhone, setWalletPhone] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    document.title = `Checkout · ${APP_NAME}`;
  }, []);

  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });

  // Default-select the default (or first) address.
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId((addresses.find((a) => a.isDefault) ?? addresses[0]).id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses?.find((a) => a.id === selectedAddressId) ?? null;
  const deliveryFee = deliveryType === 'express' ? EXPRESS_FEE : computeShipping(subtotal);
  const total = subtotal + deliveryFee;

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      clearGuest();
      void qc.invalidateQueries({ queryKey: ['cart'] });
      navigate(`/order-confirmation/${order.id}`, { replace: true });
    },
    onError: (e) => toast.error(getApiError(e).message),
  });

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground">Add items before checking out.</p>
        <Button asChild><Link to="/shop/shirts">Start Shopping</Link></Button>
      </div>
    );
  }

  function placeOrder() {
    if (!agree) return toast.error('Please accept the terms to place your order.');
    if (!selectedAddressId) return toast.error('Please select a delivery address.');
    orderMutation.mutate({
      addressId: selectedAddressId,
      deliveryType,
      paymentMethod: payment,
    });
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <CheckoutStepper steps={STEPS} current={step} />

          {/* ───────────── Step 1: Delivery ───────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-md font-semibold text-foreground">Delivery Address</h2>
                  {!addingAddress && (
                    <Button size="sm" variant="ghost" onClick={() => setAddingAddress(true)}>
                      <Plus className="size-4" /> Add new
                    </Button>
                  )}
                </div>

                {addingAddress ? (
                  <AddressForm
                    onCancel={() => setAddingAddress(false)}
                    onSaved={(addr) => {
                      setAddingAddress(false);
                      setSelectedAddressId(addr.id);
                    }}
                  />
                ) : !addresses || addresses.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
                    <MapPin className="size-9 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No saved address. Add one to continue.</p>
                    <Button onClick={() => setAddingAddress(true)}><Plus className="size-4" /> Add address</Button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <AddressRadio
                        key={addr.id}
                        addr={addr}
                        selected={selectedAddressId === addr.id}
                        onSelect={() => setSelectedAddressId(addr.id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-3 font-display text-md font-semibold text-foreground">Delivery Method</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DeliveryOption
                    icon={Truck}
                    title="Standard"
                    desc="3–5 business days"
                    price={computeShipping(subtotal)}
                    selected={deliveryType === 'standard'}
                    onSelect={() => setDeliveryType('standard')}
                  />
                  <DeliveryOption
                    icon={Zap}
                    title="Express"
                    desc="1–2 business days"
                    price={EXPRESS_FEE}
                    selected={deliveryType === 'express'}
                    onSelect={() => setDeliveryType('express')}
                  />
                </div>
              </section>

              <div className="flex justify-end">
                <Button size="lg" disabled={!selectedAddress} onClick={() => setStep(2)}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* ───────────── Step 2: Payment ───────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <section>
                <h2 className="mb-3 font-display text-md font-semibold text-foreground">Payment Method</h2>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayment(m.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                        payment === m.id ? 'border-gold-base bg-gold-base/5' : 'border-border hover:border-bg-overlay',
                      )}
                    >
                      <span className={cn('grid size-9 place-items-center rounded-md bg-bg-elevated', payment === m.id ? 'text-gold-base' : 'text-muted-foreground')}>
                        <m.icon className="size-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-foreground">{m.label}</span>
                        <span className="text-xs text-muted-foreground">{m.note}</span>
                      </span>
                      <span className={cn('size-4 rounded-full border', payment === m.id ? 'border-4 border-gold-base' : 'border-border')} />
                    </button>
                  ))}
                </div>
              </section>

              {/* Method-specific fields (visual; real processing in Phase 10) */}
              {payment === 'STRIPE' && (
                <section className="grid gap-3 rounded-xl border border-border bg-bg-surface p-4 sm:grid-cols-2">
                  <Field label="Card Number" value={card.number} onChange={(v) => setCard({ ...card, number: v })} placeholder="4242 4242 4242 4242" className="sm:col-span-2" />
                  <Field label="Expiry" value={card.expiry} onChange={(v) => setCard({ ...card, expiry: v })} placeholder="MM/YY" />
                  <Field label="CVV" value={card.cvv} onChange={(v) => setCard({ ...card, cvv: v })} placeholder="123" />
                  <Field label="Cardholder Name" value={card.name} onChange={(v) => setCard({ ...card, name: v })} placeholder="Noor Nabi" className="sm:col-span-2" />
                </section>
              )}
              {(payment === 'JAZZCASH' || payment === 'EASYPAISA') && (
                <section className="rounded-xl border border-border bg-bg-surface p-4">
                  <Field label="Mobile Account Number" value={walletPhone} onChange={setWalletPhone} placeholder="+92 300 0000000" />
                  <p className="mt-2 text-xs text-muted-foreground">You'll confirm the payment via an OTP at the next step.</p>
                </section>
              )}
              {payment === 'COD' && (
                <section className="rounded-xl border border-border bg-bg-surface p-4 text-sm text-muted-foreground">
                  Pay in cash when your order is delivered. Please keep the exact amount ready.
                </section>
              )}

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" /> 256-bit SSL encrypted — your details are safe.
              </p>

              <div className="flex justify-between">
                <Button size="lg" variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" onClick={() => setStep(3)}>Review Order</Button>
              </div>
            </div>
          )}

          {/* ───────────── Step 3: Review ───────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <ReviewBlock title="Items" onEdit={() => navigate('/cart')}>
                <ul className="space-y-2">
                  {items.map((line) => (
                    <li key={line.key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {line.name} <span className="text-muted-foreground/60">× {line.quantity}</span>
                      </span>
                      <span className="tabular-nums text-foreground">{formatPrice(line.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              </ReviewBlock>

              {selectedAddress && (
                <ReviewBlock title="Delivery" onEdit={() => setStep(1)}>
                  <p className="text-sm text-foreground">{selectedAddress.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedAddress.phone}</p>
                  <p className="mt-1 text-xs text-gold-base">
                    {deliveryType === 'express' ? 'Express (1–2 days)' : 'Standard (3–5 days)'}
                  </p>
                </ReviewBlock>
              )}

              <ReviewBlock title="Payment" onEdit={() => setStep(2)}>
                <p className="text-sm text-foreground">{PAYMENT_METHODS.find((m) => m.id === payment)?.label}</p>
              </ReviewBlock>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-gold-base" />
                I agree to the Terms of Service and Privacy Policy.
              </label>

              <div className="flex justify-between">
                <Button size="lg" variant="outline" onClick={() => setStep(2)} disabled={orderMutation.isPending}>Back</Button>
                <Button size="lg" onClick={placeOrder} disabled={orderMutation.isPending}>
                  {orderMutation.isPending ? 'Placing order…' : `Place Order · ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <h2 className="mb-3 font-display text-md font-semibold text-foreground">Order Summary</h2>
            <p className="mb-3 text-xs text-muted-foreground">{count} item{count === 1 ? '' : 's'}</p>
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row label="Delivery" value={deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)} />
              <div className="flex justify-between border-t border-border pt-3">
                <dt className="font-medium text-foreground">Total</dt>
                <dd className="font-display text-lg font-semibold text-gold-base">{formatPrice(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function AddressRadio({ addr, selected, onSelect }: { addr: Address; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-lg border p-3 text-left transition-colors',
        selected ? 'border-gold-base bg-gold-base/5' : 'border-border hover:border-bg-overlay',
      )}
    >
      <p className="text-sm font-medium text-foreground">{addr.fullName} {addr.label && <span className="text-xs text-muted-foreground">· {addr.label}</span>}</p>
      <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}, {addr.province}</p>
      <p className="text-sm text-muted-foreground">{addr.phone}</p>
    </button>
  );
}

function DeliveryOption({ icon: Icon, title, desc, price, selected, onSelect }: {
  icon: typeof Truck; title: string; desc: string; price: number; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn('flex items-center gap-3 rounded-lg border p-3 text-left transition-colors', selected ? 'border-gold-base bg-gold-base/5' : 'border-border hover:border-bg-overlay')}
    >
      <Icon className={cn('size-5', selected ? 'text-gold-base' : 'text-muted-foreground')} />
      <span className="flex-1">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </span>
      <span className="text-sm font-medium text-foreground">{price === 0 ? 'Free' : formatPrice(price)}</span>
    </button>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button onClick={onEdit} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold-base">
          <Pencil className="size-3" /> Edit
        </button>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-secondary-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-input bg-bg-base px-3 text-sm text-foreground outline-none focus:border-gold-dim"
      />
    </div>
  );
}

import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order.types';

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-warning/15 text-warning' },
  PROCESSING: { label: 'Processing', className: 'bg-info/15 text-info' },
  SHIPPED: { label: 'Shipped', className: 'bg-[#6C3ABF]/20 text-[#b794f6]' },
  DELIVERED: { label: 'Delivered', className: 'bg-success/15 text-success' },
  CANCELLED: { label: 'Cancelled', className: 'bg-error/15 text-error' },
  REFUNDED: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', style.className, className)}>
      {style.label}
    </span>
  );
}

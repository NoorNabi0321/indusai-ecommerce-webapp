import { useQuery } from '@tanstack/react-query';
import { Wrench } from 'lucide-react';
import { getPublicConfig } from '@/lib/api/config.api';

/** Storefront-wide banner shown when the Owner enables maintenance mode. */
export function MaintenanceBanner() {
  const { data } = useQuery({
    queryKey: ['public-config'],
    queryFn: getPublicConfig,
    staleTime: 60_000,
  });

  if (!data?.maintenanceMode) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-2 text-center text-sm text-warning">
      <Wrench className="size-4 shrink-0" />
      <span>{data.maintenanceMessage}</span>
    </div>
  );
}

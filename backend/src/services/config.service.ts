import type { UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { writeAuditLog } from './audit.service';

interface Actor {
  id: string;
  role: UserRole;
  ip?: string;
}

const SINGLETON = 'singleton';

/** Returns the system config, creating the singleton row with defaults if absent. */
export async function getConfig() {
  return prisma.systemConfig.upsert({
    where: { id: SINGLETON },
    create: { id: SINGLETON },
    update: {},
  });
}

export interface ConfigPatch {
  storeName?: string;
  supportEmail?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  codEnabled?: boolean;
  stripeEnabled?: boolean;
  jazzcashEnabled?: boolean;
  easypaisaEnabled?: boolean;
  codFee?: number;
  codMinOrder?: number;
  paymentMode?: 'sandbox' | 'live';
}

export async function updateConfig(actor: Actor, patch: ConfigPatch) {
  await getConfig(); // ensure the row exists
  const updated = await prisma.systemConfig.update({ where: { id: SINGLETON }, data: patch });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'CONFIG_UPDATE',
    target: 'SystemConfig',
    targetId: Object.keys(patch).join(','),
    ipAddress: actor.ip,
  });

  return updated;
}

/** Public-safe subset — drives the storefront maintenance banner + payment options. */
export async function getPublicConfig() {
  const c = await getConfig();
  return {
    storeName: c.storeName,
    maintenanceMode: c.maintenanceMode,
    maintenanceMessage: c.maintenanceMessage,
    paymentMode: c.paymentMode,
    payments: {
      cod: c.codEnabled,
      stripe: c.stripeEnabled,
      jazzcash: c.jazzcashEnabled,
      easypaisa: c.easypaisaEnabled,
    },
    codFee: c.codFee,
    codMinOrder: c.codMinOrder,
  };
}

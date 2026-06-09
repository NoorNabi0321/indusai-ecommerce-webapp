import { AxiosError } from 'axios';
import type { ApiErrorBody } from '@/types/api.types';

export interface ParsedApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  fields?: Record<string, string[]>;
}

/** Normalise an unknown thrown value into a displayable API error. */
export function getApiError(error: unknown): ParsedApiError {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error) {
      const details = body.error.details;
      return {
        code: body.error.code,
        message: body.error.message,
        details,
        fields: details?.fields as Record<string, string[]> | undefined,
      };
    }
    if (error.code === 'ERR_NETWORK') {
      return { code: 'NETWORK', message: 'Cannot reach the server. Is it running?' };
    }
  }
  return { code: 'UNKNOWN', message: 'Something went wrong. Please try again.' };
}

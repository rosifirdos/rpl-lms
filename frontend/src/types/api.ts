/**
 * types/api.ts
 *
 * Kontrak envelope & error REST API backend (OpenAPI v1.4.1).
 * Seluruh respons backend dibungkus envelope `{ success, message, data, meta? }`;
 * pagination selalu berada di `meta`.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  /** Backend memakai `totalPages`; `total_pages` disupport untuk kompatibilitas. */
  totalPages?: number;
  total_pages?: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  code?: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorField {
  field: string;
  message: string;
  path?: string[];
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: ApiErrorField[];
}

/** Error ternormalisasi yang dilempar `services/http.ts`. */
export class HttpApiError extends Error implements ApiError {
  status: number;
  code?: string;
  errors?: ApiErrorField[];

  constructor(payload: ApiError) {
    super(payload.message);
    this.name = 'HttpApiError';
    this.status = payload.status;
    this.code = payload.code;
    this.errors = payload.errors;
  }
}

/** Parameter pagination standar untuk endpoint list. */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

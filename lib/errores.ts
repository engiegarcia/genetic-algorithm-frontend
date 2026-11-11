import { toast } from 'sonner';
import { ApiNetworkError, ApiServerError, ApiTimeoutError, ApiValidationError } from '@/lib/api';

/** Mensaje breve y en español para cualquier error del cliente API. */
export function mensajeError(error: unknown): string {
  if (error instanceof ApiTimeoutError) {
    return 'El backend no respondió a tiempo. Si está en Render, puede estar despertando: reintenta en unos segundos.';
  }
  if (error instanceof ApiNetworkError) {
    return 'No se pudo conectar con el backend. Revisa que esté en marcha y que el origen esté permitido (CORS).';
  }
  if (error instanceof ApiValidationError) {
    return 'El backend rechazó las entradas por no cumplir el dominio.';
  }
  if (error instanceof ApiServerError) {
    return 'El backend respondió con un error interno.';
  }
  return 'Ocurrió un error inesperado.';
}

/** Código de error del backend (500), si existe. */
export function codigoError(error: unknown): string | undefined {
  return error instanceof ApiServerError ? error.errorCode : undefined;
}

/**
 * Toast de error deduplicado por `id`: si el fallo persiste mientras se arrastra un slider,
 * sonner actualiza el mismo toast en lugar de apilar uno nuevo por petición.
 */
export function notificarError(error: unknown): void {
  const id =
    error instanceof ApiServerError
      ? 'error-servidor'
      : error instanceof ApiValidationError
        ? 'error-validacion'
        : 'error-red';
  toast.error(mensajeError(error), { id });
}

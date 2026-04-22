import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(
  err: unknown,
  options?: {
    fallback?: string;
  }
): string {
  const fallbackByStatus: Record<number, string> = {
    0: 'Falha com servidor. Tente novamente mais tarde.',
    400: 'Requisição inválida. Verifique os dados e tente novamente.',
    401: 'Sua sessão expirou ou você não está autenticado. Faça login e tente novamente.',
    403: 'Você não tem permissão para realizar esta ação.',
    404: 'Não encontramos o recurso solicitado.',
    500: 'Erro interno no servidor. Tente novamente mais tarde.'
  };

  if (err instanceof HttpErrorResponse) {
    const apiMessage = extractApiMessage(err.error);
    if (apiMessage) {
      return apiMessage;
    }

    const fallback = fallbackByStatus[err.status];
    if (fallback) {
      return fallback;
    }

    if (options?.fallback) {
      return options.fallback;
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  const message =
    typeof err === 'object' && err && 'message' in err ? String((err as { message?: unknown }).message ?? '') : '';

  if (message) {
    return message;
  }

  return options?.fallback || 'Ocorreu um erro inesperado. Tente novamente.';
}

function extractApiMessage(errorBody: unknown): string {
  if (!errorBody) {
    return '';
  }

  if (typeof errorBody === 'string') {
    return errorBody.trim();
  }

  if (typeof errorBody === 'object') {
    const body = errorBody as {
      message?: unknown;
      errors?: unknown;
    };

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (message) {
      return message;
    }

    if (Array.isArray(body.errors)) {
      const lines = body.errors
        .map((e) => (typeof e === 'string' ? e.trim() : ''))
        .filter((e) => e.length > 0);

      if (lines.length > 0) {
        return lines.join('\n');
      }
    }
  }

  return '';
}

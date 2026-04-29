/** Извлекает сообщение об ошибке из ответов Express-сервисов (`error.details`, `error.message`) и RTK Query (`data`). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const e = error as {
    data?: {
      error?: { message?: string; details?: { message: string }[] };
      message?: string;
    };
    response?: {
      data?: {
        error?: { message?: string; details?: { message: string }[] };
        message?: string;
      };
    };
  };
  const payload = e?.data ?? e?.response?.data;
  const details = payload?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((d) => d.message).join(' ');
  }
  return payload?.error?.message ?? payload?.message ?? fallback;
}

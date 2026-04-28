/** Извлекает сообщение об ошибке из ответов Express-сервисов (`error.details`, `error.message`). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const e = error as {
    response?: {
      data?: {
        error?: { message?: string; details?: { message: string }[] };
        message?: string;
      };
    };
  };
  const details = e?.response?.data?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((d) => d.message).join(' ');
  }
  return e?.response?.data?.error?.message ?? e?.response?.data?.message ?? fallback;
}

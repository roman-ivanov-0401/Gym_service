export function authServiceUrl(): string {
  return process.env.AUTH_SERVICE_URL ?? 'http://127.0.0.1:3000';
}

export function gymServiceUrl(): string {
  return process.env.GYM_SERVICE_URL ?? 'http://127.0.0.1:3001';
}

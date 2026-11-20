export function shouldEnableCron(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.ENABLE_CRON?.trim().toLowerCase();
  if (raw && raw !== 'true' && raw !== 'false') {
    throw new Error('ENABLE_CRON must be "true" or "false" when set');
  }

  const isStagingOrProd =
    env.NODE_ENV === 'production' || env.APP_ENV === 'staging' || env.APP_ENV === 'production';

  if (isStagingOrProd) {
    // Fail-safe single-owner policy: staging and production require explicit opt-in.
    return raw === 'true';
  }

  // Local development retains opt-out ergonomics unless explicitly disabled.
  return raw !== 'false';
}

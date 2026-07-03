import { Context } from 'hono';
import { HonoEnv } from '@dep/hono';
import { IEnvConfig } from '@core/config';

export const getEnvConfig = (c: Context<HonoEnv>): IEnvConfig => {
  return {
    corsAllowedOrigins:
      (
        c.env?.CORS_ORIGINS_WHITELIST || process.env.CORS_ORIGINS_WHITELIST
      )?.split(',') || [],
    oidcUserInfoUri:
      c.env?.OIDC_USER_INFO_URI || process.env.OIDC_USER_INFO_URI!,
    dbUrl: c.env?.DATABASE_URL || process.env.DATABASE_URL!,
  };
};

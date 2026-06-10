import { Context } from 'hono';
import { HonoEnv } from '@dep/hono';
import { IEnvConfig } from '@core/config';

export const getEnvConfig = (c: Context<HonoEnv>): IEnvConfig => {
  return {
    corsAllowedOrigins:
      (
        c.env?.CORS_ORIGINS_WHITELIST || process.env.CORS_ORIGINS_WHITELIST
      )?.split(',') || [],
    jwtJwksUri: c.env?.JWT_JWKS_URI || process.env.JWT_JWKS_URI!,
    jwtIssuer: c.env?.JWT_ISSUER || process.env.JWT_ISSUER!,
    jwtAudience: c.env?.JWT_AUDIENCE || process.env.JWT_AUDIENCE!,
    dbUrl: c.env?.DATABASE_URL || process.env.DATABASE_URL!,
  };
};

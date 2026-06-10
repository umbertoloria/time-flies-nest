import 'dotenv/config';

export const getConfigs = () => {
  return {
    corsAllowedOrigins: process.env.CORS_ORIGINS_WHITELIST?.split(',') || [],
    jwtJwksUri: process.env.JWT_JWKS_URI!,
    jwtIssuer: process.env.JWT_ISSUER!,
    jwtAudience: process.env.JWT_AUDIENCE!,
  };
};

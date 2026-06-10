export const getConfig = () => {
  const result = {
    corsAllowedOrigins: process.env.CORS_ORIGINS_WHITELIST?.split(',') || [],
    jwtJwksUri: process.env.JWT_JWKS_URI!,
    jwtIssuer: process.env.JWT_ISSUER!,
    jwtAudience: process.env.JWT_AUDIENCE!,
  };
  console.debug(result.corsAllowedOrigins);
  console.debug(result.jwtJwksUri);
  console.debug(result.jwtIssuer);
  console.debug(result.jwtAudience);
  console.debug(result);
  console.debug(JSON.stringify(result, null, 2));
  return result;
};

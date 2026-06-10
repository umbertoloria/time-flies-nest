export interface IEnvConfig {
  corsAllowedOrigins: string[];
  jwtJwksUri: string;
  jwtIssuer: string;
  jwtAudience: string;
  dbUrl: string;
}

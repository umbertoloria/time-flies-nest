interface ReqUser {
  id: string;
  sub: string;
  clientId?: string;
  organizationId?: string;
  scopes: string[];
  audience: string[];
}

import { IEnvConfig } from '@core/config';
import { UnauthorizedError } from '@core/errors';
import { traceFunction } from '@core/trace';

async function verifyJwtAndCreateReqUserIn(
  config: IEnvConfig,
  token: string,
): Promise<ReqUser> {
  const response = await fetch(config.oidcUserInfoUri, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const userInfo = await response.json();

  // console.debug('JWT Payload');
  // console.debug(userInfo);

  if (!userInfo.sub || typeof userInfo.sub !== 'string') {
    throw new UnauthorizedError('Invalid token');
  }
  /* Es. "userInfo"
    {
      sub: "xxx",
      name: null,
      picture: null,
      updated_at: 1783096472512,
      username: null,
      created_at: 1783096471592,
    }
  */

  return {
    id: userInfo.sub,
  };
}

export const verifyJwtAndCreateReqUser = traceFunction(
  'verifyJwtAndCreateReqUser',
  verifyJwtAndCreateReqUserIn,
);

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

export function getApiAuth(bodyParams: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const em = bodyParams?.em;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const sp = bodyParams?.sp;
  if (!(typeof em === 'string' && !!em && typeof sp === 'string' && !!sp)) {
    throw new UnauthorizedException();
  }
  return {
    em,
    sp,
  };
}

export function getFromConfigService(configService: ConfigService) {
  const phpBaseUrl = configService.get<string>('PHP_BASE_URL');
  const phpApiKey = configService.get<string>('PHP_API_KEY');
  return {
    phpBaseUrl,
    phpApiKey,
  };
}

export async function requireAuth(
  prismaService: PrismaService,
  bodyParams: any,
) {
  // Auth
  const { em, sp } = getApiAuth(bodyParams);
  const dbUser = await prismaService.userLogin(em, sp);
  if (!dbUser) {
    throw new UnauthorizedException('No session found');
  }
  return dbUser;
}

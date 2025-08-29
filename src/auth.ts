import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

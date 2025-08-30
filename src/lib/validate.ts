import { BadRequestException } from '@nestjs/common';

export function get_required_string(
  bodyParams: any,
  paramName: string,
): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const value = bodyParams[paramName];
  if (typeof value !== 'string' || !value) {
    throw new BadRequestException(`Param "${paramName}" required`);
  }
  return value;
}

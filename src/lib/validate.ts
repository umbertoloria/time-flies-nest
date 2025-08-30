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

const REG_EXP_LOCAL_DATE = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})$');

export function get_required_local_date(
  bodyParams: any,
  paramName: string,
): string {
  // Es. "2024-10-20"
  const value = get_required_string(bodyParams, paramName);
  const ex = REG_EXP_LOCAL_DATE.exec(value);
  if (!ex) {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a date`,
    );
  }

  const str_year = ex[1];
  const str_month = ex[2];
  const str_day = ex[3];

  const year = parseInt(str_year);
  const month = parseInt(str_month);
  const day = parseInt(str_day);

  if (Number.isNaN(year) || year < 1999 || year > 2999) {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a date`,
    );
  }
  if (Number.isNaN(month) || month < 1 || month > 12) {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a date`,
    );
  }
  if (Number.isNaN(day) || day < 1 || day > 31) {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a date`,
    );
  }

  if (!checkdate(year, month, day)) {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a date`,
    );
  }
  return (
    `${year}`.padStart(4, '0') +
    '-' +
    `${month}`.padStart(2, '0') +
    '-' +
    `${day}`.padStart(2, '0')
  );
}

export function checkdate(year: number, month: number, day: number): boolean {
  // Inspired from PHP.
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function get_optional_bool(
  bodyParams: any,
  paramName: string,
): undefined | boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const value = bodyParams[paramName];
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else {
    return undefined;
  }
}

export function get_required_bool(bodyParams: any, paramName: string): boolean {
  const value = get_optional_bool(bodyParams, paramName);
  if (value !== true && value !== false) {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a boolean`,
    );
  }
  return value;
}

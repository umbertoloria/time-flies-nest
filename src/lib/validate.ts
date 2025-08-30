import { BadRequestException } from '@nestjs/common';

// STRING
export function get_optional_string(
  bodyParams: any,
  paramName: string,
): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const value = bodyParams[paramName];
  if (typeof value !== 'string' || !value) {
    return undefined;
  }
  return value;
}

export function get_required_string(
  bodyParams: any,
  paramName: string,
): string {
  const value = get_optional_string(bodyParams, paramName);
  if (typeof value !== 'string') {
    throw new BadRequestException(`Param "${paramName}" required`);
  }
  return value;
}

// COLOR
const REG_EXP_HEX_COLOR = new RegExp('^#[A-Fa-f0-9]{6}$');

export function get_optional_color(
  bodyParams: any,
  paramName: string,
): string | undefined {
  // Es. "#115599"
  const value = get_optional_string(bodyParams, paramName);
  if (typeof value !== 'string') {
    return undefined;
  }
  const ex = REG_EXP_HEX_COLOR.exec(value);
  if (!ex) {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a color`,
    );
  }
  return value;
}

export function get_required_color(bodyParams: any, paramName: string): string {
  const value = get_optional_color(bodyParams, paramName);
  if (typeof value !== 'string') {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a color`,
    );
  }
  return value;
}

// DATE
const REG_EXP_LOCAL_DATE = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})$');

export function get_optional_local_date(
  bodyParams: any,
  paramName: string,
): string | undefined {
  // Es. "2024-10-20"
  const value = get_optional_string(bodyParams, paramName);
  if (typeof value !== 'string') {
    return undefined;
  }

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

export function get_required_local_date(
  bodyParams: any,
  paramName: string,
): string {
  // Es. "2024-10-20"
  const value = get_optional_local_date(bodyParams, paramName);
  if (typeof value !== 'string') {
    throw new BadRequestException(
      `Param "${paramName}" invalid: must be a date`,
    );
  }
  return value;
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

// BOOL
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

// INT
export function validate_int(strValue: string, errorMsg: string): number {
  const intValue = parseInt(strValue);
  if (Number.isNaN(intValue)) {
    throw new BadRequestException(errorMsg);
  }
  return intValue;
}

export function get_required_int(bodyParams: any, paramName: string): number {
  const strValue = get_required_string(bodyParams, paramName);
  return validate_int(
    strValue,
    `Param "${paramName}" invalid: must be an integer`,
  );
}

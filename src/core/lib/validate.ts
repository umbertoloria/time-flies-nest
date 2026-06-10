import { BadRequestError } from '../errors';

// STRING
export function fromBodyGetOptionalString(
  bodyParams: any,
  paramName: string,
): string | undefined {
  const value = bodyParams[paramName];
  if (typeof value !== 'string' || !value) {
    return undefined;
  }
  return value;
}

export function fromBodyGetRequiredString(
  bodyParams: any,
  paramName: string,
): string {
  const value = fromBodyGetOptionalString(bodyParams, paramName);
  if (typeof value !== 'string') {
    throw new BadRequestError(`Param "${paramName}" required`);
  }
  return value;
}

// COLOR
const REG_EXP_HEX_COLOR = new RegExp('^#[A-Fa-f0-9]{6}$');

export function validateColor(value: string, errorMsg: string): string {
  const ex = REG_EXP_HEX_COLOR.exec(value);
  if (!ex) {
    throw new BadRequestError(errorMsg);
  }
  return value;
}

export function fromBodyGetOptionalColor(
  bodyParams: any,
  paramName: string,
): string | undefined {
  // Es. "#115599"
  const value = fromBodyGetOptionalString(bodyParams, paramName);
  if (typeof value !== 'string') {
    return undefined;
  }
  const ex = REG_EXP_HEX_COLOR.exec(value);
  if (!ex) {
    throw new BadRequestError(`Param "${paramName}" invalid: must be a color`);
  }
  return value;
}

export function fromBodyGetRequiredColor(
  bodyParams: any,
  paramName: string,
): string {
  const value = fromBodyGetOptionalColor(bodyParams, paramName);
  if (typeof value !== 'string') {
    throw new BadRequestError(`Param "${paramName}" invalid: must be a color`);
  }
  return value;
}

// DATE
const REG_EXP_LOCAL_DATE = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})$');

export function validateDate(strValue: string, errorMsg: string): string {
  const ex = REG_EXP_LOCAL_DATE.exec(strValue);
  if (!ex) {
    throw new BadRequestError(errorMsg);
  }
  const strYear = ex[1];
  const strMonth = ex[2];
  const strDay = ex[3];
  const year = parseInt(strYear);
  const month = parseInt(strMonth);
  const day = parseInt(strDay);
  if (Number.isNaN(year) || year < 1999 || year > 2999) {
    throw new BadRequestError(errorMsg);
  }
  if (Number.isNaN(month) || month < 1 || month > 12) {
    throw new BadRequestError(errorMsg);
  }
  if (Number.isNaN(day) || day < 1 || day > 31) {
    throw new BadRequestError(errorMsg);
  }
  if (!checkDate(year, month, day)) {
    throw new BadRequestError(errorMsg);
  }
  return (
    `${year}`.padStart(4, '0') +
    '-' +
    `${month}`.padStart(2, '0') +
    '-' +
    `${day}`.padStart(2, '0')
  );
}

export function fromBodyGetOptionalLocalDate(
  bodyParams: any,
  paramName: string,
): string | undefined {
  // Es. "2024-10-20"
  const value = fromBodyGetOptionalString(bodyParams, paramName);
  if (typeof value !== 'string') {
    return undefined;
  }

  return validateDate(value, `Param "${paramName}" invalid: must be a date`);
}

export function fromBodyGetRequiredLocalDate(
  bodyParams: any,
  paramName: string,
): string {
  // Es. "2024-10-20"
  const value = fromBodyGetOptionalLocalDate(bodyParams, paramName);
  if (typeof value !== 'string') {
    throw new BadRequestError(`Param "${paramName}" invalid: must be a date`);
  }
  return value;
}

export function checkDate(year: number, month: number, day: number): boolean {
  // Inspired from PHP.
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// BOOL
export function fromBodyGetOptionalBool(
  bodyParams: any,
  paramName: string,
): undefined | boolean {
  const value = bodyParams[paramName];
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else {
    return undefined;
  }
}

export function fromBodyGetRequiredBool(
  bodyParams: any,
  paramName: string,
): boolean {
  const value = fromBodyGetOptionalBool(bodyParams, paramName);
  if (value !== true && value !== false) {
    throw new BadRequestError(
      `Param "${paramName}" invalid: must be a boolean`,
    );
  }
  return value;
}

// INT
export function fromBodyValidateInt(
  strValue: string,
  errorMsg: string,
): number {
  const intValue = parseInt(strValue);
  if (Number.isNaN(intValue)) {
    throw new BadRequestError(errorMsg);
  }
  return intValue;
}

export function fromBodyGetRequiredInt(
  bodyParams: any,
  paramName: string,
): number {
  const strValue = fromBodyGetRequiredString(bodyParams, paramName);
  return fromBodyValidateInt(
    strValue,
    `Param "${paramName}" invalid: must be an integer`,
  );
}

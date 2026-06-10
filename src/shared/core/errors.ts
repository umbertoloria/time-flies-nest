// 400 Bad Request
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

// 401 Unauthorized
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// 403 Forbidden
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export const mapAppError2StatusCode = new Map<Function, number>([
  [BadRequestError, 400],
  [UnauthorizedError, 401],
  [ForbiddenError, 403],
]);

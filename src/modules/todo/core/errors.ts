export class TodoNotFoundError extends Error {
  constructor() {
    super('Todo not found');
    this.name = 'TodoNotFoundError';
  }
}

export class TodoAlreadyDoneError extends Error {
  constructor() {
    super('Todo already done');
    this.name = 'TodoAlreadyDoneError';
  }
}

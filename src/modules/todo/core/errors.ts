export class TodoNotFoundError extends Error {
  constructor() {
    super('Todo not found');
    this.name = 'TodoNotFoundError';
  }
}
// throw new NotFoundException('Todo not found');

export class TodoAlreadyDoneError extends Error {
  constructor() {
    super('Todo already done');
    this.name = 'TodoAlreadyDoneError';
  }
}
// throw new BadRequestException('Todo already done');

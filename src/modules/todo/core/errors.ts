export class TodoNotFoundError extends Error {
  constructor() {
    super('Todo not found');
    this.name = 'TodoNotFoundError';
  }
}
// throw new NotFoundException('Todo not found');

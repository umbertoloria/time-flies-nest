export class TaskNotFoundError extends Error {
  constructor() {
    super('Task not found');
    this.name = 'TaskNotFoundError';
  }
}

export const mapTaskError2StatusCode = new Map<Function, number>([
  [TaskNotFoundError, 404],
]);

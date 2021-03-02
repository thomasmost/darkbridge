class RoutineError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = 409;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends RoutineError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = 400;
  }
}
export class CollisionError extends RoutineError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = 405;
  }
}

export class AuthenticationError extends RoutineError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = 401;
  }
}

export class NotImplemented extends Error {
  status: number;
  constructor() {
    super('Not Yet Implemented');
    this.name = this.constructor.name;
    this.status = 501;
  }
}

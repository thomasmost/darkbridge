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

export class AuthenticationError extends RoutineError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = 401;
  }
}

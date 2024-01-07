export class apiError extends Error {
  statusCode: number;
  success: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}

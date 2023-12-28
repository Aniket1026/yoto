export class apiResponse {
  statusCode: number;
  success: boolean;
  data: any;
  message: string;
  constructor(data: any, statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.success = true;
    this.data = data;
    this.message = message;
  }
}

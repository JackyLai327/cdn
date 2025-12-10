export class ApiResponse<T> {
  public success: boolean;
  public message: string;
  public data: T | null;
  public statusCode: number;

  constructor(statusCode: number, message: string, data: T | null = null, success: boolean) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success;
  }

  static success<T>(data: T, message: string = "Success", statusCode: number = 200): ApiResponse<T> {
    return new ApiResponse(statusCode, message, data, true);
  }

  static error<T>(message: string, statusCode: number = 500, data: T | null = null): ApiResponse<T> {
    return new ApiResponse(statusCode, message, data, false);
  }
}

import { AxiosError } from 'axios';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  errors?: ValidationError[];
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly path: string;
  public readonly validationErrors?: ValidationError[];

  constructor(
    message: string,
    statusCode: number = 500,
    timestamp: string = new Date().toISOString(),
    path: string = '',
    validationErrors?: ValidationError[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.timestamp = timestamp;
    this.path = path;
    this.validationErrors = validationErrors;
  }

  public static fromAxiosError(error: AxiosError): ApiError {
    if (error.response?.data) {
      try {
        const errorData = error.response.data as ApiErrorResponse;
        
        return new ApiError(
          errorData.message || error.message,
          errorData.statusCode || error.response.status || 500,
          errorData.timestamp || new Date().toISOString(),
          errorData.path || error.config?.url || '',
          errorData.errors
        );
      } catch {
        return new ApiError(
          error.message,
          error.response.status || 500,
          new Date().toISOString(),
          error.config?.url || ''
        );
      }
    }
    
    return new ApiError(
      error.message,
      error.response?.status || 500,
      new Date().toISOString(),
      error.config?.url || ''
    );
  }

  public get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  public get isValidationError(): boolean {
    return this.statusCode === 422 && !!this.validationErrors?.length;
  }

  public get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  public get isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  public getValidationError(field: string): string | undefined {
    return this.validationErrors?.find(error => error.field === field)?.message;
  }

  public hasValidationError(field: string): boolean {
    return !!this.validationErrors?.some(error => error.field === field);
  }
} 
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../../core/models/ApiError';

export class HttpInterceptor {
  private readonly instance: AxiosInstance;
  private readonly baseURL: string;
  private readonly defaultOptions: AxiosRequestConfig = {
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:8080/api') {
    this.baseURL = baseURL;
    this.instance = axios.create({
      ...this.defaultOptions,
      baseURL: this.baseURL,
    });

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  private initializeRequestInterceptor(): void {
    this.instance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );
  }

  private initializeResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log(`Request to ${config.url} - Token available: ${token.substring(0, 10)}...`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`Request to ${config.url} - No auth token available`);
    }
    
    if (import.meta.env.MODE === 'development') {
      console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
      
      if (config.data) {
        console.log('📦 Request Data:', config.data);
      }
    }
    
    return config;
  }

  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    console.error('🚨 Request Error:', error);
    return Promise.reject(error);
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    if (import.meta.env.MODE === 'development') {
      console.log(`✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`);
      
      if (response.data) {
        console.log('📦 Response Data:', response.data);
      }
    }
    
    return response;
  }

  private handleResponseError(error: AxiosError): Promise<never> {
    const apiError = ApiError.fromAxiosError(error);
    
    if (import.meta.env.MODE === 'development') {
      console.error(`Error: ${apiError.message} (${apiError.statusCode})`);
      console.error('Details:', apiError);
    }
    
    if (apiError.isAuthError) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    
    if (apiError.isServerError) {
      console.error('Server Error:', apiError.message);
    }
    
    return Promise.reject(apiError);
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.get<T>(url, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error as AxiosError);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error as AxiosError);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error as AxiosError);
    }
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error as AxiosError);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error as AxiosError);
    }
  }
} 
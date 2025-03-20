import httpClient from './interceptors';
import { AxiosRequestConfig } from 'axios';

export abstract class BaseHttpService {
  protected apiEndpoint: string;

  constructor(endpoint: string) {
    this.apiEndpoint = endpoint;
  }

  protected async get<T>(path: string = '', config?: AxiosRequestConfig): Promise<T> {
    return httpClient.get<T>(`${this.apiEndpoint}${path}`, config);
  }

  protected async post<T>(path: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.post<T>(`${this.apiEndpoint}${path}`, data, config);
  }

  protected async put<T>(path: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.put<T>(`${this.apiEndpoint}${path}`, data, config);
  }

  protected async patch<T>(path: string = '', data?: any, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.patch<T>(`${this.apiEndpoint}${path}`, data, config);
  }

  protected async delete<T>(path: string = '', config?: AxiosRequestConfig): Promise<T> {
    return httpClient.delete<T>(`${this.apiEndpoint}${path}`, config);
  }
} 
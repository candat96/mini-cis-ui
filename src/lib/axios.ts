import type {
  InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import axios from 'axios';
import { getStoreData } from './localStorage';

const headers: AxiosRequestConfig['headers'] = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};
const timeout = 10 * 60 * 1000;

class Axios {
  private instance: AxiosInstance;
  private interceptor: number | null = null;

  constructor() {
    const instance = axios.create({
      baseURL: 'http://103.163.215.106:1551',
      headers,
      timeout,
    });

    // request interceptor
    instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await getStoreData('token');
        if (config.headers) {
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            delete config.headers.Authorization;
          }
        }
        console.log("DATA request", config.data, config.url);
        return config;
      },
      (error) => Promise.reject(error),
    );

    // response interceptor
    const interceptor = instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log("RESPONSE", response.data);
        return response.data
      },
      (error: AxiosError) => {
        const { response } = error;
        if (response && response.status === 401) {
          this.signOut();
        } else {
          return Promise.reject(error.response?.data);
        }
      },
    );

    this.instance = instance;
    this.interceptor = interceptor;
  }

  public get Instance(): AxiosInstance {
    return this.instance;
  }

  public useInterceptor() {
    if (this.interceptor === null) {
      const interceptor = this.instance.interceptors.response.use(
        (response: AxiosResponse) => response.data,
        (error: AxiosError) => {
          console.log(error);
          return Promise.reject(error)
        },
      );
      this.interceptor = interceptor;
    }
  }

  public ejectInterceptor() {
    if (this.interceptor !== null) {
      this.instance.interceptors.response.eject(this.interceptor);
      this.interceptor = null;
    }
  }

  private signOut() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  public post<T = any, R = T>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    this.useInterceptor();
    return this.Instance.post<T, R>(url, data, config);
  }

  public get<T = any, R = T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    this.useInterceptor();
    return this.Instance.get<T, R>(url, config);
  }

  public put<T = any, R = T>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    this.useInterceptor();
    return this.Instance.put<T, R>(url, data, config);
  }

  public delete<T = any, R = T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    this.useInterceptor();
    return this.Instance.delete<T, R>(url, config);
  }

  public patch<T = any, R = T>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    this.useInterceptor();
    return this.Instance.patch<T, R>(url, data, config);
  }

  public pull<T = any, R = T>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    this.ejectInterceptor();
    return this.Instance.post<T, R>(url, data, config);
  }
}

const HttpClient = new Axios();
export default HttpClient;

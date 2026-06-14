import z from 'zod'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type RequestOptions<TBody = unknown> = {
  method?: HttpMethod
  body?: TBody
  headers?: Record<string, string>
  signal?: AbortSignal
  server?: boolean
  search?: Record<string, string | number>
  skipRefresh?: boolean
}

export interface IApiClient {
  get<T>(
    url: string,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<T>
  post<T, B = unknown>(
    url: string,
    body?: B,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions<B>, 'method' | 'body'>,
  ): Promise<T>
  put<T, B = unknown>(
    url: string,
    body?: B,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions<B>, 'method' | 'body'>,
  ): Promise<T>
  delete<T>(
    url: string,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<T>
  getBaseUrl(): string
}

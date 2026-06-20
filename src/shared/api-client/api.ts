import { IApiClient, RequestOptions } from './types'

import { fetchRefreshSessionInner } from '@api/refresh/inner'
import { BASE_URL, Status } from '@constants/api'
import { getAccessToken } from '@server'
import { accessStorage } from '@utils'
import z from 'zod'

export class ApiClient implements IApiClient {
  constructor(private readonly baseUrl: string = BASE_URL) {}

  async get<T>(
    url: string,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return this.request<T>(url, { ...options, method: 'GET' }, schema)
  }

  async post<T, B = unknown>(
    url: string,
    body?: B,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions<B>, 'method' | 'body'>,
  ) {
    return this.request<T, B>(url, { ...options, method: 'POST', body }, schema)
  }

  async put<T, B = unknown>(
    url: string,
    body?: B,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions<B>, 'method' | 'body'>,
  ) {
    return this.request<T, B>(url, { ...options, method: 'PUT', body }, schema)
  }

  async patch<T, B = unknown>(
    url: string,
    body?: B,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions<B>, 'method' | 'body'>,
  ) {
    return this.request<T, B>(url, { ...options, method: 'PATCH', body }, schema)
  }

  async delete<T>(
    url: string,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return this.request<T>(url, { ...options, method: 'DELETE' }, schema)
  }

  private async performRequest<TBody>(
    url: URL,
    options: RequestOptions<TBody>,
    token?: string | null,
  ) {
    const isFormData = options.body instanceof FormData

    const headers: Record<string, string> = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    let body: BodyInit | undefined

    if (options.body !== undefined && options.method !== 'GET') {
      body = isFormData ? (options.body as FormData) : JSON.stringify(options.body)
    }

    return fetch(url.toString(), {
      method: options.method,
      headers,
      body,
      signal: options.signal,
      cache: 'no-store',
    })
  }

  private async request<TResponse, TBody = unknown>(
    endpoint: string,
    options: RequestOptions<TBody>,
    schema?: z.ZodType<TResponse>,
  ): Promise<TResponse> {
    const url = new URL(endpoint, this.baseUrl)

    if (options.search) {
      const stringOptions: Record<string, string> = Object.fromEntries(
        Object.entries(options.search).map(([key, value]) => [key, String(value)]),
      )

      url.search = new URLSearchParams(stringOptions).toString()
    }

    let token = !!options.server ? await getAccessToken() : accessStorage.get()

    let response = await this.performRequest(url, options, token)

    if (!options.skipRefresh && response.status === 401 && typeof window !== 'undefined') {
      const refreshedToken = await fetchRefreshSessionInner()

      if (!refreshedToken) {
        throw new Error(Status.Unauthorized)
      }

      token = refreshedToken

      response = await this.performRequest(url, options, token)
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || Status.Error)
    }

    const text = await response.text()

    const data = text ? JSON.parse(text) : null

    if (schema) {
      const parsed = schema.safeParse(data)

      if (!parsed.success) {
        throw new Error(`${Status.ValidationError}: ${parsed.error.message}`)
      }

      return parsed.data
    }

    return data
  }

  getBaseUrl() {
    return this.baseUrl
  }
}

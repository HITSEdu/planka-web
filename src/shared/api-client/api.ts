// 'use client'

import { IApiClient, RequestOptions } from './types'

import { fetchRefreshSessionInner } from '@api/refresh/inner'
import { BASE_URL, Status } from '@constants/api'
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

  async delete<T>(
    url: string,
    schema?: z.ZodType<T>,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return this.request<T>(url, { ...options, method: 'DELETE' }, schema)
  }

  private async performRequest<TBody>(url: URL, options: RequestOptions<TBody>, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    return fetch(url.toString(), {
      method: options.method,
      headers,
      body: options.body && options.method !== 'GET' ? JSON.stringify(options.body) : undefined,
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

    let token = accessStorage.get()

    let response = await this.performRequest(url, options, token)

    if (response.status === 401 && typeof 'window' !== undefined) {
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

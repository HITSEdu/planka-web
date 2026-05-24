// 'use client'

import { ApiClient } from './api'

import { Status } from '@constants/api'

type ApiFn<Args extends unknown[], R> = (api: ApiClient, ...args: Args) => Promise<R> | R

export function createApiClient() {
  return new ApiClient()
}

const apiClient = createApiClient()

export const withApi = <Args extends unknown[], R>(fn: ApiFn<Args, R>) => {
  return async (...args: Args): Promise<R> => {
    return fn(apiClient, ...args)
  }
}

export const withApiSafe = <Args extends unknown[], R>(fn: ApiFn<Args, R>) => {
  return async (...args: Args) => {
    try {
      const data = await fn(apiClient, ...args)

      return { ok: true as const, data }
    } catch (e) {
      const message = e instanceof Error ? e.message : Status.Error
      const error = message

      return { ok: false as const, error }
    }
  }
}

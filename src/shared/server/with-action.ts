import { Status } from '@constants/api'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string } | null

export function withAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      const data = await fn(...args)
      return { ok: true, data }
    } catch (e) {
      if (isRedirectError(e)) {
        throw e
      }

      const message = e instanceof Error ? e.message : Status.Error
      const error = message.startsWith(Status.ValidationError) ? Status.ValidationError : message

      return { ok: false, error }
    }
  }
}

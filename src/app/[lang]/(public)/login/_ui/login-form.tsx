'use client'

import {
  AuthCard,
  AuthField,
  AuthLinkButton,
  AuthSubmitButton,
  getAuthErrorMessage,
} from '../../_ui'

import { loginAction } from '@actions/auth-actions'
import { LoginRequestSchema, LoginRequestType } from '@api/auth-api/dto'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { useAppForm } from '@hooks/use-app-form'
import { useLocalizedPath } from '@hooks/use-localized-path'
import { accessStorage } from '@utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export const LoginForm = () => {
  const dict = useDictionary().auth
  const router = useRouter()
  const toLocalized = useLocalizedPath()
  const [submitError, setSubmitError] = useState('')

  const defaultValues: LoginRequestType = {
    email: '',
    password: '',
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: LoginRequestSchema,
    },
    onSubmit: ({ value }) => {
      setSubmitError('')

      loginAction(value).then((data) => {
        if (!data?.ok) {
          const message = getAuthErrorMessage(data?.error, dict.errors)

          setSubmitError(message)
          toast.error(message)
        } else {
          accessStorage.set(data.data.accessToken)
          router.replace(Routes.Profile)
        }
      })
    },
  })

  return (
    <AuthCard
      title={dict.form.title}
      className="tablet:min-h-[min(92vh,1130px)] desktop:max-w-[810px]"
    >
      <form
        className="relative z-20 flex min-h-0 flex-1 flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        {submitError && (
          <div
            className="rounded-[18px] border-2 border-red-200 bg-red-500/15 px-5 py-3 text-[16px] font-semibold leading-5 text-red-100"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <form.AppField name="email">
          {(field) => <AuthField field={field} label={dict.form.email} errors={dict.errors} />}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <AuthField
              field={field}
              label={dict.form.password}
              errors={dict.errors}
              type="password"
            />
          )}
        </form.AppField>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <form.AppForm>
            <AuthSubmitButton>{dict.form.login}</AuthSubmitButton>
          </form.AppForm>
          <div className="h-1 rounded-full bg-white" />
          <AuthLinkButton href={toLocalized(Routes.Register)}>
            {dict.form.registerLink}
          </AuthLinkButton>
        </div>
      </form>
    </AuthCard>
  )
}

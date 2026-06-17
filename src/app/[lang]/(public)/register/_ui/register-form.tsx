'use client'

import {
  AuthCard,
  AuthField,
  AuthLinkButton,
  AuthSubmitButton,
  getAuthErrorMessage,
} from '../../_ui'

import { registerAction } from '@actions/auth-actions'
import { RegisterRequestSchema, RegisterRequestType } from '@api/auth-api/dto'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { useAppForm } from '@hooks/use-app-form'
import { useLocalizedPath } from '@hooks/use-localized-path'
import { accessStorage } from '@utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export const RegisterForm = () => {
  const dict = useDictionary().auth
  const router = useRouter()
  const toLocalized = useLocalizedPath()
  const [submitError, setSubmitError] = useState('')

  const defaultValues: RegisterRequestType = {
    name: '',
    email: '',
    password: '',
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: RegisterRequestSchema,
    },
    onSubmit: ({ value }) => {
      setSubmitError('')

      registerAction(value).then((data) => {
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
      title={dict.form.registerTitle}
      className="tablet:min-h-[min(92vh,1130px)] desktop:max-w-[810px]"
    >
      <Image
        src="/assets/auth/register/white-flower.png"
        alt=""
        width={1518}
        height={1246}
        className="pointer-events-none absolute -bottom-1 -left-1 z-[15] hidden w-[42vw] min-w-[390px] max-w-[720px] tablet:block"
        priority
        unoptimized
      />
      <form
        className="relative z-30 flex min-h-0 flex-1 flex-col gap-6"
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

        <div className="relative z-30 mt-auto flex flex-col gap-3 pt-8">
          <form.AppForm>
            <AuthSubmitButton>{dict.form.register}</AuthSubmitButton>
          </form.AppForm>
          <div className="h-1 rounded-full bg-white" />
          <AuthLinkButton href={toLocalized(Routes.Login)}>{dict.form.loginLink}</AuthLinkButton>
        </div>
      </form>
    </AuthCard>
  )
}

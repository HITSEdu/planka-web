'use client'

import { AuthCard, AuthField, AuthLinkButton, AuthSubmitButton } from '../../_ui'

import { loginAction } from '@actions/auth-actions'
import { LoginRequestSchema, LoginRequestType } from '@api/auth-api/dto'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { useAppForm } from '@hooks/use-app-form'
import { useLocalizedPath } from '@hooks/use-localized-path'
import { accessStorage } from '@utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const LoginForm = () => {
  const dict = useDictionary().auth.form
  const router = useRouter()
  const toLocalized = useLocalizedPath()

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
      loginAction(value).then((data) => {
        if (!data?.ok) {
          toast.error(data?.error)
        } else {
          accessStorage.set(data.data.accessToken)
          router.replace(Routes.Profile)
        }
      })
    },
  })

  return (
    <AuthCard title="Вход" className="tablet:min-h-[min(92vh,1130px)] desktop:max-w-[810px]">
      <form
        className="relative z-20 flex min-h-0 flex-1 flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.AppField name="email">
          {(field) => <AuthField field={field} label="Email" />}
        </form.AppField>

        <form.AppField name="password">
          {(field) => <AuthField field={field} label={dict.password} type="password" />}
        </form.AppField>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <form.AppForm>
            <AuthSubmitButton>{dict.login}</AuthSubmitButton>
          </form.AppForm>
          <div className="h-1 rounded-full bg-white" />
          <AuthLinkButton href={toLocalized(Routes.Register)}>
            Еще нет аккаунта? Зарегистрироваться
          </AuthLinkButton>
        </div>
      </form>
    </AuthCard>
  )
}

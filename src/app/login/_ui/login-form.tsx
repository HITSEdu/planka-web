'use client'

import { loginAction } from '@actions/auth-actions'
import { LoginRequestSchema, LoginRequestType } from '@api/auth-api/dto'
import { Routes } from '@constants/routes'
import { useAppForm } from '@hooks/use-app-form'
import { BlockWrapper } from '@ui/molecules'
import { accessStorage } from '@utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const LoginForm = () => {
  const router = useRouter()

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
    <BlockWrapper title='Вход в аккаунт'>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.AppField name="email">
          {(field) => <field.TextField label='Email' />}
        </form.AppField>

        <form.AppField name="password">
          {(field) => <field.TextField label='Пароль' />}
        </form.AppField>

        <form.AppForm>
          <form.SubscribeButton>Войти</form.SubscribeButton>
        </form.AppForm>
      </form>
    </BlockWrapper>
  )
}

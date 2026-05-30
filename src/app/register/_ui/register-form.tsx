'use client'

import { registerAction } from '@actions/auth-actions'
import { RegisterRequestSchema, RegisterRequestType } from '@api/auth-api/dto'
import { Routes } from '@constants/routes'
import { useAppForm } from '@hooks/use-app-form'
import { BlockWrapper } from '@ui/molecules'
import { accessStorage } from '@utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const RegisterForm = () => {
  const router = useRouter()

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
      registerAction(value).then((data) => {
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
    <BlockWrapper title="Регистрация">
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.AppField name="name">{(field) => <field.TextField label="Имя" />}</form.AppField>
        <form.AppField name="email">{(field) => <field.TextField label="Email" />}</form.AppField>

        <form.AppField name="password">
          {(field) => <field.TextField label="Пароль" />}
        </form.AppField>

        <form.AppForm>
          <form.SubscribeButton>Зарегистрироваться</form.SubscribeButton>
        </form.AppForm>
      </form>
    </BlockWrapper>
  )
}

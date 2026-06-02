'use client'

import { loginAction } from '@actions/auth-actions'
import { LoginRequestSchema, LoginRequestType } from '@api/auth-api/dto'
import { Routes } from '@constants/routes'
import { useDictionary } from '@contexts/dictionary-context'
import { useAppForm } from '@hooks/use-app-form'
import { BlockWrapper } from '@ui/molecules'
import { accessStorage } from '@utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const LoginForm = () => {
  const dict = useDictionary().auth.form
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
    <BlockWrapper title={dict.title}>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.AppField name="email">
          {(field) => <field.TextField label={dict.email} />}
        </form.AppField>

        <form.AppField name="password">
          {(field) => <field.TextField label={dict.password} />}
        </form.AppField>

        <form.AppForm>
          <form.SubscribeButton>{dict.login}</form.SubscribeButton>
        </form.AppForm>
      </form>
    </BlockWrapper>
  )
}

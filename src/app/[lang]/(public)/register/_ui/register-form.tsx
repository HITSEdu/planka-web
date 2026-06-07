'use client'

import { AuthCard, AuthField, AuthLinkButton, AuthSubmitButton } from '../../_ui'

import { registerAction } from '@actions/auth-actions'
import { RegisterRequestSchema, RegisterRequestType } from '@api/auth-api/dto'
import { Routes } from '@constants/routes'
import { useAppForm } from '@hooks/use-app-form'
import { useLocalizedPath } from '@hooks/use-localized-path'
import { accessStorage } from '@utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const RegisterForm = () => {
  const router = useRouter()
  const toLocalized = useLocalizedPath()

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
    <AuthCard title="Регистрация" className="tablet:min-h-[min(92vh,1130px)] desktop:max-w-[810px]">
      <Image
        src="/registerFlowers/whiteFlower.png"
        alt=""
        width={1518}
        height={1246}
        className="pointer-events-none absolute -bottom-1 -left-1 z-[25] hidden w-[42vw] min-w-[390px] max-w-[720px] tablet:block"
        priority
        unoptimized
      />
      <form
        className="flex min-h-0 flex-1 flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <div className="relative z-20">
          <form.AppField name="email">
            {(field) => <AuthField field={field} label="Email" />}
          </form.AppField>
        </div>

        <div className="relative z-20">
          <form.AppField name="password">
            {(field) => <AuthField field={field} label="Пароль" type="password" />}
          </form.AppField>
        </div>

        <div className="relative z-30 mt-auto flex flex-col gap-3 pt-8">
          <form.AppForm>
            <AuthSubmitButton>Зарегистрироваться</AuthSubmitButton>
          </form.AppForm>
          <div className="h-1 rounded-full bg-white" />
          <AuthLinkButton href={toLocalized(Routes.Login)}>Уже есть аккаунт? Войти</AuthLinkButton>
        </div>
      </form>
    </AuthCard>
  )
}

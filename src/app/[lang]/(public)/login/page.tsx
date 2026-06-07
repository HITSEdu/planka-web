import { LoginForm } from './_ui'
import { AuthPageShell } from '../_ui'

import { hasLocale } from '@/shared/config'
import { notFound } from 'next/navigation'

export default async function Login({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  return (
    <AuthPageShell variant="login">
      <LoginForm />
    </AuthPageShell>
  )
}

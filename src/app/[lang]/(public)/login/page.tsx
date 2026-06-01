import { LoginForm } from './_ui'

import { hasLocale } from '@/shared/config'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function Login({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  return (
    <div className="flex flex-col items-center tablet:flex-row gap-5 tablet:mt-4 laptop:mt-12 desktop:mt-15">
      <div className="relative flex-1 max-w-150 tablet:max-w-full">
        <Image src="/assets/auth-img.png" alt="" width={875} height={700} loading="eager" />
      </div>
      <LoginForm />
    </div>
  )
}

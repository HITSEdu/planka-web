import { hasLocale } from '@/shared/config'
import { notFound } from 'next/navigation'

export default async function Profile({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  return (
    <div className="flex flex-col items-center gap-5 mt-8 laptop:mt-10 desktop:mt-16.5 desktop-1920:mt-21.25">
    </div>
  )
}

import type { Metadata } from 'next'

import { getDictionary, hasLocale } from '@/shared/config'
import { pagePaddings } from '@constants/styles'
import { DictionaryProvider } from '@contexts/dictionary-context'
import { QueryProvider } from '@contexts/query-client-provider'
import { Toaster } from '@ui/atoms'
import { cn } from '@utils'
import { Raleway } from 'next/font/google'
import '../globals.css'
import { notFound } from 'next/navigation'

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
  title: 'Planka',
}

export default async function RootLayout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <html lang={lang} className={`${raleway.variable} h-full antialiased`}>
      <QueryProvider>
        <body className={cn('min-h-screen flex', pagePaddings)}>
          <DictionaryProvider
            value={{
              dictionary: dict,
              locale: lang,
            }}
          >
            <Toaster />
            {children}
          </DictionaryProvider>
        </body>
      </QueryProvider>
    </html>
  )
}

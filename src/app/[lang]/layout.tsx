import type { Metadata } from 'next'

import { getDictionary, hasLocale } from '@/shared/config'
import { pagePaddings } from '@constants/styles'
import { DictionaryProvider } from '@contexts/dictionary-context'
import { QueryProvider } from '@contexts/query-client-provider'
import { ThemeProvider } from '@contexts/theme-provider'
import { Toaster } from '@ui/atoms'
import { cn } from '@utils'
import { Open_Sans, Raleway, Syncopate } from 'next/font/google'
import '../globals.css'
import { notFound } from 'next/navigation'

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin', 'cyrillic'],
})

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin', 'cyrillic'],
})

const syncopate = Syncopate({
  variable: '--font-syncopate',
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Planka',
}

export default async function RootLayout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <html
      lang={lang}
      className={`${raleway.variable} ${openSans.variable} ${syncopate.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={cn('min-h-screen flex bg-background text-text transition-colors', pagePaddings)}
      >
        <ThemeProvider>
          <QueryProvider>
            <DictionaryProvider
              value={{
                dictionary: dict,
                locale: lang,
              }}
            >
              <Toaster />
              {children}
            </DictionaryProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'

import { pagePaddings } from '@constants/styles'
import { QueryProvider } from '@contexts/query-client-provider'
import { Toaster } from '@ui/atoms'
import { cn } from '@utils'
import { Raleway } from 'next/font/google'
import '../globals.css'

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
  title: 'Planka Web',
  description: 'web app',
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {

  return (
    <html lang='ru' className={`${raleway.variable} h-full antialiased`}>
      <QueryProvider>
        <body className={cn('min-h-screen flex', pagePaddings)}>
            <Toaster />
            {children}
        </body>
      </QueryProvider>
    </html>
  )
}

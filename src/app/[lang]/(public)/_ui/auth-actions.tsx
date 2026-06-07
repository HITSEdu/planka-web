'use client'

import { useFormContext } from '@utils'
import Link from 'next/link'
import { ReactNode } from 'react'

type SubmitProps = {
  children: ReactNode
}

type LinkProps = {
  href: string
  children: ReactNode
}

const controlClass =
  'flex h-[50px] w-full items-center justify-center rounded-[18px] border-2 border-white bg-[linear-gradient(126.08deg,rgba(255,255,255,0.15)_13.84%,rgba(255,255,255,0.1)_74.14%)] px-5 text-center font-open-sans text-[24px] font-semibold leading-none text-white shadow-[0_4px_20px_1px_rgba(0,0,0,0.2)] backdrop-blur-[40px] transition hover:bg-white/20 tablet:h-[76px] tablet:text-[40px] whitespace-nowrap'

export const AuthSubmitButton = ({ children }: SubmitProps) => {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button type="submit" disabled={isSubmitting} className={controlClass}>
          {children}
        </button>
      )}
    </form.Subscribe>
  )
}

export const AuthLinkButton = ({ href, children }: LinkProps) => (
  <Link
    href={href}
    className="flex h-[38px] w-full items-center justify-center rounded-[14px] border-2 border-white/70 bg-[linear-gradient(126.08deg,rgba(255,255,255,0.15)_13.84%,rgba(255,255,255,0.1)_74.14%)] px-4 text-center font-open-sans text-[20px] font-semibold leading-none text-white/60 shadow-[0_4px_20px_1px_rgba(0,0,0,0.2)] backdrop-blur-[40px] transition hover:text-white tablet:h-[48px] tablet:text-[28px] whitespace-nowrap"
  >
    {children}
  </Link>
)

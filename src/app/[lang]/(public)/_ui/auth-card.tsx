import { cn } from '@utils'
import { ReactNode } from 'react'

type Props = {
  title: string
  className?: string
  children: ReactNode
}

export const AuthCard = ({ title, className, children }: Props) => (
  <div
    className={cn(
      'relative flex h-[456px] w-full max-w-[358px] flex-col',
      'px-6 py-[72px] tablet:h-auto tablet:max-w-[810px]',
      'tablet:px-10 tablet:py-9 desktop:px-12 desktop:py-11',
      className,
    )}
  >
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-10 rounded-[32px] border-2 border-white/45 tablet:rounded-[28px]',
        'bg-[linear-gradient(126.08deg,rgba(255,255,255,0.15)_13.84%,rgba(255,255,255,0.1)_74.14%)]',
        'shadow-[0_4px_20px_1px_rgba(0,0,0,0.2)] backdrop-blur-[40px]',
      )}
    />
    <h1 className="absolute -top-[104px] left-0 z-20 font-raleway text-[56px] font-bold leading-none text-white tablet:static tablet:mb-7 tablet:text-[78px] tablet:leading-[1.1] desktop:text-[96px]">
      {title}
    </h1>
    {children}
  </div>
)

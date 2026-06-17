import { cn } from '@utils'
import Image from 'next/image'
import { ReactNode } from 'react'

type Variant = 'login' | 'register'

type Props = {
  variant: Variant
  children: ReactNode
}

const authAssets = {
  login: {
    desktopBlue: '/assets/auth/login/blue-blur-flower.png',
    desktopWhite: '/assets/auth/login/white-form-flower.png',
    mobile: '/assets/auth/mobile/login-flower.png',
  },
  register: {
    desktopBlue: '/assets/auth/register/blue-flower.png',
    mobile: '/assets/auth/mobile/register-flower.png',
  },
} as const

const contentClasses = {
  login:
    'items-start justify-start px-4 pb-8 pt-[430px] tablet:items-center tablet:justify-end tablet:px-10 tablet:py-6 desktop:px-12',
  register:
    'items-start justify-start px-4 pb-8 pt-[430px] tablet:items-center tablet:justify-start tablet:px-10 tablet:py-6 desktop:px-16',
}

export const AuthPageShell = ({ variant, children }: Props) => (
  <section
    className={cn(
      'fixed inset-0 isolate min-h-screen overflow-y-auto overflow-x-hidden text-white tablet:overflow-hidden',
      'bg-[radial-gradient(100%_197.75%_at_100%_50%,#00114D_0%,#060606_60.1%,#0D0D0D_100%)]',
    )}
  >
    <MobileHero variant={variant} />
    {variant === 'login' ? <LoginFlowers /> : <RegisterFlowers />}
    <PlankaWord variant={variant} />
    <div className={cn('relative z-10 flex min-h-screen', contentClasses[variant])}>{children}</div>
  </section>
)

const MobileHero = ({ variant }: { variant: Variant }) => (
  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[330px] overflow-hidden tablet:hidden">
    <div className="absolute left-4 top-6 max-w-[calc(100vw-32px)] font-syncopate text-[56px] font-bold uppercase leading-none text-white">
      Planka
    </div>
    <Image
      src={variant === 'login' ? authAssets.login.mobile : authAssets.register.mobile}
      alt=""
      width={variant === 'login' ? 780 : 765}
      height={variant === 'login' ? 976 : 863}
      className={cn(
        'absolute max-w-none',
        variant === 'login'
          ? '-right-[130px] top-[72px] w-[470px]'
          : '-left-[70px] top-[88px] w-[435px]',
      )}
      priority
      unoptimized
    />
  </div>
)

const PlankaWord = ({ variant }: { variant: Variant }) => (
  <div
    className={cn(
      'pointer-events-none absolute z-40 hidden font-syncopate font-bold uppercase leading-[1.3] text-white tablet:block',
      'h-fit w-fit origin-center whitespace-nowrap',
      'text-[72px] desktop:text-[112px] desktop-1920:text-[128px]',
      variant === 'login'
        ? 'left-6 top-12 rotate-180 [writing-mode:vertical-rl] desktop:left-0'
        : 'right-[-125px] top-1/2 -translate-y-1/2 rotate-90 desktop:right-[-185px]',
    )}
  >
    Planka
  </div>
)

const LoginFlowers = () => (
  <>
    <Image
      src={authAssets.login.desktopBlue}
      alt=""
      width={590}
      height={537}
      className="pointer-events-none absolute -right-6 -top-14 z-0 hidden w-[32vw] min-w-[260px] max-w-[560px] tablet:block"
      priority
      unoptimized
    />
    <Image
      src={authAssets.login.desktopWhite}
      alt=""
      width={2255}
      height={1574}
      className="pointer-events-none absolute bottom-0 left-0 z-0 hidden w-[66vw] min-w-[760px] max-w-[1160px] tablet:block"
      priority
      unoptimized
    />
  </>
)

const RegisterFlowers = () => (
  <>
    <Image
      src={authAssets.register.desktopBlue}
      alt=""
      width={1472}
      height={832}
      className="pointer-events-none absolute -bottom-28 right-0 z-0 hidden w-[48vw] min-w-[520px] opacity-95 tablet:block"
      priority
      unoptimized
    />
  </>
)

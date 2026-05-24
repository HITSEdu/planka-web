import { Typography } from '@ui/atoms'
import { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
}

export const BlockWrapper = ({ title, children }: Props) => (
  <div
    className="flexCenter flex-col bg-primary  rounded-[20px] flex-1 w-full
   px-5 laptop:px-6 desktop:px-7.5
   py-5 laptop:py-6.5 desktop:py-11.25"
  >
    <Typography
      variant="h1"
      className="flexCenter mb-7.5 tablet:mb-9 laptop:mb-10 desktop:mb-11 desktop-1920:mb-12"
    >
      {title}
    </Typography>
    {children}
  </div>
)

import { IconProps } from './types'

type Props = IconProps & {
  onClick?: () => void
}

export const HamburgerMenu = ({ className, width = 30, height = 30, onClick }: Props) => {
  return (
    <svg
      onClick={onClick}
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 17H19M5 12H19M5 7H19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

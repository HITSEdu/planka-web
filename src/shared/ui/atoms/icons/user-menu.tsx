import { IconProps } from './types'

export const UserMenu = ({ className, width = 40, height = 40 }: IconProps) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M35 36.5C35 33.0482 30.5228 30.25 25 30.25C19.4772 30.25 15 33.0482 15 36.5M25 26.5C21.5482 26.5 18.75 23.7018 18.75 20.25C18.75 16.7982 21.5482 14 25 14C28.4518 14 31.25 16.7982 31.25 20.25C31.25 23.7018 28.4518 26.5 25 26.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

import { IconProps } from './types'

export const UsersIcon = ({ className, width = 27, height = 27 }: IconProps) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.5 20.9999C23.5 19.1422 21.7376 17.5618 19.2778 16.976M17.1667 21C17.1667 18.6436 14.3311 16.7333 10.8333 16.7333C7.33553 16.7333 4.5 18.6436 4.5 21M17.1667 13.5333C19.4985 13.5333 21.3889 11.6231 21.3889 9.26667C21.3889 6.91025 19.4985 5 17.1667 5M10.8333 13.5333C8.50146 13.5333 6.61111 11.6231 6.61111 9.26667C6.61111 6.91025 8.50146 5 10.8333 5C13.1652 5 15.0556 6.91025 15.0556 9.26667C15.0556 11.6231 13.1652 13.5333 10.8333 13.5333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

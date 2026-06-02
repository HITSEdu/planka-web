import { IconProps } from './types'

export const RussianFlag = ({ className }: IconProps) => {
  return (
    <svg
      className={className}
      width="33"
      height="19"
      viewBox="0 0 33 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_596_697)">
        <mask
          id="mask0_596_697"
          style={{ maskType: 'luminance' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="33"
          height="19"
        >
          <path d="M33 0H0V19H33V0Z" fill="white" />
        </mask>

        <g mask="url(#mask0_596_697)">
          <path d="M33 0H0V6.33657H33V0Z" fill="#F4F4F4" />
        </g>

        <mask
          id="mask1_596_697"
          style={{ maskType: 'luminance' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="33"
          height="19"
        >
          <path d="M33 0H0V19H33V0Z" fill="white" />
        </mask>

        <g mask="url(#mask1_596_697)">
          <path d="M33 6.33658H0V12.6731H33V6.33658Z" fill="#323E95" />
        </g>

        <mask
          id="mask2_596_697"
          style={{ maskType: 'luminance' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="33"
          height="19"
        >
          <path d="M33 0H0V19H33V0Z" fill="white" />
        </mask>

        <g mask="url(#mask2_596_697)">
          <path d="M33 12.6634H0V19H33V12.6634Z" fill="#D8001E" />
        </g>
      </g>

      <rect
        x="0.25"
        y="0.25"
        width="32.5"
        height="18.5"
        stroke="#3A3A3A"
        strokeOpacity="0.17"
        strokeWidth="0.5"
      />

      <defs>
        <clipPath id="clip0_596_697">
          <rect width="33" height="19" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

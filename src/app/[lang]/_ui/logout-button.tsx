import { useLogout } from '@actions/auth-actions'
import { useDictionary } from '@contexts/dictionary-context'
import { ExitIcon } from '@ui/atoms/icons'
import { cn } from '@utils'

type Props = {
  open: boolean
}

export const LogoutButton = ({ open }: Props) => {
  const dict = useDictionary().nav.logout
  const { mutate } = useLogout()

  return (
    <li
      className={
        'absolute w-full bottom-4 border-l-[3px] border-error text-error bg-error/10 cursor-pointer'
      }
    >
      <div
        onClick={() => {
          mutate()
        }}
        className={cn(
          'flex items-center withTransition gap-3 rounded-lg py-1 pl-8 hover:bg-black/5',
          !open && 'translate-x-1.75',
        )}
      >
        <span className="shrink-0">
          <ExitIcon />
        </span>

        <div
          className={cn(
            `
      overflow-hidden
      withTransition
    `,
            open ? 'opacity-100 ml-0' : 'max-w-0 opacity-0 -ml-1',
          )}
        >
          <span className="whitespace-nowrap">{dict.button}</span>
        </div>
      </div>
    </li>
  )
}

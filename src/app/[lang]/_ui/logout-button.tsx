import { useLogout } from '@actions/auth-actions'
import { useDictionary } from '@contexts/dictionary-context'
import { ExitIcon } from '@ui/atoms/icons'
import { cn } from '@utils'

export const LogoutButton = () => {
  const dict = useDictionary().nav.logout
  const { mutate } = useLogout()

  return (
    <li className="mt-auto">
      <button
        type="button"
        onClick={() => {
          mutate()
        }}
        className={cn(
          'workspace-nav-link flex h-[72px] w-full items-center gap-4 rounded-[24px] border border-transparent px-4 text-[#ff8e98]',
          'desktop:justify-center desktop:px-0',
        )}
        title={dict.button}
      >
        <span className="shrink-0 rounded-[20px] border border-current/25 p-3">
          <ExitIcon width={26} height={26} />
        </span>

        <span className="text-sm font-semibold desktop:hidden">{dict.button}</span>
      </button>
    </li>
  )
}

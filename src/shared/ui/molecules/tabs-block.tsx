'use client'

import { cn } from '@utils'
import { ReactNode, useState } from 'react'

type TabItem = {
  key: string
  label: ReactNode
  content: ReactNode
}

type Props = {
  tabs: TabItem[]
  defaultTab?: string
  className?: string
}

export function TabsBlock({ tabs, defaultTab, className }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key)

  const activeContent = tabs.find((tab) => tab.key === activeTab)?.content

  return (
    <div className={cn('w-full', className)}>
      <div className="border-divider relative flex items-center border-b">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium withTransition',
                isActive ? 'text-accent' : 'text-text-p2 hover:bg-black/5',
              )}
            >
              {tab.label}

              {isActive && <div className="bg-accent absolute right-0 -bottom-px left-0 h-0.5" />}
            </button>
          )
        })}
      </div>

      <div className="pt-4">{activeContent}</div>
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'

// Design handoff: "Petit écran: navigation, conversations et intelligence
// deviennent des vues ou tiroirs; la conversation reste prioritaire." Below
// `lg` there isn't room for the list and the open conversation side by
// side, so only one is shown at a time: the list at /inbox, the open
// conversation once a conversation is selected — matching how every real
// chat app switches views on a phone instead of cramming both into a
// shorter, squeezed stack.
function useHasSelection() {
  const pathname = usePathname()
  return /^\/inbox\/[^/]+/.test(pathname ?? '')
}

export function InboxListPane({ children }: { children: React.ReactNode }) {
  const hasSelection = useHasSelection()
  return <div className={`h-full min-h-0 ${hasSelection ? 'hidden lg:block' : 'block'}`}>{children}</div>
}

export function InboxDetailPane({ children }: { children: React.ReactNode }) {
  const hasSelection = useHasSelection()
  return <div className={`h-full min-h-0 min-w-0 ${hasSelection ? 'block' : 'hidden lg:block'}`}>{children}</div>
}

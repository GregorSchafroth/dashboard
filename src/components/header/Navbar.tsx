// src/components/header/Navbar.tsx

'use client'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { memo } from 'react'

const Navbar = memo(() => {
  const pathname = usePathname()
  const projectPath = pathname.split('/')[1]

  const navItems = [
    { path: 'transcripts', label: 'Transcripts' },
    { path: 'analytics', label: 'Analytics' },
    { path: 'knowledge', label: 'Knowledge' },
  ]

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          {navItems.map((item) => {
            const href = `/${projectPath}/${item.path}`
            return (
              <Link key={href} href={href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    pathname.startsWith(href) && 'bg-accent'
                  )}
                >
                  {item.label}
                </NavigationMenuLink>
              </Link>
            )
          })}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar
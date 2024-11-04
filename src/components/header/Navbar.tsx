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

const Navbar = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/test-project/transcripts', label: 'Transcripts' },
    { href: '/test-project/analytics', label: 'Analytics' },
    { href: '/test-project/knowledge', label: 'Knowledge' },
  ]
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === item.href && 'bg-accent'
                )}
              >
                {item.label}
              </NavigationMenuLink>
            </Link>
          ))}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
export default Navbar

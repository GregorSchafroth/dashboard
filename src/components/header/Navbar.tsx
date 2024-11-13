// src/components/header/Navbar.tsx
'use client'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { Menu } from 'lucide-react'

const Navbar = memo(() => {
  const pathname = usePathname()
  const projectPath = pathname.split('/')[1]
  const { language } = useLanguage()

  const navItems = [
    { path: 'transcripts', label: translations[language].nav.transcripts },
    { path: 'analytics', label: translations[language].nav.analytics },
    { path: 'knowledge', label: translations[language].nav.knowledge },
  ]

  // Mobile dropdown menu
  const MobileMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2">
        <Menu className="size-12" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {navItems.map((item) => {
          const href = `/${projectPath}/${item.path}`
          return (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} className={cn(
                'w-full px-4 py-2',
                pathname.startsWith(href) && 'bg-accent'
              )}>
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Desktop menu
  const DesktopMenu = () => (
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
                    pathname.startsWith(href) && 'bg-accent',
                    'text-base lg:text-lg xl:text-xl'
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

  return (
    <>
      <div className="block md:hidden">
        <MobileMenu />
      </div>
      <div className="hidden md:block">
        <DesktopMenu />
      </div>
    </>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar
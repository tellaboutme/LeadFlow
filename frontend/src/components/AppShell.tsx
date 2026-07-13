import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, LayoutList, Menu, Settings, Sparkles } from 'lucide-react'
import { HealthBadge } from './HealthBadge'
import { IntegrationBadges } from './IntegrationBadges'
import { PageTransition } from './PageTransition'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTitle } from './ui/sheet'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/leads', label: 'Leads', icon: LayoutList, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return [
    'flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground'
      : 'border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  ].join(' ')
}

function iconClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'size-4 text-sidebar-primary' : 'size-4'
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 p-3">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={navLinkClassName} onClick={onNavigate}>
          {({ isActive }) => (
            <>
              <Icon className={iconClassName({ isActive })} aria-hidden />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-6 py-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/15 text-sidebar-primary">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight">LeadFlow AI</span>
    </div>
  )
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <Brand />
        <div className="border-t border-sidebar-border" />
        <NavList />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          <span className="shrink-0 text-lg font-semibold tracking-tight md:hidden">LeadFlow AI</span>
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <IntegrationBadges />
            </div>
            <HealthBadge />
          </div>
        </header>

        <main className="flex-1 p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle asChild>
            <div className="flex items-center gap-2 px-6 py-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/15 text-sidebar-primary">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <span className="text-lg font-semibold tracking-tight">LeadFlow AI</span>
            </div>
          </SheetTitle>
          <div className="border-t border-sidebar-border" />
          <NavList onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Users, 
  Inbox, 
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

const sidebarItems = [
  {
    title: "Daily Operations",
    items: [
      {
        title: "Command Center",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Capture Inbox",
        href: "/inbox",
        icon: Inbox,
      },
    ]
  },
  {
    title: "Strategic Planning",
    items: [
      {
        title: "Sprint Planning",
        href: "/planning",
        icon: Brain,
      },
      {
        title: "Task Board",
        href: "/tasks",
        icon: CheckSquare,
      },
      {
        title: "Strategic Priorities",
        href: "/goals",
        icon: TrendingUp,
      },
      {
        title: "Stakeholders",
        href: "/stakeholders",
        icon: Users,
      },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useStore()

  return (
    <aside className={cn(
      "hidden lg:flex flex-col border-r bg-muted/10 h-screen sticky top-0 transition-all duration-300 ease-in-out z-30",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "p-6 border-b bg-background/50 backdrop-blur flex items-center justify-between",
        sidebarCollapsed && "p-4 justify-center"
      )}>
        <Link href="/" className="flex items-center gap-2 font-black italic uppercase tracking-tighter">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground not-italic shrink-0">
            <Zap className="size-5 fill-current" />
          </div>
          {!sidebarCollapsed && <span className="truncate">{siteConfig.name}</span>}
        </Link>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
        <TooltipProvider delayDuration={0}>
          {sidebarItems.map((section, i) => (
            <div key={i} className="px-3 py-2 mb-4">
              {!sidebarCollapsed && (
                <h2 className="mb-2 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
                  {section.title}
                </h2>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all group relative",
                          pathname === item.href 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          sidebarCollapsed && "justify-center px-0 w-12 mx-auto"
                        )}
                      >
                        <item.icon className={cn(
                          "size-5 shrink-0 transition-colors",
                          pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                        {sidebarCollapsed && pathname === item.href && (
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                        )}
                      </Link>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right" className="font-bold">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>

      <div className="p-4 border-t bg-background/30 space-y-4">

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="w-full h-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-all rounded-xl"
        >
          {sidebarCollapsed ? <ChevronRight className="size-5" /> : (
            <div className="flex items-center gap-2 w-full px-2">
              <ChevronLeft className="size-5" />
              <span className="text-xs font-semibold">Collapse Menu</span>
            </div>
          )}
        </Button>
      </div>
    </aside>
  )
}

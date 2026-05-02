import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Sidebar } from '@/components/sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}

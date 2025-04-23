import { ReactNode, useEffect } from 'react'
import { Link } from '@inertiajs/react'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Grid, Bell, User, LogOut, HelpCircle, MessageSquare } from 'lucide-react'
import SearchInput from '../../components/search/search_input'

export default function MainLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Load feather icons
    import('feather-icons').then((feather) => feather.replace())
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-16 bg-custom-darkGray shadow-lg">
        <div>
          <span className="text-white text-[60px] font-bold">
            Forum<span className="text-[#FF9900]">GW</span>
          </span>
        </div>

        <SearchInput />

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-[#222222] hover:bg-[#333333]">
            <Grid className="text-[#FF9900] h-5 w-5" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-[#222222] hover:bg-[#333333]"
            >
              <Bell className="text-[#FF9900] h-5 w-5" />
              <span className="absolute top-0 right-0 bg-[#FF9900] text-black rounded-full px-1.5 py-0.5 text-xs font-bold">
                0
              </span>
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-[#222222] hover:bg-[#333333]" asChild>
            <Link href="/user">
              <User className="text-[#FF9900] h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[190px] h-[calc(200vh-5rem)] bg-black flex flex-col items-start py-6">
          <div className="flex flex-col gap-[15px] w-full">
            <NavLink href="/users" icon={<User className="text-[#FF9900] w-5 h-10" />}>Users</NavLink>
            <NavLink href="/posts" icon={<MessageSquare className="text-[#FF9900] w-5 h-5" />}>Posts</NavLink>
            <NavLink href="/modules" icon={<Grid className="text-[#FF9900] w-5 h-5" />}>Module</NavLink>
            <NavLink href="/feedback" icon={<HelpCircle className="text-[#FF9900] w-5 h-5" />}>Feedback</NavLink>
            <NavLink href="/logout" icon={<LogOut className="text-[#FF9900] w-5 h-5" />}>Logout</NavLink>
            <Separator className="bg-gray-600 my-2" />
          </div>
        </aside>

        {/* Main Page Content */}
        <main className="flex-1 p-8 bg-black">{children}</main>
      </div>
    </div>
  )
}

function NavLink({ href, children, icon }: { href: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className="w-full h-[38px] justify-start text-white bg-[#333333] hover:bg-gray-800 hover:text-white px-4 py-2"
      >
        <span className="mr-3">{icon}</span>
        {children}
      </Button>
    </Link>
  )
}
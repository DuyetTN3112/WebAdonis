import { ReactNode, useEffect } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Grid, Bell, User, LogOut, HelpCircle, MessageSquare, Home, Mail, Hash } from 'lucide-react'
import '../../css/layout.css'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { auth, csrfToken } = usePage().props

  useEffect(() => {
    import('feather-icons').then((feather) => feather.replace())
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <meta name="csrf-token" content={csrfToken as string} />
      <meta name="x-csrf-token" content={csrfToken as string} />
      <header className="flex items-center justify-between px-4 h-16 bg-[#222222] shadow-lg">
        <div>
          <span className="text-white text-5xl font-bold">
            Forum<span className="text-[#FF9900]">GW</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-grow max-w-2xl mx-auto">
          <input 
            type="text" 
            placeholder="Search on ForumGW" 
            className="w-full py-2 px-4 pl-10 bg-black text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-lg"
          />
          <Grid className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9900] w-5 h-5" />
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <button className="rounded-full bg-[#222222] hover:bg-[#333333] p-3 flex items-center justify-center">
            <Grid className="text-[#FF9900] h-5 w-5" />
          </button>
          <div className="relative">
            <button className="rounded-full bg-[#222222] hover:bg-[#333333] p-3 flex items-center justify-center">
              <Bell className="text-[#FF9900] h-5 w-5" />
              <span className="absolute top-0 right-0 bg-[#FF9900] text-black rounded-full px-1.5 py-0.5 text-xs font-bold">
                0
              </span>
            </button>
          </div>
          <Link href="/profile" className="rounded-full bg-[#222222] hover:bg-[#333333] p-3 flex items-center justify-center">
            <User className="text-[#FF9900] h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 h-[calc(100vh-4rem)] bg-black flex flex-col items-start py-6 space-y-4">
          <SidebarItem href="/" icon={<Home className="text-[#FF9900] w-5 h-5" />} label="Home" />
          <SidebarItem href="/users" icon={<User className="text-[#FF9900] w-5 h-5" />} label="Users" />
          <SidebarItem href="/posts" icon={<MessageSquare className="text-[#FF9900] w-5 h-5" />} label="Posts" />
          <SidebarItem href="/modules" icon={<Hash className="text-[#FF9900] w-5 h-5" />} label="Module" />
          <SidebarItem href="/feedback" icon={<Mail className="text-[#FF9900] w-5 h-5" />} label="Feedback" />
          <SidebarLogoutButton icon={<LogOut className="text-[#FF9900] w-5 h-5" />} label="Logout" />
        </aside>

        {/* Main Page Content */}
        <main className="flex-1 p-8 bg-black">{children}</main>
      </div>
    </div>
  )
}

function SidebarItem({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link href={href} className="ml-4 w-48">
      <div className="sidebar-item flex items-center space-x-4 rounded-full bg-[#222222] p-3 hover:bg-[#FF9900] transition duration-200 group">
        <div className="w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm text-white group-hover:text-black">{label}</span>
      </div>
    </Link>
  )
}

function SidebarLogoutButton({ label, icon }: { label: string; icon: ReactNode }) {
  const { csrfToken } = usePage().props
  
  return (
    <form action="/logout" method="POST" className="ml-4 w-48">
      <input type="hidden" name="_csrf" value={csrfToken as string} />
      <button
        type="submit"
        className="sidebar-item w-full flex items-center space-x-4 rounded-full bg-[#222222] p-3 hover:bg-[#FF9900] transition duration-200 group"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm text-white group-hover:text-black">{label}</span>
      </button>
    </form>
  )
}
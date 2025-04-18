import { ReactNode, useEffect } from 'react'
import { Link } from '@inertiajs/react'

export default function MainLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Load feather icons
    import('feather-icons').then((feather) => feather.replace())
  }, [])

  return (
    <div className="bg-custom-black text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-16 bg-custom-darkGray shadow-lg">
        <div>
          <span className="text-white text-5xl font-bold">
            Forum<span className="text-custom-orange">GW</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-grow max-w-2xl mx-auto">
          <input
            id="search"
            type="text"
            placeholder="Search on ForumGW"
            className="w-full py-2 px-4 pl-10 bg-custom-black text-white rounded-full focus:outline-none focus:ring-2 focus:ring-custom-orange text-lg"
          />
          <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-orange w-5 h-5" />
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-custom-darkGray p-3 hover:bg-custom-mediumGray">
            <i data-feather="grid" className="text-custom-orange" />
          </div>
          <div className="rounded-full bg-custom-darkGray p-3 hover:bg-custom-mediumGray cursor-pointer">
            <i data-feather="bell" className="text-custom-orange" />
            <span className="notification-count">0</span>
          </div>
          <div className="rounded-full bg-custom-darkGray p-3 hover:bg-custom-mediumGray">
            <i data-feather="user" className="text-custom-orange" />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 h-full bg-custom-black flex flex-col py-6 space-y-4">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/users">Users</NavLink>
          <NavLink href="/posts">Posts</NavLink>
          <NavLink href="/modules">Module</NavLink>
          <NavLink href="/feedback">Feedback</NavLink>
          <NavLink href="/logout">Logout</NavLink>
        </aside>

        {/* Main Page Content */}
        <main className="flex-1 p-8 bg-custom-black">{children}</main>
      </div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="sidebar-item flex items-center space-x-4 rounded-full bg-custom-darkGray p-3 hover:bg-custom-orange transition w-48 ml-4"
    >
      <span className="text-sm">{children}</span>
    </Link>
  )
}

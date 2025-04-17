import { Link } from '@inertiajs/react'
import { Home, Users, FilePlus, Hash, Mail, LogOut } from 'lucide-react'
import { Button } from '@/lib/ui/button'

export default function Sidebar() {
  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/users', icon: Users, label: 'Users' },
    { href: '/posts', icon: FilePlus, label: 'Posts' },
    { href: '/modules', icon: Hash, label: 'Module' },
    { href: '/feedback', icon: Mail, label: 'Feedback' },
    { href: '/logout', icon: LogOut, label: 'Logout' },
  ]

  return (
    <aside className="w-64 h-screen bg-black flex flex-col py-6 space-y-2">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant="ghost"
            className="w-48 h-12 justify-start space-x-4 rounded-full bg-gray-900 hover:bg-orange-500 hover:text-black"
          >
            <item.icon className="w-5 h-5 text-orange-500" />
            <span>{item.label}</span>
          </Button>
        </Link>
      ))}
    </aside>
  )
}
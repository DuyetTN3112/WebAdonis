import { Link } from '@inertiajs/react'
import { Input } from '@/lib/ui/input'
import { Button } from '@/lib/ui/button'
import { Bell, Grid, Search, User } from 'lucide-react'
// import NotificationPanel from './notification_panel'
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/ui/popover'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 h-16 bg-gray-900 shadow-lg">
      <div>
        <span className="text-white text-3xl font-bold">
          Forum<span className="text-orange-500">GW</span>
        </span>
      </div>

      <div className="relative flex-grow max-w-2xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search on ForumGW"
            className="w-full pl-10 bg-gray-800 text-white rounded-full border-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-700">
          <Grid className="text-orange-500" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-700 relative">
              <Bell className="text-orange-500" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 bg-black border-orange-500">
            {/* <NotificationPanel /> */}
          </PopoverContent>
        </Popover>

        <Link href="/user">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-700">
            <User className="text-orange-500" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
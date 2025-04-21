import { ReactNode, useEffect } from 'react'
import { Link } from '@inertiajs/react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Separator } from '../../components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Search, Grid, Bell, User, LogOut, Settings, HelpCircle, MessageSquare } from 'lucide-react'

export default function MainLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Load feather icons
    import('feather-icons').then((feather) => feather.replace())
    
  }, [])

  return (
    <div className="bg-custom-black text-white min-h-screen flex flex-col">
      {/* Header */}
      <Card className="flex items-center justify-between px-4 h-16 bg-custom-darkGray border-none rounded-none">
        <div>
          <span className="text-white text-5xl font-bold">
            Forum<span className="text-custom-orange">GW</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-grow max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Search on ForumGW"
            className="w-full py-2 px-4 pl-10 bg-custom-black text-white rounded-full focus:outline-none focus:ring-2 focus:ring-custom-orange text-lg"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-orange w-5 h-5" />
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-custom-darkGray hover:bg-custom-mediumGray">
                  <Grid className="text-custom-orange" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View all modules</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-custom-darkGray hover:bg-custom-mediumGray relative">
                  <Bell className="text-custom-orange" />
                  <Badge variant="secondary" className="absolute -top-1 -right-1 bg-custom-orange">0</Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-custom-darkGray">
                  <User className="text-custom-orange" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-custom-darkGray border-custom-gray">
              <DropdownMenuItem className="text-white hover:bg-custom-mediumGray">
                <User className="mr-2 h-4 w-4 text-custom-orange" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-custom-mediumGray">
                <Settings className="mr-2 h-4 w-4 text-custom-orange" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-custom-mediumGray">
                <HelpCircle className="mr-2 h-4 w-4 text-custom-orange" />
                <span>Help</span>
              </DropdownMenuItem>
              <Separator className="bg-custom-gray" />
              <DropdownMenuItem className="text-white hover:bg-custom-mediumGray">
                <LogOut className="mr-2 h-4 w-4 text-custom-orange" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Card className="w-64 h-full bg-custom-black border-none rounded-none flex flex-col py-6">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <NavLink href="/users" icon={<User className="mr-2 h-4 w-4" />}>Users</NavLink>
              <NavLink href="/posts" icon={<MessageSquare className="mr-2 h-4 w-4" />}>Posts</NavLink>
              <NavLink href="/modules" icon={<Grid className="mr-2 h-4 w-4" />}>Module</NavLink>
              <NavLink href="/feedback" icon={<HelpCircle className="mr-2 h-4 w-4" />}>Feedback</NavLink>
              <Separator className="bg-custom-gray my-4" />
              <NavLink href="/logout" icon={<LogOut className="mr-2 h-4 w-4" />}>Logout</NavLink>
            </div>
          </ScrollArea>
        </Card>

        {/* Main Page Content */}
        <main className="flex-1 p-8 bg-custom-black">{children}</main>
      </div>
    </div>
  )
}
function NavLink({ href, children, icon }: { href: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className="w-48 ml-4 justify-start text-sm hover:bg-custom-orange"
      >
        {icon}
        {children}
      </Button>
    </Link>
  )
}


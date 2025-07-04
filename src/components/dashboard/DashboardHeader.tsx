
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Search, Bell, HelpCircle } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b bg-white/50 backdrop-blur-sm px-4 sm:px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-gray-100 transition-colors" />
        <div className="hidden md:flex">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search tools..." 
            className="pl-10 w-48 md:w-64 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 p-1 sm:p-2">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Help */}
        <Button variant="ghost" size="sm" className="hover:bg-gray-100 hidden sm:flex p-1 sm:p-2">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-blue-100 hover:ring-blue-200 transition-all p-0">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src="/avatars/01.png" alt="@user" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  U
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Demo User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  demo@quickdocs.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-red-50 text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}


"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, Download, Plus, Search, Check, Users } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { users, User } from "@/lib/data";

interface HeaderProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
}


export function Header({ date, onDateChange }: HeaderProps) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: addDays(new Date(2024, 0, 20), 30),
  });

  const [currentUser, setCurrentUser] = React.useState<User>(users[0]);

  React.useEffect(() => {
    const userId = localStorage.getItem('currentUser') || users[0].id;
    const user = users.find(u => u.id === userId) || users[0];
    setCurrentUser(user);
    if (!localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', user.id);
    }
  }, []);

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        localStorage.setItem('currentUser', userId);
        setCurrentUser(user);
        // Force a reload to reflect the data changes for the new user
        window.location.reload();
    }
  };

  const displayDate = date ?? internalDate;
  const setDisplayDate = onDateChange ?? setInternalDate;


  return (
    <header className="flex-shrink-0 flex items-center h-16 px-4 md:px-6 border-b">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden"/>
        <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 w-full md:w-[200px] lg:w-[300px] rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {onDateChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !displayDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {displayDate?.from ? (
                  displayDate.to ? (
                    <>
                      {format(displayDate.from, "LLL dd, y")} -{" "}
                      {format(displayDate.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(displayDate.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={displayDate?.from}
                selected={displayDate}
                onSelect={setDisplayDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
                <Link href="/customers/new">Add New Customer</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/deals/new">Add New Deal</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="person avatar"/>
                  <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuRadioGroup value={currentUser.id} onValueChange={handleUserChange}>
                <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users.map(user => (
                  <DropdownMenuRadioItem key={user.id} value={user.id} className="flex items-center gap-2">
                    <Users className="h-4 w-4"/>
                    <span>{user.name} ({user.role})</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Profile</DropdownMenuItem>
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  );
}

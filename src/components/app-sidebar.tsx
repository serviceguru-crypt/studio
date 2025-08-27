

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Briefcase, BarChart, Settings, LifeBuoy, Calendar, Building, UserPlus, Users2 } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { getCompanyProfile, getCurrentUser } from '@/lib/data';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/leads', label: 'Leads', icon: UserPlus },
  { href: '/analytics', label: 'Analytics', icon: BarChart },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState('N-CRM');
  const [companyLogo, setCompanyLogo] = useState('');
  const [userTier, setUserTier] = useState<string | undefined>('');


  useEffect(() => {
    async function loadProfile() {
        const user = getCurrentUser();
        // Only fetch profile if a user is actually logged in.
        // This prevents auth errors on page load.
        if (user) { 
            setUserTier(user.tier);
            const profile = await getCompanyProfile();
            if(profile) {
                setCompanyName(profile.name);
                setCompanyLogo(profile.logo);
            }
        }
    }
    loadProfile();
  }, [pathname]); // Re-run on navigation to update if needed

  const showTeamManagement = userTier === 'Pro' || userTier === 'Enterprise';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={companyLogo || undefined} alt={companyName} />
                <AvatarFallback>
                    <Briefcase className="h-5 w-5 text-primary"/>
                </AvatarFallback>
            </Avatar>
            <span className="font-bold text-xl group-data-[collapsible=icon]:hidden">{companyName}</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={{children: item.label, side:"right"}}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           {showTeamManagement && (
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/team')} tooltip={{children: 'Team', side:"right"}}>
                <Link href="/team">
                  <Users2 />
                  <span>Team</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
           )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: "Profile", side:"right"}} asChild>
                    <Link href="/profile">
                        <Building/>
                        <span>Profile</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: "Settings", side:"right"}}>
                    <Settings/>
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

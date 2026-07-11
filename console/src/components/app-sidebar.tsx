import * as React from "react"
import { Building2, GalleryVerticalEnd, LayoutDashboard } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Qike Console",
    email: "客户管理后台",
    avatar: "",
  },
  teams: [
    {
      name: "Qike",
      logo: GalleryVerticalEnd,
      plan: "Console",
    },
  ],
  navMain: [
    {
      title: "工作台",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "客户管理",
      url: "/customers",
      icon: Building2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

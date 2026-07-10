"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { ChevronRight, LogOut, Settings, Users, Home, BarChart, MessageSquare, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Logo from "@/public/merchpulse_logo.png"
import { convertRouteTreeToFlightRouterState } from "next/dist/client/components/segment-cache/cache"

// dynamic sidebar
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  function deleteAllCookies() {
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    deleteAllCookies()
    router.push("/login")
    router.refresh()
  }

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      setRole(parsed.role.name)
      setUserName(parsed.name)
    }
  }, [])

  // define sidebar sections based on role
  const common = [
    {
      title: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      items: [
        { title: "Overview", url: role === "Admin" ? "/admin" : role === "Merchandiser" ? "/merchandiser" : "/" },
      ],
    },
    {
      title: "Communication",
      icon: <MessageSquare className="h-4 w-4" />,
      items: [
        { title: "Messages", url: "/messages" },
      ],
    },
    {
      title: "Profile",
      icon: <Settings className="h-4 w-4" />,
      items: [
        { title: "Edit Profile", url: "/profile" },
      ],
    },
  ]

  const admin = [
    {
      title: "Admin Tools",
      icon: <BarChart className="h-4 w-4" />,
      items: [
        { title: "KPI Dashboard", url: "/admin/" },
        { title: "Records", url: "/admin/records" },
      ],
    },
    {
      title: "User Management",
      icon: <Users className="h-4 w-4" />,
      items: [
        { title: "All Users", url: "/admin/users" },
        { title: "Add New User", url: "/admin/register" },
      ],
    },
  ]

  const Merchandiser = [
    {
      title: "Merchandiser Tools",
      icon: <BarChart className="h-4 w-4" />,
      items: [
        { title: "Add New KPI", url: "/kpi/merchandising" },
        { title: "View KPI", url: "/kpi" },
      ],
    },
  ]

  // merge according to role
  let navData = [...common]
  if (role === "Admin") navData = [...common, ...admin]
  else if (role === "Merchandiser") navData = [...Merchandiser, ...common]
  else navData = [...common]

  return (
    <Sidebar
      {...props}
      className="border-r border-sidebar-border/50 bg-sidebar"
    >
      <SidebarHeader className="py-6 px-5">
        <div className="flex items-center gap-2.5 transition-all duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            Merch<span className="text-primary">Pulse</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 pt-2">
        {navData.map((group) => (
          <Collapsible key={group.title} className="group/collapsible" defaultOpen>
            <SidebarGroup className="p-0 mb-2">
              <SidebarGroupLabel
                asChild
                className="h-8 px-3 text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors duration-200"
              >
                <CollapsibleTrigger>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tracking-wider uppercase text-[9px]">{group.title}</span>
                  </div>
                  <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 opacity-20" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent className="pt-1 px-1">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          onClick={() => {
                            router.push(item.url)
                            router.refresh()
                          }}
                          className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 rounded-md group/item px-3"
                        >
                          <a className="flex items-center gap-3 py-2">
                            <span className="shrink-0 text-sidebar-foreground/40 group-hover/item:text-primary transition-colors">
                              {group.icon}
                            </span>
                            <span className="text-[13px] font-medium">{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <div className="mt-auto p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/30 border border-sidebar-border/20">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {userName?.[0] || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-sidebar-foreground truncate leading-tight">{userName || "User"}</span>
            <span className="text-[10px] text-sidebar-foreground/50 font-medium">Internal Panel</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/5 active:scale-[0.98] transition-all duration-200 rounded-lg text-xs font-medium group"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign out</span>
        </button>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}

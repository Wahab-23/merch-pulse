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
      className="border-r-0"
      style={{
        "--sidebar": "#414148ff",
        "--sidebar-foreground": "#f8fafc",
        "--sidebar-accent": "#18181b",
        "--sidebar-accent-foreground": "#facc15",
        "--sidebar-border": "rgba(255,255,255,0.05)",
        "--sidebar-ring": "#facc15"
      } as React.CSSProperties}
    >
      <SidebarHeader className="border-b border-white/5 py-5 px-4">
        <div className="flex items-center gap-3 transition-all duration-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <TrendingUp className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Merch<span className="text-yellow-500">Pulse</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-2 px-3 pt-6">
        {navData.map((group) => (
          <Collapsible key={group.title} className="group/collapsible" defaultOpen>
            <SidebarGroup className="p-0 mb-4">
              <SidebarGroupLabel
                asChild
                className="h-9 px-3 text-slate-500/80 hover:text-white transition-colors duration-200"
              >
                <CollapsibleTrigger>
                  <div className="flex items-center gap-2.5">
                    <span className="text-yellow-500/60 group-hover/collapsible:text-yellow-500 transition-colors">{group.icon}</span>
                    <span className="font-bold tracking-widest uppercase text-[10px]">{group.title}</span>
                  </div>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 opacity-40" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent className="pt-1.5 ml-3 border-l border-white/5">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          onClick={() => {
                            router.push(item.url)
                            router.refresh()
                          }}
                          className="w-full text-slate-400 hover:text-yellow-400 hover:bg-white/[0.03] transition-all duration-200 rounded-lg group/item"
                        >
                          <a className="flex items-center p-2.5 pl-4 relative">
                            <span className="text-[13px] font-medium leading-none">{item.title}</span>
                            <div className="absolute right-2 w-1 h-1 rounded-full bg-yellow-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
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
      <div className="mt-auto p-4 border-t border-white/5 bg-black/40">
        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-white/[0.03] border border-white/5 ring-1 ring-white/[0.02]">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-sm font-bold text-black border border-white/10 shadow-lg shadow-black/20">
            {userName?.[0] || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate leading-none mb-1">{userName || "User"}</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">MerchPulse Internal</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:scale-[0.98] transition-all duration-200 rounded-xl text-xs font-bold group border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Sign out session
        </button>
      </div>
      <SidebarRail className="hover:after:bg-yellow-500/50" />
    </Sidebar>
  )
}

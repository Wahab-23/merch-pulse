"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { ChevronRight, LogOut, Settings, Users, Home, BarChart, MessageSquare } from "lucide-react"
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
import Logo from "@/public/ishopping.png"

// dynamic sidebar
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

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
  }

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      setRole(parsed.role.name)
    }
  }, [])

  // define sidebar sections based on role
  const common = [
    {
      title: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      items: [
        { title: "Overview", url: "/" },
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
    <Sidebar {...props}>
      <SidebarHeader>
        <Image
          src={Logo}
          width={180}
          height={50}
          alt="logo"
          className="mx-auto mb-2 mt-2 w-auto h-auto"
          loading="eager"
        />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {navData.map((group) => (
          <Collapsible key={group.title} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
              >
                <CollapsibleTrigger>
                  <div className="flex items-center gap-2">
                    {group.icon}
                    {group.title}
                  </div>
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          onClick={() => router.push(item.url)}
                          className="cursor-pointer"
                        >
                          <a className="border-l border-gray-700 p-2 ml-4 rounded-none">{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-sidebar-border bg-sidebar">
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="inline-block mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

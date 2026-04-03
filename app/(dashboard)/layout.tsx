import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notification-bell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 bg-white/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 p-2 xl:p-6 overflow-y-auto bg-gray-50/50">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
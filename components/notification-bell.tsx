"use client";

import { useEffect, useState } from "react";
import { Bell, MessageSquare } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const fetchNotificationData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // 1. Fetch unread count
      const countRes = await fetch("/api/messages/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const countData = await countRes.json();
      if (typeof countData.unreadCount === "number") {
        setUnreadCount(countData.unreadCount);
      }

      // 2. Fetch recent conversations for the flyout
      const convRes = await fetch("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (convRes.ok) {
        const convData = await convRes.json();
        setRecentConversations(convData.slice(0, 5)); // Just show top 5
      }
    } catch (err) {
      console.error("Failed to fetch notification data", err);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id);
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
    fetchNotificationData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channelName = `chat-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (message: any) => {
      // Refresh data on new message
      fetchNotificationData();

      if (pathname !== "/messages") {
        toast.info(`New message from ${message.sender.name}`, {
          description: message.content || "Sent an attachment",
          action: {
            label: "View",
            onClick: () => router.push("/messages"),
          },
        });
      }
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [userId, pathname, router]);

  // Reset count if user is on messages page
  useEffect(() => {
    if (pathname === "/messages") {
      setUnreadCount(0);
    }
  }, [pathname]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-300 group outline-none">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-2 bg-white/95 backdrop-blur-xl border-slate-100 shadow-2xl rounded-2xl animate-in slide-in-from-top-2">
        <DropdownMenuLabel className="px-4 py-3 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Intelligence Brief</span>
          {unreadCount > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-none text-[9px] font-black">
              {unreadCount} NEW
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-50" />

        <div className="max-h-[400px] overflow-y-auto py-1 custom-scrollbar">
          {recentConversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-5 w-5 text-slate-200" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent transmissions</p>
            </div>
          ) : (
            recentConversations.map((conv) => (
              <DropdownMenuItem
                key={conv.user.id}
                onClick={() => router.push("/messages")}
                className="px-4 py-3 cursor-pointer rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-4 mb-1 border border-transparent hover:border-slate-100 focus:bg-slate-50 outline-none"
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border border-white shadow-sm">
                    {conv.user.name[0]}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-yellow-500 rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-[13px] tracking-tight truncate ${conv.unreadCount > 0 ? "font-black text-slate-900" : "font-bold text-slate-600"}`}>
                      {conv.user.name}
                    </p>
                    <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">
                      {new Date(conv.lastMessage.createdAt).getHours()}:
                      {String(new Date(conv.lastMessage.createdAt).getMinutes()).padStart(2, '0')}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate leading-tight ${conv.unreadCount > 0 ? "font-bold text-slate-700" : "text-slate-400"}`}>
                    {conv.lastMessage.content || "Attached a file"}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-50" />

        <DropdownMenuItem asChild className="p-0">
          <Link
            href="/messages"
            className="w-full py-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 hover:bg-yellow-50/50 transition-colors"
          >
            Open Comm Center
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

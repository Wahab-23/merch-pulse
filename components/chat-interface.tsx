"use client";

import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { Send, Paperclip, Loader2, FileIcon, Smile, BellRing, TrendingUp, User, Globe, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import EmojiPicker, { Theme } from "emoji-picker-react";

export function ChatInterface({ users, currentUserId }: { users: any[], currentUserId: number }) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  const bottomRef = useRef<HTMLDivElement>(null);
  const selectedUserRef = useRef(selectedUser);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const channelName = `chat-${currentUserId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMsg: any) => {
      const activePartner = selectedUserRef.current;
      if (activePartner && (newMsg.senderId === activePartner.id || newMsg.senderId === currentUserId)) {
        setMessages((prev) => {
          if (!prev.find((m) => m.id === newMsg.id)) {
            return [...prev, newMsg];
          }
          return prev;
        });
      }

      if (newMsg.senderId !== currentUserId && (!activePartner || newMsg.senderId !== activePartner.id)) {
        setUnreadCounts((prev) => ({
          ...prev,
          [newMsg.senderId]: (prev[newMsg.senderId] || 0) + 1
        }));

        if ("Notification" in window && Notification.permission === "granted") {
          const senderName = users.find(u => u.id === newMsg.senderId)?.name || "Someone";
          new Notification(`New message from ${senderName}`, {
            body: newMsg.content || "Sent you a file attachment",
            icon: "/favicon.ico"
          });
        }
      }
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [currentUserId, users]);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    setUnreadCounts((prev) => ({ ...prev, [selectedUser.id]: 0 }));

    const fetchHistory = async () => {
      const storedToken = localStorage.getItem("token");
      try {
        const res = await fetch(`/api/messages?receiverId=${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedUser]);

  const handleSend = async () => {
    if (!selectedUser || loading || isUploading) return;
    if (!inputVal.trim() && !file) return;

    setShowEmoji(false);
    let finalFileUrl = "";
    let finalFileName = "";
    let finalFileSize = 0;
    const storedToken = localStorage.getItem("token");

    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("File must be 20mb or less!");
        return;
      }
      setIsUploading(true);
      const fd = new FormData();
      fd.append("file", file);

      try {
        const upRes = await fetch("/api/upload-message-file", {
          method: "POST",
          headers: { Authorization: `Bearer ${storedToken}` },
          body: fd,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error);
        finalFileUrl = upData.url;
        finalFileName = upData.fileName;
        finalFileSize = upData.fileSize;
      } catch (e: any) {
        alert(e.message || "Upload failed");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`
        },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: inputVal,
          fileUrl: finalFileUrl,
          fileName: finalFileName,
          fileSize: finalFileSize
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data]);
        setInputVal("");
        setFile(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setInputVal((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-100 bg-slate-50/10 backdrop-blur-xl flex flex-col z-10">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.2)] animate-pulse" />
            <span className="text-sm font-black tracking-[0.2em] uppercase text-slate-800">Operatives</span>
          </div>
          {Object.values(unreadCounts).some(i => i > 0) && (
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-ping" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
          {users.map(u => {
            const hasUnread = unreadCounts[u.id] > 0;
            const isSelected = selectedUser?.id === u.id;
            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 ${isSelected ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-slate-400/[0.02]"}`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-black transition-all border ${isSelected ? "bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/10 scale-105" : "bg-white text-slate-400 border-slate-100"}`}>
                  {u.name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm tracking-tight truncate ${isSelected || hasUnread ? "text-slate-900 font-bold" : "text-slate-600 font-medium"}`}>
                    {u.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                    {u.role?.name || "Member"}
                  </div>
                </div>

                {hasUnread && !isSelected && (
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                )}

                {isSelected && (
                  <div className="absolute left-0 w-1 h-6 bg-yellow-500 rounded-r-full shadow-[0_0_10px_rgba(234,179,8,0.2)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/50 relative z-10 overflow-hidden">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100">
              <MessageCircle className="h-10 w-10 opacity-20" />
            </div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase">Secure Channel Offline</p>
          </div>
        ) : (
          <>
            <div className="h-24 px-8 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black shadow-lg shadow-yellow-500/10">
                  {selectedUser.name[0]}
                </div>
                <div>
                  <h3 className="text-slate-900 font-black tracking-tight leading-none mb-1">{selectedUser.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Link</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar scroll-smooth bg-slate-50/[0.3]">
              {loading && messages.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 border-2 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin" />
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUserId ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`group relative max-w-[75%] p-4 shadow-xl shadow-slate-200/[0.15] transition-all ${msg.senderId === currentUserId
                      ? "bg-yellow-400 text-black rounded-2xl rounded-tr-none"
                      : "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none"
                      }`}>
                      {msg.content && <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                      {msg.fileUrl && (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center p-3 mt-3 rounded-xl transition-all border ${msg.senderId === currentUserId
                          ? "bg-white/5 border-white/5 hover:bg-white/10 text-white"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800"
                          }`}>
                          <FileIcon className="h-4 w-4 mr-3 text-yellow-500" />
                          <span className="text-xs truncate font-bold tracking-tight">{msg.fileName}</span>
                        </a>
                      )}

                      <div className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-30 ${msg.senderId === currentUserId ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className="p-8 relative bg-white border-t border-slate-100">

              {showEmoji && (
                <div className="absolute bottom-[110px] left-8 overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                  <EmojiPicker theme={Theme.LIGHT} onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} />
                </div>
              )}

              {file && (
                <div className="absolute bottom-[110px] left-8 right-8 bg-white border border-yellow-500 p-3 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-4 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <FileIcon className="h-4 w-4 text-yellow-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[300px]">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-700 transition-colors px-4">
                    Delete
                  </button>
                </div>
              )}

              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center gap-2">
                  <button
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={`p-2 rounded-xl transition-all ${showEmoji ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
                    disabled={loading || isUploading}
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <label className="cursor-pointer p-2 rounded-xl transition-all text-slate-300 hover:text-slate-600 hover:bg-slate-50">
                    <Paperclip className="h-5 w-5" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      disabled={loading || isUploading}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Transmit message..."
                  className="w-full bg-slate-50 border border-slate-100 py-5 pl-32 pr-24 rounded-full text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500/30 focus:bg-white transition-all shadow-inner"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading || isUploading}
                />

                <div className="absolute inset-y-0 right-2 flex items-center px-2">
                  <Button
                    onClick={handleSend}
                    className="h-10 w-10 !p-0 rounded-full bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 active:scale-95 transition-all"
                    disabled={loading || isUploading || (!inputVal.trim() && !file)}
                  >
                    {isUploading || loading ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Send className="h-4 w-4 ml-0.5 text-black" />}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { pusherClient } from "@/lib/pusher";
import { Send, Paperclip, Loader2, FileIcon, Smile, BellRing, TrendingUp, User, Globe, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Badge } from "./ui/badge";

export function ChatInterface({ users, currentUserId }: { users: any[], currentUserId: number }) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  
  // Track conversation metadata (last message date and unread counts)
  const [conversations, setConversations] = useState<any[]>([]);

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

  // Fetch initial sorted conversations
  const fetchConversations = async () => {
    const storedToken = localStorage.getItem("token");
    try {
      const res = await fetch("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Real-time listener for new messages
  useEffect(() => {
    const channelName = `chat-${currentUserId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMsg: any) => {
      const activePartner = selectedUserRef.current;
      
      // 1. Update current message thread if open
      if (activePartner && (newMsg.senderId === activePartner.id || newMsg.senderId === currentUserId)) {
        setMessages((prev) => {
          if (!prev.find((m) => m.id === newMsg.id)) {
            return [...prev, newMsg];
          }
          return prev;
        });
      }

      // 2. Re-fetch conversations to update sorting and unread counts
      fetchConversations();

      // 3. Browser notification
      if (newMsg.senderId !== currentUserId && (!activePartner || newMsg.senderId !== activePartner.id)) {
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

  // Handle user selection and mark as read
  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);

    const fetchHistory = async () => {
      const storedToken = localStorage.getItem("token");
      try {
        const res = await fetch(`/api/messages?receiverId=${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          
          // Re-fetch conversations to clear the unread count in the sidebar
          fetchConversations();
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedUser]);

  // Compute the sorted user list
  const sortedUsers = useMemo(() => {
    // Start with all users
    const allUsers = [...users];
    
    // Sort logic: 
    // 1. If user has a conversation, use its lastMessage.createdAt
    // 2. If no conversation, treat as oldest
    return allUsers.sort((a, b) => {
      const convA = conversations.find(c => c.user.id === a.id);
      const convB = conversations.find(c => c.user.id === b.id);
      
      const timeA = convA ? new Date(convA.lastMessage.createdAt).getTime() : 0;
      const timeB = convB ? new Date(convB.lastMessage.createdAt).getTime() : 0;
      
      return timeB - timeA;
    });
  }, [users, conversations]);

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
        fetchConversations(); // Update sorting after sending
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
    <div className="flex h-full bg-white overflow-hidden shadow-2xl rounded-3xl border border-slate-100 relative">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-100 bg-slate-50/10 backdrop-blur-xl flex flex-col z-10">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.4)] animate-pulse" />
            <span className="text-xs font-black tracking-[0.25em] uppercase text-slate-800">Operatives</span>
          </div>
          {conversations.some(c => c.unreadCount > 0) && (
             <Badge variant="outline" className="bg-yellow-500 text-black border-none animate-bounce text-[9px] px-1.5 py-0.5">Live</Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
          {sortedUsers.map(u => {
            const conv = conversations.find(c => c.user.id === u.id);
            const unreadCount = conv?.unreadCount || 0;
            const isSelected = selectedUser?.id === u.id;
            const lastMsg = conv?.lastMessage;

            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 ${isSelected ? "bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] ring-1 ring-slate-200" : "hover:bg-yellow-500/[0.03]"}`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-black transition-all border ${isSelected ? "bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/10 scale-105" : "bg-white text-slate-400 border-slate-100"}`}>
                  {u.name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <div className={`text-sm tracking-tight truncate ${isSelected || unreadCount > 0 ? "text-slate-900 font-bold" : "text-slate-600 font-medium"}`}>
                      {u.name}
                    </div>
                    {lastMsg && (
                      <span className="text-[9px] text-slate-300 font-bold uppercase transition-colors group-hover:text-slate-400">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className={`text-[10px] truncate max-w-[120px] ${unreadCount > 0 ? "text-yellow-600 font-black" : "text-slate-400 font-bold"} uppercase tracking-widest`}>
                      {unreadCount > 0 ? "Incoming Message" : (u.role?.name || "Member")}
                    </div>
                    {unreadCount > 0 && !isSelected && (
                      <div className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-yellow-500 text-black text-[9px] font-black shadow-lg shadow-yellow-500/20">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute left-[-1px] w-1.5 h-8 bg-yellow-500 rounded-r-full shadow-[4px_0_15px_rgba(234,179,8,0.4)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm relative z-10 overflow-hidden">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-6 animate-in fade-in duration-500 scale-95">
            <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
              <MessageCircle className="h-12 w-12 opacity-10" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-400 mb-2">Secure Link Awaiting Connection</p>
              <div className="h-1 w-24 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full w-1/3 bg-yellow-500 animate-loading-bar" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="h-24 px-8 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-yellow-500 flex items-center justify-center text-black font-black shadow-lg shadow-yellow-500/10 rotate-3 group">
                  <span className="-rotate-3">{selectedUser.name[0]}</span>
                </div>
                <div>
                  <h3 className="text-slate-900 font-black tracking-tight text-lg mb-0.5">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Biometric Linked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth bg-slate-50/[0.2]">
              {loading && messages.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
                  <div className="h-12 w-12 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin shadow-[0_0_20px_rgba(234,179,8,0.1)]" />
                </div>
              ) : (
                messages.map((msg, idx) => {
                   const isMe = msg.senderId === currentUserId;
                   const nextMsg = messages[idx + 1];
                   const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

                   return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                      <div className={`group relative max-w-[75%] p-5 shadow-2xl shadow-slate-200/[0.1] transition-all hover:scale-[1.01] ${isMe
                        ? "bg-yellow-400 text-black rounded-3xl rounded-tr-none"
                        : "bg-white border border-slate-100 text-slate-800 rounded-3xl rounded-tl-none"
                        }`}>
                        {msg.content && <p className="text-[15px] font-semibold leading-relaxed whitespace-pre-wrap tracking-tight">{msg.content}</p>}

                        {msg.fileUrl && (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center p-4 mt-4 rounded-2xl transition-all border ${isMe
                            ? "bg-black/5 border-black/5 hover:bg-black/10 text-black"
                            : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800"
                            }`}>
                            <div className="h-10 w-10 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/10 mr-4">
                                <FileIcon className="h-5 w-5 text-black" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-widest truncate">{msg.fileName}</p>
                                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Payload File</p>
                            </div>
                          </a>
                        )}

                        <div className={`text-[10px] mt-3 font-black uppercase tracking-[0.2em] opacity-30 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                   );
                })
              )}
              <div ref={bottomRef} className="h-8" />
            </div>

            {/* Input Form */}
            <div className="p-8 relative bg-white border-t border-slate-100">

              {showEmoji && (
                <div className="absolute bottom-[120px] left-8 overflow-hidden z-50 animate-in zoom-in-95 duration-200 shadow-2xl rounded-2xl border border-slate-100">
                  <EmojiPicker theme={Theme.LIGHT} onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} />
                </div>
              )}

              {file && (
                <div className="absolute bottom-[120px] left-8 right-8 bg-white/90 backdrop-blur-xl border-2 border-yellow-500 p-4 rounded-3xl flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-6 transition-all border-dashed">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 rotate-6">
                      <FileIcon className="h-6 w-6 text-black" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-900 truncate max-w-[300px] uppercase tracking-widest">{file.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready for uplink</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="h-10 px-6 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform active:scale-95">
                    Abort
                  </button>
                </div>
              )}

              <div className="relative group/input max-w-5xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-8 flex items-center gap-3">
                  <button
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={`p-3 rounded-2xl transition-all ${showEmoji ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 rotate-12' : 'text-slate-300 hover:text-slate-900 hover:bg-slate-100'}`}
                    disabled={loading || isUploading}
                  >
                    <Smile className="h-6 w-6" />
                  </button>
                  <label className="cursor-pointer p-3 rounded-2xl transition-all text-slate-300 hover:text-slate-900 hover:bg-slate-100 group">
                    <Paperclip className="h-6 w-6 transition-transform group-hover:-rotate-12" />
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
                  placeholder="Transmit encrypted payload..."
                  className="w-full bg-slate-50/50 border-2 border-slate-100 py-6 pl-36 pr-28 rounded-full text-[15px] font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-8 focus:ring-yellow-500/5 focus:border-yellow-500/20 focus:bg-white transition-all shadow-inner"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading || isUploading}
                />

                <div className="absolute inset-y-0 right-3 flex items-center px-2">
                  <Button
                    onClick={handleSend}
                    className="h-14 w-14 !p-0 rounded-full bg-yellow-500 text-black shadow-[0_10px_20px_-5px_rgba(234,179,8,0.4)] hover:bg-yellow-400 hover:-translate-y-0.5 active:scale-90 transition-all font-black group"
                    disabled={loading || isUploading || (!inputVal.trim() && !file)}
                  >
                    {isUploading || loading ? <Loader2 className="h-6 w-6 animate-spin text-black" /> : <Send className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
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

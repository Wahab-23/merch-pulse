"use client";

import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { Send, Paperclip, Loader2, FileIcon, Smile, BellRing } from "lucide-react";
import { Button } from "./ui/button";
import EmojiPicker from "emoji-picker-react";

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

  // Keep ref up to date for inside pusher closure
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Request browser notification permissions on load
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Set up Pusher WebSocket listener globally for the current user
  useEffect(() => {
    const channelName = `chat-${currentUserId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMsg: any) => {
      const activePartner = selectedUserRef.current;

      // 1. If we are currently actively chatting with the sender
      if (activePartner && (newMsg.senderId === activePartner.id || newMsg.senderId === currentUserId)) {
        setMessages((prev) => {
          if (!prev.find((m) => m.id === newMsg.id)) {
            return [...prev, newMsg];
          }
          return prev;
        });
      }

      // 2. If it is an incoming message from SOMEONE ELSE (not what we are looking at)
      if (newMsg.senderId !== currentUserId && (!activePartner || newMsg.senderId !== activePartner.id)) {
        // Increment their unread badge
        setUnreadCounts((prev) => ({
          ...prev,
          [newMsg.senderId]: (prev[newMsg.senderId] || 0) + 1
        }));

        // Fire a browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          const senderName = users.find(u => u.id === newMsg.senderId)?.name || "Someone";
          new Notification(`New message from ${senderName}`, {
            body: newMsg.content || "Sent you a file attachment",
            icon: "/favicon.ico" // change to your app's icon if needed
          });
        }
      }
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [currentUserId, users]);

  // Fetch full chat history when selecting a user
  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    
    // Clear their unread badge if we just clicked on them
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

    setShowEmoji(false); // Cleanly close emoji picker
    let finalFileUrl = "";
    let finalFileName = "";
    let finalFileSize = 0;

    const storedToken = localStorage.getItem("token");

    // 1. Upload File if attached
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

    // 2. Send Message
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
    <div className="flex h-[80vh] border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Sidebar List */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 font-bold border-b bg-white flex justify-between items-center text-gray-800">
          <span>Users</span>
          {Object.values(unreadCounts).some(i => i > 0) && (
            <BellRing className="h-4 w-4 text-blue-500 animate-pulse" />
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(u => {
            const hasUnread = unreadCounts[u.id] > 0;
            return (
              <div 
                key={u.id} 
                onClick={() => setSelectedUser(u)}
                className={`p-4 border-b cursor-pointer transition-colors flex items-center justify-between ${selectedUser?.id === u.id ? "bg-blue-100 border-blue-200" : "hover:bg-gray-100"}`}
              >
                <div>
                  <div className={`text-gray-800 ${hasUnread ? "font-bold" : "font-semibold"}`}>{u.name}</div>
                  <div className="text-xs text-gray-500">{u.role?.name || "Member"}</div>
                </div>
                
                {/* Unread Badge UI */}
                {hasUnread && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
                    {unreadCounts[u.id]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Smile className="h-10 w-10 text-gray-300" />
            <p>Select a user to start chatting</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b font-bold bg-white text-gray-800 shadow-sm z-10">
              {selectedUser.name}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
              {loading && messages.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] p-3 shadow-sm ${msg.senderId === currentUserId ? "bg-blue-600 text-white rounded-2xl rounded-br-sm" : "bg-white border text-gray-800 rounded-2xl rounded-bl-sm"}`}>
                      {msg.content && <p className="mb-1 text-sm whitespace-pre-wrap">{msg.content}</p>}
                      
                      {/* File UI */}
                      {msg.fileUrl && (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center p-2 mt-2 rounded-lg transition-colors ${msg.senderId === currentUserId ? "bg-blue-700 hover:bg-blue-800 text-blue-50 border border-blue-500" : "bg-gray-100 hover:bg-gray-200 border text-gray-700"}`}>
                          <FileIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs truncate font-medium">{msg.fileName}</span>
                        </a>
                      )}
                      
                      <span className={`text-[10px] mt-1 block select-none ${msg.senderId === currentUserId ? "text-blue-200" : "text-gray-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} className="h-2" />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t bg-white flex flex-col gap-2 relative z-20">
              
              {/* Emojis Popup Overlay */}
              {showEmoji && (
                <div className="absolute bottom-[80px] left-4 shadow-xl rounded-lg overflow-hidden border">
                  <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} />
                </div>
              )}

              {/* Attached file preview tag */}
              {file && (
                <div className="bg-blue-50 text-blue-800 p-2 text-xs border border-blue-200 rounded-lg flex items-center justify-between shadow-sm animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate max-w-[200px] font-medium">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-red-500 font-bold hover:bg-red-50 px-2 rounded ml-4 transition-colors">
                    Remove
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {/* Emoji Trigger */}
                <button 
                  onClick={() => setShowEmoji(!showEmoji)} 
                  className={`p-2 hover:bg-gray-100 rounded-full transition-colors relative ${showEmoji ? 'bg-gray-200 text-blue-600' : 'text-gray-500'}`}
                  disabled={loading || isUploading}
                >
                  <Smile className="h-5 w-5" />
                </button>

                {/* File Attachment Trigger */}
                <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors relative text-gray-500">
                  <Paperclip className="h-5 w-5" />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={loading || isUploading}
                  />
                </label>
                
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border-0 focus:ring-0 text-sm bg-gray-100 p-3 px-4 rounded-full outline-none transition-all focus:bg-gray-50 focus:shadow-inner"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading || isUploading}
                />
                
                <Button 
                  size="icon"
                  onClick={handleSend} 
                  className="rounded-full shadow-sm flex-shrink-0 transition-transform hover:scale-105"
                  disabled={loading || isUploading || (!inputVal.trim() && !file)}
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : <Send className="ml-0.5" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

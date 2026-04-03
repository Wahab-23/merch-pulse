import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🧠 Complex query: Get unique conversation partners and their latest message
    // 1. Fetch all messages involving the current user
    const allMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, role: { select: { name: true } } } },
        receiver: { select: { id: true, name: true, role: { select: { name: true } } } },
      },
    });

    // 2. Group by the "other" user
    const conversationsMap = new Map();

    allMessages.forEach((msg) => {
      const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
      if (!conversationsMap.has(otherUser.id)) {
        conversationsMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
          },
          unreadCount: 0,
        });
      }
      
      // If the current user is the receiver and the message is unread, increment count
      if (msg.receiverId === user.id && !msg.isRead) {
        const conv = conversationsMap.get(otherUser.id);
        conv.unreadCount += 1;
      }
    });

    // 3. Convert map to array and sort by latest message
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET /api/messages/conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

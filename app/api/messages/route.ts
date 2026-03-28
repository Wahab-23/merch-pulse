import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// GET conversation history between authenticated user and a specific receiver
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const receiverIdParam = searchParams.get("receiverId");

    if (!receiverIdParam) {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
    }

    const receiverId = parseInt(receiverIdParam, 10);

    // Find all messages between these two users (sent OR received by either)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: user.id },
        ],
      },
      orderBy: {
        createdAt: "asc", 
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST a new message
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, content, fileUrl, fileName, fileSize } = body;

    if (!receiverId) {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
    }

    // 1. Save to database
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: parseInt(receiverId, 10),
        content: content || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize ? parseInt(fileSize, 10) : null,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // 2. Trigger Pusher Event on the receiver's personal channel
    // Channel name: private-chat-<userid> (or just chat-<userid> for public simplicity in MVP)
    const channelName = `chat-${receiverId}`;
    await pusherServer.trigger(channelName, "new-message", message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

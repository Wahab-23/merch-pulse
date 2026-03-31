import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";
import { MessageSquare } from "lucide-react";

export default async function MessagesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const user = await getUserFromToken(token);

  if (!user) {
    redirect("/login");
  }

  // Fetch all users except the current one so they appear in the sidebar
  const users = await prisma.user.findMany({
    where: { id: { not: user.id } },
    select: {
      id: true,
      name: true,
      email: true,
      role: { select: { name: true } }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/*       <div className="mb-6 flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Team Messenger</h1>
          <p className="text-sm text-gray-500">Real-time chat and file sharing up to 20MB.</p>
        </div>
      </div> */}
      <ChatInterface users={users} currentUserId={user.id} />
    </div>
  );
}

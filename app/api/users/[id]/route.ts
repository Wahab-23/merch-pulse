import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getUserFromToken } from "@/lib/auth"; // for user-level decoding
import { verifyAdmin } from "@/lib/verifyadmin"; // for admin check
import bcrypt from "bcryptjs";

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    const isAdmin = user?.role?.name === "Admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Decode token for user ID
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decoded.id;
    const isAdmin = await verifyAdmin(token);

    // 🧩 Authorization rules:
    // Admin can edit anyone. User can edit only self.
    if (!isAdmin && userId !== Number(id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { name, email, password, role, isActive } = body;

    // If user is not admin, prevent changing role/isActive
    if (!isAdmin && (role || typeof isActive !== "undefined")) {
      return NextResponse.json({ error: "You cannot modify role or active status" }, { status: 403 });
    }

    // Prepare data for update
    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (role) data.role = { connect: { name: role } };
    if (password) data.password = await bcrypt.hash(password, 10);

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

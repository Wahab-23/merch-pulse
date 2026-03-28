import { NextResponse, NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUserFromToken } from "@/lib/auth";

// Constant for 20MB in bytes
const MAX_FILE_SIZE = 20 * 1024 * 1024; 

export async function POST(req: NextRequest) {
  try {
    // Basic Authentication Verification
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Server-Side 20MB Size Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 20MB limit" }, { status: 413 });
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique secure filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${sanitizedName}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "chat");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // ignore if folder exists
    }

    // Save file
    const uploadPath = path.join(uploadsDir, filename);
    await writeFile(uploadPath, buffer);

    const fileUrl = `/uploads/chat/${filename}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Chat Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function parseDataUrl(input: string) {
  const match = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, b64] = match;
  return { mime, b64 };
}

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const base64 = body?.base64 as string | undefined;

    if (!base64 || typeof base64 !== "string") {
      return NextResponse.json(
        { error: "base64 is required" },
        { status: 400 },
      );
    }

    const parsed = parseDataUrl(base64);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid data URL. Expected data:image/<type>;base64,<data>" },
        { status: 400 },
      );
    }

    const { mime, b64 } = parsed;

    if (!ALLOWED_MIME.has(mime)) {
      return NextResponse.json(
        { error: "Unsupported image type" },
        { status: 415 },
      );
    }

    const ext = extFromMime(mime);
    if (!ext) {
      return NextResponse.json(
        { error: "Invalid image extension" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(b64, "base64");
    if (!buffer.length) {
      return NextResponse.json({ error: "Empty image data" }, { status: 400 });
    }

    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image too large (max 5MB)" },
        { status: 413 },
      );
    }

    // Dev/local storage (for production, replace with S3/Cloudinary)
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json(
      {
        ok: true,
        url: publicUrl,
        mime,
        size: buffer.length,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

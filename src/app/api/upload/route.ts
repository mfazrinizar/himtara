import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { adminStorage, adminDb } from "@/lib/firebase/admin";
import { refreshTokenAction } from "@/actions/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    // Get and verify access token
    const cookieStore = await cookies();
    let accessToken = cookieStore.get("x-access-token")?.value;

    if (!accessToken) {
      // Try to refresh
      const refreshResult = await refreshTokenAction();
      if (!refreshResult.success || !refreshResult.data?.user) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
      // Get the new token
      accessToken = cookieStore.get("x-access-token")?.value;
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is active
    const userDoc = await adminDb.collection("users").doc(payload.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.status !== "active") {
      return NextResponse.json(
        { success: false, message: "User is not active" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const uploadType = formData.get("type") as string || "gems";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files provided" },
        { status: 400 }
      );
    }

    // Validate and upload files
    const uploadedUrls: string[] = [];
    const bucket = adminStorage.bucket();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: `Invalid file type: ${file.type}` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: `File too large: ${file.name} (max 5MB)` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${uploadType}/${payload.uid}/${timestamp}_${i}_${sanitizedName}`;

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Firebase Storage
      const fileRef = bucket.file(filePath);
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            uploadedBy: payload.uid,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Make file publicly accessible
      await fileRef.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      uploadedUrls.push(publicUrl);
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedUrls.length} file(s) uploaded successfully`,
      data: { urls: uploadedUrls },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}

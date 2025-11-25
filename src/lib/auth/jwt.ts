import { SignJWT, jwtVerify } from "jose";
import { AccessTokenPayload } from "@/types/firestore";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function signAccessToken(
  payload: AccessTokenPayload
): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

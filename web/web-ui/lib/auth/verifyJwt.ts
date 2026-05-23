import { jwtVerify } from "jose";

export type MemberJwtPayload = {
  phone_number: string;
};

/** Reject legacy client-only tokens from before JWT login. */
export function isLegacyClientToken(token: string): boolean {
  return token.startsWith("session-") || token.startsWith("dev-");
}

export async function verifyMemberJwt(
  token: string,
): Promise<MemberJwtPayload | null> {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || !token || isLegacyClientToken(token)) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );

    if (payload.type !== "member") return null;
    const phone = payload.phone_number;
    if (typeof phone !== "string" || phone.length !== 10) return null;

    return { phone_number: phone };
  } catch {
    return null;
  }
}

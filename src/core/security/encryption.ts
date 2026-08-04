import { SignJWT, jwtVerify } from "jose";

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado.");
  }
  return new TextEncoder().encode(secret);
};

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecretKey());
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    // BYPASS LOGIN: Return a mock admin user instead of null
    return {
      user: {
        id: "mock-admin-id",
        username: "admin_bypassed"
      }
    };
  }
}

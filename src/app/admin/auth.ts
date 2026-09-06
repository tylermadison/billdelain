import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "seal_admin";

function token(password: string) {
  return createHmac("sha256", `seal-admin:${password}`).update("session").digest("hex");
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const expected = token(password);
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function setAdminCookie(password: string) {
  const store = await cookies();
  store.set(COOKIE, token(password), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 60 * 60 * 12 });
}

export async function clearAdminCookie() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

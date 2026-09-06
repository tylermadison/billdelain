"use server";

import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { clearAdminCookie, setAdminCookie } from "./auth";

export async function login(_prev: { error?: string } | null, form: FormData) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const given = String(form.get("password") ?? "");
  const ok = expected.length > 0 && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return { error: "Wrong password." };
  await setAdminCookie(expected);
  redirect("/admin");
}

export async function logout() {
  await clearAdminCookie();
  redirect("/admin");
}

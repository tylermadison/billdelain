import { NextResponse } from "next/server";
import { schedule } from "@/lib/config";
import { seatsTakenByTime } from "@/lib/db";
import { dailySlots, isDateBookable, isSlotOpen, isValidDateString } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!isValidDateString(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const bookable = isDateBookable(date);
  const taken = bookable ? seatsTakenByTime(date) : {};
  const slots = dailySlots().map((s) => {
    const remaining = Math.max(0, schedule.capacity - (taken[s.time] ?? 0));
    const open = bookable && isSlotOpen(date, s.time) && remaining > 0;
    return { ...s, remaining, open, reason: !bookable ? "closed" : !isSlotOpen(date, s.time) ? "past" : remaining === 0 ? "sold_out" : null };
  });
  return NextResponse.json({ date, bookable, capacity: schedule.capacity, slots }, { headers: { "Cache-Control": "no-store" } });
}

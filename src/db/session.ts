/**
 * Session + RBAC source of truth.
 *
 * The signed-in user's `users` row (role + pharmacy_id) is fetched from
 * Supabase when online and mirrored into Dexie so role checks keep working
 * offline. Never trust anything else for role gating on the client — the
 * server still enforces RLS.
 */
import { db, isBrowser, type UserRow } from "./dexie";
import { supabase } from "./supabase";

export type Role = "owner" | "admin" | "staff";

/** Roles allowed to manage inventory / add batches. */
export const INVENTORY_ROLES: Role[] = ["owner"];

export async function loadProfile(userId: string): Promise<UserRow | null> {
  if (!isBrowser) return null;

  const local = (await db.users.get(userId)) ?? null;

  if (navigator.onLine) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      const row = data as UserRow;
      await db.users.put(row);
      await db.meta.put({ key: "active_pharmacy_id", value: row.pharmacy_id });
      await db.meta.put({ key: "current_user_id", value: row.id });
      return row;
    }
  }

  return local;
}

export async function cachedPharmacyId(): Promise<string | null> {
  if (!isBrowser) return null;
  const m = await db.meta.get("active_pharmacy_id");
  return (m?.value as string) ?? null;
}

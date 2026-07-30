/**
 * platform_payouts: subscription payments made by pharmacies to the
 * platform. Pharmacy owners insert their own rows; platform admins read
 * everything.
 */
import { supabase } from "@/lib/supabase";

export type PayoutStatus = "pending" | "verified" | "rejected";
export type PayoutMethod = "Cash" | "CBE" | "Telebirr";

export interface PlatformPayout {
  id: string;
  pharmacy_id: string;
  platform_config_id: string | null;
  amount: number;
  payment_method: PayoutMethod;
  transaction_reference: string;
  status: PayoutStatus;
  paid_at: string;
}

/** Payout enriched with the pharmacy name, for the admin console table. */
export interface AdminPayoutRow extends PlatformPayout {
  pharmacy_name: string;
}

export async function listPayouts(pharmacyId?: string): Promise<PlatformPayout[]> {
  let q = supabase.from("platform_payouts").select("*").order("paid_at", { ascending: false });
  if (pharmacyId) q = q.eq("pharmacy_id", pharmacyId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as PlatformPayout[];
}

/** All payouts across every tenant, joined with pharmacy names. */
export async function listAllPayoutsForAdmin(): Promise<AdminPayoutRow[]> {
  const { data, error } = await supabase
    .from("platform_payouts")
    .select("*, pharmacies(name)")
    .order("paid_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Array<PlatformPayout & { pharmacies?: { name?: string } | null }>).map(
    (r) => ({
      ...r,
      pharmacy_name: r.pharmacies?.name ?? "Unknown pharmacy",
    }),
  );
}

export async function submitPayout(
  input: Omit<PlatformPayout, "id" | "status" | "paid_at"> & { id?: string },
): Promise<PlatformPayout> {
  const { data, error } = await supabase
    .from("platform_payouts")
    .insert({ ...input, status: "pending" })
    .select("*")
    .single();
  if (error) throw error;
  return data as PlatformPayout;
}

export async function setPayoutStatus(id: string, status: PayoutStatus): Promise<void> {
  const { error } = await supabase.from("platform_payouts").update({ status }).eq("id", id);
  if (error) throw error;
}

export const approvePayout = (id: string) => setPayoutStatus(id, "verified");
export const rejectPayout = (id: string) => setPayoutStatus(id, "rejected");

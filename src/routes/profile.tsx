import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  CreditCard,
  Landmark,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings · Phamda" },
      {
        name: "description",
        content:
          "Manage your Phamda account, staff, inventory thresholds, and subscription.",
      },
    ],
  }),
  component: ProfilePage,
});

type StaffRole = "Pharmacist" | "Clerk" | "Cashier";
interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  status: "Active" | "Inactive";
}

const seedStaff: Staff[] = [
  { id: "s1", name: "Selamawit Girma", role: "Pharmacist", phone: "+251 91 555 0110", status: "Active" },
  { id: "s2", name: "Yonas Kebede", role: "Cashier", phone: "+251 91 555 0134", status: "Active" },
  { id: "s3", name: "Meron Tadesse", role: "Clerk", phone: "+251 91 555 0189", status: "Active" },
];

function ProfilePage() {
  const [payOpen, setPayOpen] = useState(false);
  const [expiryDays, setExpiryDays] = useState(90);
  const [stagnantDays, setStagnantDays] = useState(120);
  const [staff, setStaff] = useState<Staff[]>(seedStaff);
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "Pharmacist" as StaffRole,
    phone: "",
  });

  function addStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) return;
    setStaff((prev) => [
      { id: crypto.randomUUID(), ...newStaff, status: "Active" },
      ...prev,
    ]);
    setNewStaff({ name: "", role: "Pharmacist", phone: "" });
  }

  function toggleStaff(id: string) {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
          : s,
      ),
    );
  }

  return (
    <AppShell hideBell>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-primary text-lg font-bold">
              DS
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight">
                Dawit Solomon
              </h1>
              <p className="text-sm text-muted-foreground">
                Owner · Phamda Central Pharmacy
              </p>
            </div>
          </div>
          <span className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-success-soft px-3 font-mono-data text-[11px] font-bold uppercase tracking-wider text-success-soft-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" /> All systems normal
          </span>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* System health */}
          <Card icon={Activity} title="System Health">
            <ul className="space-y-2.5 text-sm">
              <Health label="Database sync" value="Live" tone="success" />
              <Health label="Backups" value="12 min ago" tone="success" />
              <Health label="Printer" value="Connected" tone="success" />
              <Health label="License" value="Valid · 42 days" tone="warning" />
            </ul>
          </Card>

          {/* Inventory rules */}
          <Card icon={Settings2} title="Inventory Rules">
            <div className="space-y-4">
              <RuleSlider
                label="Expiry warning threshold"
                value={expiryDays}
                min={30}
                max={180}
                step={15}
                unit="days"
                onChange={setExpiryDays}
              />
              <RuleSlider
                label="Stagnant / deadstock threshold"
                value={stagnantDays}
                min={30}
                max={365}
                step={15}
                unit="days"
                onChange={setStagnantDays}
              />
            </div>
          </Card>

          {/* Current plan */}
          <Card icon={Sparkles} title="Current Plan">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary-soft px-2 py-0.5 font-mono-data text-[11px] font-bold uppercase tracking-wider text-primary">
                Pro Plan
              </span>
              <span className="text-xs text-muted-foreground">Renews Apr 12</span>
            </div>
            <div className="mt-3 font-mono-data text-3xl font-bold">
              1,450 <span className="text-sm text-muted-foreground">ETB / mo</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Multi-station · Unlimited SKUs · Priority support
            </p>
            <button
              onClick={() => setPayOpen(true)}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <CreditCard className="h-4 w-4" /> Pay Now
            </button>
          </Card>
        </div>

        {/* Staff management */}
        <section className="mt-6 rounded-xl border border-border bg-surface shadow-elev-sm">
          <header className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Staff Management</h2>
          </header>

          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            {/* Register new */}
            <form onSubmit={addStaff} className="rounded-lg border border-border bg-surface-low p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <UserPlus className="h-4 w-4 text-primary" /> Register New Staff
              </h3>
              <div className="mt-3 space-y-3">
                <input
                  value={newStaff.name}
                  onChange={(e) => setNewStaff((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Full name"
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <input
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="Phone number"
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <select
                  value={newStaff.role}
                  onChange={(e) =>
                    setNewStaff((s) => ({ ...s, role: e.target.value as StaffRole }))
                  }
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option>Pharmacist</option>
                  <option>Clerk</option>
                  <option>Cashier</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:opacity-90"
                >
                  Add staff member
                </button>
              </div>

              <div className="mt-4 space-y-2 text-[11px]">
                <RoleHint role="Pharmacist" desc="Dispense, verify Rx, override prices" />
                <RoleHint role="Clerk" desc="Stock intake, batch entry, expiry checks" />
                <RoleHint role="Cashier" desc="POS sales, cash-drawer only" />
              </div>
            </form>

            {/* Active team */}
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border bg-surface-low px-4 py-3">
                <h3 className="text-sm font-semibold">Active Team</h3>
                <span className="font-mono-data text-[11px] uppercase tracking-wider text-subtle-foreground">
                  {staff.filter((s) => s.status === "Active").length} active
                </span>
              </div>
              <ul className="divide-y divide-border">
                {staff.map((s) => (
                  <li
                    key={s.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-mid text-xs font-semibold text-primary">
                        {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{s.name}</div>
                        <div className="font-mono-data text-[11px] text-muted-foreground">
                          {s.role} · {s.phone}
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-6 items-center rounded-full px-2 font-mono-data text-[10px] font-bold uppercase tracking-wider",
                          s.status === "Active"
                            ? "bg-success-soft text-success-soft-foreground"
                            : "bg-surface-mid text-muted-foreground",
                        )}
                      >
                        {s.status}
                      </span>
                      <button
                        onClick={() => toggleStaff(s.id)}
                        className="text-xs font-semibold text-danger hover:underline"
                      >
                        {s.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {payOpen && <PaymentSheet onClose={() => setPayOpen(false)} />}
    </AppShell>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Activity;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-elev-sm">
      <header className="mb-4 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary-soft text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h2 className="font-mono-data text-[12px] font-bold uppercase tracking-wider text-primary">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function Health({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger";
}) {
  const dot = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }[tone];
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-2 font-mono-data text-xs font-semibold text-foreground">
        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
        {value}
      </span>
    </li>
  );
}

function RuleSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="font-mono-data text-sm font-bold text-foreground">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function RoleHint({ role, desc }: { role: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-background px-2.5 py-1.5">
      <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
      <div>
        <span className="font-semibold text-foreground">{role}:</span>{" "}
        <span className="text-muted-foreground">{desc}</span>
      </div>
    </div>
  );
}

function PaymentSheet({ onClose }: { onClose: () => void }) {
  const [method, setMethod] = useState<"cash" | "cbe" | "telebirr">("cbe");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-t-2xl border-x border-t border-border bg-surface shadow-elev-lg sm:rounded-2xl sm:border">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-bold">Payment · Pro Plan</h3>
            <p className="text-xs text-muted-foreground">
              Complete payment to renew your subscription
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-surface-low hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-5 py-5">
          <div className="rounded-lg border border-border bg-primary-soft/30 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              Amount due
            </div>
            <div className="mt-1 font-mono-data text-3xl font-bold text-primary">
              1,450.00 <span className="text-base">ETB</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 font-mono-data text-[11px] font-bold uppercase tracking-wider text-subtle-foreground">
              Payment method
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MethodBtn active={method === "cash"} onClick={() => setMethod("cash")} label="Cash" />
              <MethodBtn active={method === "cbe"} onClick={() => setMethod("cbe")} label="CBE Birr" />
              <MethodBtn active={method === "telebirr"} onClick={() => setMethod("telebirr")} label="Telebirr" />
            </div>
          </div>

          {method !== "cash" && (
            <div className="mt-5 rounded-lg border border-dashed border-border bg-surface-low p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Landmark className="h-4 w-4 text-primary" />
                Transfer to
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Bank</dt>
                  <dd className="font-semibold">
                    {method === "cbe" ? "Commercial Bank of Ethiopia" : "Telebirr"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Account</dt>
                  <dd className="font-mono-data font-bold">1000 4402 1189</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Beneficiary</dt>
                  <dd className="font-semibold">Phamda Tech PLC</dd>
                </div>
              </dl>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            I've completed payment
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}

function MethodBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center rounded-md border text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-surface text-muted-foreground hover:bg-surface-low",
      )}
    >
      {label}
    </button>
  );
}


import { createFileRoute, Link, useRouter, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Pill,
  Save,
  Lock,
} from "lucide-react";
import { AppShellWithSlot } from "@/components/app-shell";
import { medications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory_/add_/$productId")({
  head: () => ({
    meta: [
      { title: "Add Stock · PharmaCore" },
      {
        name: "description",
        content:
          "Register a new batch of a selected medicine with stock, expiry, and pricing details.",
      },
    ],
  }),
  component: AddMedicinePage,
});

function AddMedicinePage() {
  const router = useRouter();
  const { productId } = Route.useParams();
  const med = medications.find((m) => m.id === productId);

  if (!med) return <Navigate to="/inventory/add" />;

  const [batchNumber, setBatchNumber] = useState("B-2026-X90");
  const [expiry, setExpiry] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reorder, setReorder] = useState<number | "">(med.reorderLevel);

  const [cost, setCost] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">(med.price);
  const [supplier, setSupplier] = useState("");

  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => router.navigate({ to: "/inventory" }), 800);
  }

  return (
    <AppShellWithSlot hideBell>
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-[1100px] px-4 py-5 pb-32 sm:px-6 lg:px-8 lg:py-8 lg:pb-8"
      >
        <Link
          to="/inventory/add"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to product picker
        </Link>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]">
              Add Stock
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Register a new batch for the selected product.
            </p>
          </div>
          <span className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-success-soft px-3 font-mono-data text-[11px] font-bold uppercase tracking-wider text-success-soft-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Draft saved
          </span>
        </div>

        <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
          {/* 1. Product identification (locked) */}
          <SectionCard icon={Pill} title="Product identification">
            <div className="flex items-start gap-2 rounded-md bg-primary-soft/40 p-3 text-[11px] text-primary-soft-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Locked to the global catalog entry you selected. To change,
                <Link to="/inventory/add" className="ml-1 font-semibold underline">
                  pick a different product
                </Link>
                .
              </span>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <ReadOnly label="Medicine name" value={med.name} />
              <ReadOnly label="Generic name" value={med.generic} />
              <ReadOnly label="Dosage form" value={med.form} />
              <ReadOnly label="Strength" value={med.strength} />
              <ReadOnly label="Release type" value={med.releaseType} />
              <ReadOnly label="Pack size" value={`×${med.packSize}`} />
            </dl>
          </SectionCard>

          {/* 2. Batch & logistics */}
          <SectionCard icon={ClipboardCheck} title="Batch & logistics">
            <div className="space-y-4">
              <Field label="Batch number" required>
                <input
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="B-2026-X90"
                  className={cn(inputCls, "font-mono-data")}
                />
              </Field>
              <Field label="Expiry date" required>
                <input
                  required
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Current stock" required>
                  <input
                    required
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="0"
                    className={inputCls}
                  />
                </Field>
                <Field label="Reorder level">
                  <input
                    type="number"
                    min={0}
                    value={reorder}
                    onChange={(e) =>
                      setReorder(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="10"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* 3. Pricing & supplier */}
          <SectionCard icon={CreditCard} title="Pricing & supplier">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cost price">
                  <MoneyInput value={cost} onChange={setCost} />
                </Field>
                <Field label="Selling price" required>
                  <MoneyInput value={price} onChange={setPrice} required />
                </Field>
              </div>
              <Field label="Supplier" required>
                <input
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Search name"
                  className={inputCls}
                />
              </Field>
            </div>
          </SectionCard>
        </div>

        {/* Sticky footer actions */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:relative lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="mx-auto flex max-w-[1100px] items-center justify-end gap-3 pb-[env(safe-area-inset-bottom)] lg:pb-0">
            <Link
              to="/inventory"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-mid hover:text-foreground sm:flex-initial"
            >
              Discard
            </Link>
            <button
              type="submit"
              disabled={saved}
              className="inline-flex h-11 flex-[2] items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60 sm:flex-initial"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Item
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </AppShellWithSlot>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Pill;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-elev-sm sm:p-6">
      <header className="flex items-center gap-2 border-b border-border pb-3 sm:pb-4">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary-soft text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h2 className="font-mono-data text-[12px] font-bold uppercase tracking-wider text-primary">
          {title}
        </h2>
      </header>
      <div className="pt-4 sm:pt-5">{children}</div>
    </section>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="flex h-11 items-center rounded-md border border-border bg-surface-low px-3 text-sm font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}

function MoneyInput({
  value,
  onChange,
  required,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono-data text-sm font-semibold text-subtle-foreground">
        $
      </span>
      <input
        required={required}
        type="number"
        step="0.01"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder="0.00"
        className={cn(inputCls, "pl-7 font-mono-data")}
      />
    </div>
  );
}

const inputCls =
  "flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-subtle-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

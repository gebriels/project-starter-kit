import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminEmptySection } from "@/components/admin/admin-primitives";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Products · Phamda Master Console" },
      { name: "description", content: "Maintain the global Phamda medicine catalog." },
      { property: "og:title", content: "Products · Phamda Master Console" },
      { property: "og:description", content: "Maintain the global Phamda medicine catalog." },
    ],
  }),
  component: () => (
    <AdminShell title="Phamda Master Console">
      <AdminEmptySection title="Products" note="Global catalog tooling is coming soon." />
    </AdminShell>
  ),
});

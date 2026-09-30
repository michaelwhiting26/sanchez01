import { notFound } from "next/navigation";
import { PageShell } from "@/components/pages/PageShell";
import { formatMoney } from "@/lib/commerce/money";
import { getOrderStore, ORDER_STATES } from "@/lib/commerce/orders";
import { verifyOrderToken } from "@/lib/commerce/token";
import { env } from "@/lib/env";

export const metadata = { title: "Your order | Sanchez Custom Boxing", robots: { index: false } };
export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { pending: "Awaiting deposit", deposit_paid: "Deposit paid", in_production: "In production", qc: "Quality check", balance_due: "Balance due", paid: "Paid in full", shipped: "Shipped", delivered: "Delivered" };
const DEV_SECRET = "dev-only-order-link-secret-not-for-production-0000";

/** An order, by signed link. Status here comes only from the order record, which only a verified payment event can advance. */
export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const e = env();
  const id = verifyOrderToken(token, e.ORDER_LINK_SECRET ?? DEV_SECRET);
  const order = id ? await getOrderStore().get(id) : null;
  if (!order) notFound();
  const at = ORDER_STATES.indexOf(order.status);
  return (
    <PageShell eyebrow="Your order" title={LABEL[order.status] ?? order.status}>
      <ol className="bd__steps" aria-label="Order progress">
        {ORDER_STATES.map((s, i) => (
          <li key={s} className={i <= at ? "is-done" : ""} aria-current={i === at ? "step" : undefined}>
            <span>{LABEL[s]}</span>
          </li>
        ))}
      </ol>
      <p className="pg__lead">
        Total {formatMoney(order.totalMinor, order.currency)}, deposit {formatMoney(order.depositMinor, order.currency)}.{order.book === "test" ? " TEST ORDER: synthetic prices." : ""}
      </p>
      <p className="pg__note">Order {order.id.slice(0, 8)}. Design {order.config.preset}, {order.config.sizeFt} ft, quantity {order.config.quantity}.</p>
    </PageShell>
  );
}

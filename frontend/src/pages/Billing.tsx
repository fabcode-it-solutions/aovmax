import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PlaidConnectButton } from "@/components/PlaidConnectButton";
import aovmaxLogo from "@/assets/aovmax-logo.svg";
import { Building2, CreditCard, LogOut, Download, FileText } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  bank_name: string | null;
  card_brand: string | null;
  last_four: string;
  account_type: string | null;
  expiration_month: number | null;
  expiration_year: number | null;
  is_default: boolean;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  processing_fee: number;
  total_charged: number;
  status: string;
  period_start: string;
  period_end: string;
  profit_generated: number;
  premiums_collected: number;
  revenue_share_percent: number;
  paid_at: string | null;
  created_at: string;
  payment_method_id: string | null;
}

const Billing = () => {
  const { user, loading, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchPaymentMethods = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPaymentMethods(data ?? []);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    fetchPaymentMethods();

    supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setInvoices(data ?? []));
  }, [user]);

  const handleSetDefault = async (pmId: string) => {
    if (!user) return;
    // Unset all defaults
    await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", user.id);
    // Set new default
    await supabase.from("payment_methods").update({ is_default: true }).eq("id", pmId);
    // Refresh
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPaymentMethods(data ?? []);
  };

  const handleRemovePayment = async (pmId: string) => {
    await supabase.from("payment_methods").delete().eq("id", pmId);
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== pmId));
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const pendingInvoice = invoices.find((inv) => inv.status === "pending");
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");

  const getPaymentMethodLabel = (pmId: string | null) => {
    if (!pmId) return "—";
    const pm = paymentMethods.find((p) => p.id === pmId);
    if (!pm) return "—";
    if (pm.type === "bank_account") return `${pm.bank_name ?? "Bank"} ****${pm.last_four}`;
    return `${pm.card_brand ?? "Card"} ****${pm.last_four}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9FAFB" }}>
        <p style={{ color: "#6B7280" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F9FAFB" }}>
      {/* Header */}
      <header
        className="bg-white border-b flex items-center justify-between px-6 h-16"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div className="bg-[#0A0A0A] rounded-lg px-3 py-1">
          <img src={aovmaxLogo} alt="AOVMAX" className="h-10" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium" style={{ color: "#374151" }}>
            {profile?.contact_name ?? user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors"
            style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[900px] mx-auto px-6 py-8">
        <h1 className="text-[28px] font-semibold mb-8" style={{ color: "#111827" }}>
          Billing
        </h1>

        {/* Payment Methods */}
        <section className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: "#E5E7EB" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
            Payment Methods
          </h2>

          {paymentMethods.length === 0 ? (
            <p className="text-sm" style={{ color: "#6B7280" }}>
              No payment methods added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-4 rounded-lg border-2 transition-all cursor-pointer"
                  style={{
                    borderColor: pm.is_default ? "#10B981" : "#E5E7EB",
                    background: pm.is_default ? "#F0FDF4" : "white",
                  }}
                  onClick={() => handleSetDefault(pm.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="radio"
                      checked={pm.is_default}
                      readOnly
                      className="w-5 h-5"
                      style={{ accentColor: "#10B981" }}
                    />
                    <span className="font-semibold" style={{ color: "#111827" }}>
                      {pm.type === "bank_account" ? "Bank Account (ACH - No fees)" : "Credit/Debit Card"}
                    </span>
                    {pm.type === "credit_card" && (
                      <span className="text-xs font-medium" style={{ color: "#92400E" }}>
                        +3.3% processing fee
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-8 mb-2">
                    {pm.type === "bank_account" ? (
                      <Building2 className="h-5 w-5" style={{ color: "#10B981" }} />
                    ) : (
                      <CreditCard className="h-5 w-5" style={{ color: "#10B981" }} />
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#111827" }}>
                        {pm.type === "bank_account"
                          ? `${pm.bank_name ?? "Bank"} ending in ****${pm.last_four}`
                          : `${pm.card_brand ?? "Card"} ending in ****${pm.last_four}`}
                      </p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>
                        {pm.type === "bank_account"
                          ? `${pm.account_type ?? "Checking"} • Added on ${formatDate(pm.created_at)}`
                          : `Expires ${pm.expiration_month}/${pm.expiration_year}`}
                      </p>
                    </div>
                  </div>

                  {pm.is_default && (
                    <span
                      className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded ml-8"
                      style={{ background: "#D1FAE5", color: "#065F46" }}
                    >
                      ✓ Default payment method
                    </span>
                  )}

                  <div className="flex gap-3 ml-8 mt-3">
                    <button
                      className="text-[13px] px-3 py-1.5 rounded-md border transition-colors"
                      style={{ color: "#EF4444", borderColor: "#EF4444" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePayment(pm.id);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: "#E5E7EB" }}>
            <PlaidConnectButton onSuccess={fetchPaymentMethods} />
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all"
              style={{ color: "#10B981", borderColor: "#10B981", background: "white" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FDF4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              onClick={() => {
                /* Stripe - Phase 3 */
              }}
            >
              + Add Card
            </button>
          </div>
        </section>

        {/* Next Payment */}
        {pendingInvoice && (
          <section className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
              Next Payment
            </h2>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[32px] font-bold font-tight" style={{ color: "#111827" }}>
                {formatCurrency(pendingInvoice.total_charged)}
              </span>
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "#FEF3C7", color: "#92400E" }}
              >
                Pending
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
              Period: {formatDate(pendingInvoice.period_start)} - {formatDate(pendingInvoice.period_end)}
            </p>
            <div className="border-t pt-4 space-y-2" style={{ borderColor: "#E5E7EB" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#6B7280" }}>Profit generated</span>
                <span className="font-medium" style={{ color: "#111827" }}>
                  {formatCurrency(pendingInvoice.profit_generated)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#6B7280" }}>Premiums collected</span>
                <span className="font-medium" style={{ color: "#111827" }}>
                  {formatCurrency(pendingInvoice.premiums_collected)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#6B7280" }}>Your share ({pendingInvoice.revenue_share_percent}%)</span>
                <span className="font-medium" style={{ color: "#111827" }}>
                  {formatCurrency(pendingInvoice.amount)}
                </span>
              </div>
              {pendingInvoice.processing_fee > 0 && (
                <div
                  className="flex justify-between text-sm px-3 py-2 rounded -mx-3"
                  style={{ background: "#FEF3C7", color: "#92400E" }}
                >
                  <span>Card processing fee (3.3%)</span>
                  <span className="font-medium">{formatCurrency(pendingInvoice.processing_fee)}</span>
                </div>
              )}
            </div>
            <p className="text-[13px] mt-4 pt-4 border-t" style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>
              Payment method: {getPaymentMethodLabel(pendingInvoice.payment_method_id)}
            </p>
          </section>
        )}

        {/* Invoice History */}
        <section className="bg-white rounded-xl border p-6" style={{ borderColor: "#E5E7EB" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
            Invoice History
          </h2>

          {paidInvoices.length === 0 ? (
            <p className="text-sm" style={{ color: "#6B7280" }}>
              No past invoices yet.
            </p>
          ) : (
            <div className="space-y-4">
              {paidInvoices.map((inv) => (
                <div key={inv.id} className="p-5 rounded-lg border" style={{ borderColor: "#E5E7EB" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl font-bold font-tight" style={{ color: "#111827" }}>
                      {formatCurrency(inv.total_charged)}
                    </span>
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: "#D1FAE5", color: "#065F46" }}
                    >
                      Paid ✓
                    </span>
                  </div>
                  <p className="text-[13px] mb-3" style={{ color: "#6B7280" }}>
                    #{inv.invoice_number} • Paid on {inv.paid_at ? formatDate(inv.paid_at) : "—"}
                  </p>
                  <p className="text-sm mb-3" style={{ color: "#6B7280" }}>
                    Period: {formatDate(inv.period_start)} - {formatDate(inv.period_end)}
                  </p>
                  <div className="border-t pt-3 space-y-2" style={{ borderColor: "#E5E7EB" }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#6B7280" }}>Profit generated</span>
                      <span className="font-medium" style={{ color: "#111827" }}>
                        {formatCurrency(inv.profit_generated)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#6B7280" }}>Premiums collected</span>
                      <span className="font-medium" style={{ color: "#111827" }}>
                        {formatCurrency(inv.premiums_collected)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#6B7280" }}>Your share ({inv.revenue_share_percent}%)</span>
                      <span className="font-medium" style={{ color: "#111827" }}>
                        {formatCurrency(inv.amount)}
                      </span>
                    </div>
                    {inv.processing_fee > 0 && (
                      <div
                        className="flex justify-between text-sm px-3 py-2 rounded -mx-3"
                        style={{ background: "#FEF3C7", color: "#92400E" }}
                      >
                        <span>Card processing fee (3.3%)</span>
                        <span className="font-medium">{formatCurrency(inv.processing_fee)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] mt-3 pt-3 border-t" style={{ color: "#6B7280", borderColor: "#E5E7EB" }}>
                    Payment method: {getPaymentMethodLabel(inv.payment_method_id)}
                  </p>
                  <div className="flex gap-3 mt-4 pt-4 border-t" style={{ borderColor: "#E5E7EB" }}>
                    <button
                      className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-md border transition-colors"
                      style={{ color: "#10B981", borderColor: "#10B981" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FDF4")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Download className="h-3.5 w-3.5" /> Download Receipt
                    </button>
                    <button
                      className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-md border transition-colors"
                      style={{ color: "#10B981", borderColor: "#10B981" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FDF4")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <FileText className="h-3.5 w-3.5" /> View Transactions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Billing;

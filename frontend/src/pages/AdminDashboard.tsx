import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import aovmaxLogo from "@/assets/aovmax-logo.svg";
import { LogOut, Search, Eye } from "lucide-react";

interface ClientProfile {
  user_id: string;
  company_name: string | null;
  contact_name: string | null;
  revenue_share_percent: number;
}

interface ClientInvoice {
  user_id: string;
  total_charged: number;
  status: string;
  period_end: string;
}

const AdminDashboard = () => {
  const { user, loading, isAdmin, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [nextPayments, setNextPayments] = useState<Record<string, ClientInvoice>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch all client profiles through backend
        const profiles = await api.getProfiles(session.access_token);
        setClients(profiles ?? []);

        // Fetch pending invoices through backend
        const invoices = await api.getInvoices(session.access_token, 'pending');
        const map: Record<string, ClientInvoice> = {};
        invoices?.forEach((inv: ClientInvoice) => {
          map[inv.user_id] = inv;
        });
        setNextPayments(map);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.company_name ?? "").toLowerCase().includes(q) ||
      (c.contact_name ?? "").toLowerCase().includes(q)
    );
  });

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
      <header className="bg-white border-b flex items-center justify-between px-6 h-16" style={{ borderColor: "#E5E7EB" }}>
        <div className="flex items-center gap-3">
          <div className="bg-[#0A0A0A] rounded-lg px-3 py-1">
            <img src={aovmaxLogo} alt="AOVMAX" className="h-10" />
          </div>
          <span className="text-sm font-medium" style={{ color: "#6B7280" }}>Admin Dashboard</span>
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
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[28px] font-semibold" style={{ color: "#111827" }}>All Clients</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#6B7280" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 rounded-lg border text-sm outline-none transition-all"
              style={{ borderColor: "#E5E7EB", color: "#111827", width: 240 }}
              onFocus={(e) => {
                e.target.style.borderColor = "#10B981";
                e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm" style={{ color: "#6B7280" }}>No clients found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((client) => {
              const pending = nextPayments[client.user_id];
              return (
                <div
                  key={client.user_id}
                  className="bg-white rounded-lg border p-5 flex items-center justify-between"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div>
                    <p className="text-base font-semibold" style={{ color: "#111827" }}>
                      {client.company_name ?? "No Company"}{" "}
                      {client.contact_name && (
                        <span className="font-normal" style={{ color: "#6B7280" }}>
                          ({client.contact_name})
                        </span>
                      )}
                    </p>
                    <p className="text-[13px]" style={{ color: "#6B7280" }}>
                      Status: Active
                      {pending && (
                        <> • Next payment: {formatCurrency(pending.total_charged)} on {formatDate(pending.period_end)}</>
                      )}
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-all"
                    style={{ background: "#10B981" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
                    onClick={() => {
                      // Store impersonation context and navigate
                      sessionStorage.setItem("admin_viewing_client", client.user_id);
                      sessionStorage.setItem("admin_viewing_client_name", client.company_name ?? "Client");
                      navigate("/billing");
                    }}
                  >
                    <Eye className="h-4 w-4" /> View Portal
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

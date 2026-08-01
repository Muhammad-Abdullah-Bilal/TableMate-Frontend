"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  Clock,
  Coffee,
  CheckCircle,
  Truck,
  RefreshCw,
  AlertCircle,
  LogOut,
  ChevronRight,
  User,
  Lock,
  Mail,
  ArrowLeft,
  DollarSign,
  MapPin,
  Smartphone
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone_number: string;
  role: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  item_total: number;
}

interface Order {
  id: string;
  user_id: number;
  phone_number: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  delivery_address: string;
  created_at: string;
}

export default function ChefDashboard() {
  const [chef, setChef] = useState<UserProfile | null>(null);
  
  // Auth Inputs
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check login on load
  useEffect(() => {
    const cachedUser = sessionStorage.getItem("tablemate_user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser) as UserProfile;
        if (parsed.role === "chef") {
          setChef(parsed);
        }
      } catch (e) {
        console.error("Error parsing cached session:", e);
      }
    }
  }, []);

  // Fetch orders when chef is authenticated
  useEffect(() => {
    if (!chef) return;

    fetchOrders();

    // Setup polling interval to refresh every 7 seconds
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchOrders(true);
      }, 7000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chef, autoRefresh]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError("Please fill in both fields");
      setAuthLoading(false);
      return;
    }

    // Direct check for hardcoded chef credentials as requested:
    // chef@gmail.com / chef@123
    const email = emailInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    if (email === "chef@gmail.com" && pass === "chef@123") {
      try {
        // Authenticate with the backend first
        const res = await fetch(`${API_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass }),
        });

        const data = await res.json();
        if (res.ok) {
          const loggedUser = data.user as UserProfile;
          setChef(loggedUser);
          sessionStorage.setItem("tablemate_user", JSON.stringify(loggedUser));
        } else {
          setAuthError(data.detail || "Authentication error");
        }
      } catch (e) {
        // Offline / mock fallback
        const mockChef: UserProfile = {
          id: 1,
          email: "chef@gmail.com",
          name: "Head Chef",
          phone_number: "0000000000",
          role: "chef"
        };
        setChef(mockChef);
        sessionStorage.setItem("tablemate_user", JSON.stringify(mockChef));
      }
    } else {
      setAuthError("Invalid Chef credentials. Try chef@gmail.com / chef@123");
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("tablemate_user");
    setChef(null);
    setOrders([]);
  };

  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) setLoadingOrders(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API_URL}/api/orders?role=chef`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setErrorMessage("Failed to fetch order queue");
      }
    } catch (e) {
      setErrorMessage("Could not connect to database backend");
    } finally {
      if (!isBackground) setLoadingOrders(false);
    }
  };

  // Transition Order Status: pending -> in baking -> baked -> in-delivery -> Delivered
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: nextStatus }),
      });

      if (res.ok) {
        // Optimistically update status locally
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      } else {
        alert("Failed to update status on server");
      }
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
      case "in baking":
        return <Coffee className="w-5 h-5 text-amber-400 animate-bounce" />;
      case "baked":
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case "in-delivery":
        return <Truck className="w-5 h-5 text-emerald-400 animate-pulse" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "in baking":
        return "bg-amber-500/25 text-amber-300 border-amber-500/40";
      case "baked":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "in-delivery":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "delivered":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getNextStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { label: "Start Baking", next: "in baking", color: "from-amber-500 to-amber-600" };
      case "in baking":
        return { label: "Mark Baked", next: "baked", color: "from-blue-500 to-blue-600" };
      case "baked":
        return { label: "Dispatch Delivery", next: "in-delivery", color: "from-emerald-500 to-emerald-600" };
      case "in-delivery":
        return { label: "Confirm Delivered", next: "delivered", color: "from-zinc-700 to-zinc-800 text-zinc-200" };
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 glass backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 shadow-lg bg-zinc-900">
            <Image src="/logo.png" alt="TableMate Logo" fill className="object-cover" priority sizes="40px" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              TableMate Kitchen
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Chef Console
              </span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium">Live Baking Pipeline</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Customer Page
          </a>
          
          {chef && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      {!chef ? (
        /* Chef Login Screen */
        <main className="flex flex-col items-center justify-center flex-1 p-6 text-center max-w-xl mx-auto w-full">
          <div className="relative mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full blur-lg opacity-40 animate-pulse" />
            <div className="relative p-6 bg-zinc-900 border border-white/10 rounded-full">
              <UtensilsCrossed className="w-16 h-16 text-amber-400" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans">
            Chef Authentication
          </h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Enter the authorized chef account credentials to access the live food preparation pipeline.
          </p>

          <div className="w-full max-w-md p-6 bg-zinc-900/60 border border-white/10 rounded-2xl glass text-left shadow-xl space-y-4">
            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Chef Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="chef@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 text-sm bg-zinc-950/70 border border-white/10 rounded-xl glass-input text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Kitchen Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 text-sm bg-zinc-950/70 border border-white/10 rounded-xl glass-input text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-6 font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50"
              >
                {authLoading ? "Authorizing..." : "Access Kitchen Pipeline"}
              </button>
            </form>
          </div>
        </main>
      ) : (
        /* Chef Orders Panel */
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Status Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-white/5">
            <div>
              <h3 className="text-base font-bold text-white">Live Kitchen Order Preparation Queue</h3>
              <p className="text-xs text-zinc-400 font-medium">Manage user food lifecycles in real-time</p>
            </div>
            
            <div className="flex items-center gap-3.5 self-end md:self-auto">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-white/10 bg-zinc-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                Auto-poll Queue (7s)
              </label>

              <button
                onClick={() => fetchOrders()}
                disabled={loadingOrders}
                className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 px-3.5 py-1.5 rounded-lg transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2 max-w-xl">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loadingOrders && orders.length === 0 ? (
            <div className="text-center py-24 text-zinc-500 font-mono text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Loading order pipelines...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-28 border border-dashed border-white/5 rounded-2xl">
              <UtensilsCrossed className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <h4 className="text-base font-bold text-zinc-400">Preparation Queue Empty</h4>
              <p className="text-xs text-zinc-500 mt-1">No orders have been submitted yet. Keep polling!</p>
            </div>
          ) : (
            /* Orders Grid Grid layout */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => {
                const nextStatusObj = getNextStatusText(order.status);
                
                return (
                  <div
                    key={order.id}
                    className="flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-zinc-900/80 transition-all font-mono space-y-4"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{order.id}</span>
                      
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="flex-1 space-y-2 bg-zinc-950/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Ordered Dishes</span>
                      <div className="space-y-1.5 text-xs text-zinc-300">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate max-w-[200px]">
                              {item.name} <span className="text-zinc-500 font-semibold">x{item.quantity}</span>
                            </span>
                            <span className="text-zinc-400">Rs. {item.item_total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata & Customer info */}
                    <div className="space-y-2 text-xs text-zinc-400">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span className="text-zinc-300 break-words">{order.delivery_address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="text-zinc-300">{order.phone_number}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                        <span>Total: <strong className="text-amber-400 font-mono">Rs. {order.total_price.toLocaleString()}</strong></span>
                        <span>
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          | {new Date(order.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* State Actions Buttons */}
                    {nextStatusObj && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, nextStatusObj.next)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-gradient-to-r ${nextStatusObj.color} hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md`}
                      >
                        {nextStatusObj.label}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Cancel Action if active and not already cancelled */}
                    {order.status.toLowerCase() !== "cancelled" && order.status.toLowerCase() !== "delivered" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "Cancelled")}
                        className="w-full py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/20 transition-all"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Footer Branding */}
      <footer className="text-center py-3 text-[10px] text-zinc-600 bg-zinc-950 border-t border-white/5 mt-auto shrink-0 font-mono">
        © 2026 TableMate Kitchen Queue. Unified PostgreSQL Pipeline.
      </footer>

    </div>
  );
}

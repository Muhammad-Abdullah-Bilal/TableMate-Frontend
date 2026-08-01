"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Menu as MenuIcon,
  User,
  ShoppingBag,
  Send,
  RefreshCw,
  AlertCircle,
  Trash2,
  Sparkles,
  Smartphone,
  CheckCircle,
  Clock,
  Truck,
  Coffee,
  LogOut,
  Utensils,
  ChevronRight,
  Search,
  Lock,
  Mail,
  UserCheck,
  MapPin,
  UtensilsCrossed,
  PlusCircle
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone_number: string;
  role: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  item_total: number;
}

interface Order {
  id: string;
  phone_number: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  delivery_address: string;
  created_at: string;
}

interface UserMemory {
  user_id: number;
  email: string;
  name: string | null;
  phone_number: string | null;
  address: string | null;
  preferences: string | null;
}

interface ChatMessage {
  role: string;
  content: string | null;
  name?: string | null;
  tool_call_id?: string | null;
  tool_calls?: any;
}

function DishCardsGrid({ 
  ids, 
  menuData, 
  setInputText 
}: { 
  ids: number[]; 
  menuData: Record<string, MenuItem[]>; 
  setInputText: React.Dispatch<React.SetStateAction<string>>; 
}) {
  const getDietTags = (item: MenuItem) => {
    const tags: string[] = [];
    const nameLower = item.name.toLowerCase();
    const descLower = (item.description || "").toLowerCase();
    
    // Veg/Vegan detection
    if (nameLower.includes("veg") || descLower.includes("veg") || nameLower.includes("margherita") || nameLower.includes("paneer") || nameLower.includes("lassi") || nameLower.includes("samosa") || nameLower.includes("kheer") || nameLower.includes("halwa")) {
      if (nameLower.includes("vegan") || descLower.includes("vegan")) {
        tags.push("VEGAN");
      } else {
        tags.push("VEGETARIAN");
      }
    }
    
    // Spicy detection
    if (nameLower.includes("tikka") || nameLower.includes("fajita") || nameLower.includes("zinger") || nameLower.includes("bbq") || nameLower.includes("karahi") || nameLower.includes("biryani") || nameLower.includes("kebab") || descLower.includes("spic") || descLower.includes("chili") || descLower.includes("hot")) {
      tags.push("SPICY");
    }
    
    // Beverage detection
    if (item.category.toLowerCase() === "drinks") {
      tags.push("REFRESHING");
    }
    
    // Crispy
    if (descLower.includes("crisp") || nameLower.includes("zinger")) {
      tags.push("CRISPY");
    }
    
    // Default tag if none
    if (tags.length === 0) {
      tags.push("PREMIUM");
    }
    
    return tags;
  };

  const getItemImage = (itemName: string): string => {
    const name = itemName.toLowerCase().trim();
    if (name.includes("chicken tikka")) return "/Tandoori Chicken Tikka Pizza.jpg";
    if (name.includes("fajita")) return "/Chicken fajita pizza.jpg";
    if (name.includes("pepperoni")) return "/Pepperoni Pizza.jpg";
    if (name.includes("margherita")) return "/Margherita Pizza.jpg";
    if (name.includes("supreme")) return "/Veggie Supreme pizza.jpg";
    if (name.includes("zinger")) return "/Crispy Chicken Zinger Burger.jpg";
    if (name.includes("smash")) return "/Beef Smash burger.jpg";
    if (name.includes("bbq")) return "/BBQ Grilled Chicken burger.jpg";
    if (name.includes("cheese")) return "/Cheese Burger.jpg";
    if (name.includes("paneer burger")) return "/Veggie Paneer burger.jpg";
    if (name.includes("karahi")) return "/Mutton Karahi.jpg";
    if (name.includes("handi")) return "/Chicken Handi.jpg";
    if (name.includes("biryani")) return "/Beef Biryani.jpg";
    if (name.includes("seekh kebab") || name.includes("seekh kabab") || name.includes("chicken kabab")) return "/Chicken kabab.jpg";
    if (name.includes("chaat") || name.includes("samosa")) return "/chaats.jpg";
    if (name.includes("paneer tikka")) return "/paneer tikka.jpg";
    if (name.includes("kheer")) return "/kheer.jpg";
    if (name.includes("halwa")) return "/halwa.jpg";
    if (name.includes("lava cake")) return "/molten lava cake.jpg";
    if (name.includes("lassi")) return "/sweet lassi.jpg";
    if (name.includes("margarita")) return "/Mint Margarita.jpg";
    if (name.includes("lime soda")) return "/fresh lime soda.jpg";
    
    return "/menu.jpg";
  };

  // Find menu items in context
  const items = ids.map(id => {
    for (const cat in menuData) {
      const found = menuData[cat].find(i => i.id === id);
      if (found) return found;
    }
    return null;
  }).filter((item): item is MenuItem => item !== null);

  if (items.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-zinc-500 italic font-sans">
        Loading menu items...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 bg-zinc-900/60 rounded-2xl border border-white/10 font-sans">
      {items.map(item => {
        const tags = getDietTags(item);
        return (
          <div 
            key={item.id} 
            className="flex flex-col bg-zinc-950/80 rounded-xl border border-white/5 overflow-hidden hover:border-amber-500/30 hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
            onClick={() => {
              setInputText(prev => `${prev}${prev ? ", " : ""}I want to order ${item.name}`);
            }}
          >
            {/* Image */}
            <div className="relative w-full h-32 bg-zinc-900 overflow-hidden border-b border-white/5">
              <Image 
                src={getItemImage(item.name)} 
                alt={item.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                sizes="(max-width: 768px) 100vw, 30vw"
              />
            </div>
            
            {/* Body */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors leading-snug">
                    {item.name}
                  </h4>
                  <span className="text-red-500 font-bold font-mono text-sm shrink-0">
                    Rs.{item.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                  {item.description || "Freshly prepared traditional recipe."}
                </p>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {tags.map(tag => (
                  <span 
                    key={tag} 
                    className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded uppercase ${
                      tag === "SPICY" 
                        ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                        : tag === "VEGAN" || tag === "VEGETARIAN" 
                        ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                        : "bg-zinc-800 text-zinc-400 border border-white/5"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Markdown({ 
  content, 
  menuData, 
  setInputText 
}: { 
  content: string; 
  menuData: Record<string, MenuItem[]>; 
  setInputText: React.Dispatch<React.SetStateAction<string>>; 
}) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableAlignments: ("left" | "center" | "right")[] = [];
  let tableRows: string[][] = [];
  
  let inList = false;
  let listItems: React.ReactNode[] = [];

  let inDishCards = false;
  let dishCardContent = "";
  
  const parseInline = (text: string) => {
    // Bold: **text** -> <strong>
    const parts = text.split("**");
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-bold text-amber-400">{part}</strong>;
      }
      return part;
    });
  };

  const flushList = (key: any) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2 space-y-1 text-zinc-200 font-sans">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: any) => {
    if (tableRows.length > 0 || tableHeaders.length > 0) {
      elements.push(
        <div key={`table-wrapper-${key}`} className="overflow-x-auto my-3 border border-white/10 rounded-xl bg-zinc-950/40 font-sans">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            {tableHeaders.length > 0 && (
              <thead className="bg-zinc-900/80 text-zinc-300 font-semibold">
                <tr>
                  {tableHeaders.map((h, i) => {
                    const align = tableAlignments[i] || "left";
                    return (
                      <th 
                        key={i} 
                        className={`px-4 py-3 text-xs uppercase tracking-wider font-mono ${
                          align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-white/5 text-zinc-200">
              {tableRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cellIndex) => {
                    const align = tableAlignments[cellIndex] || "left";
                    return (
                      <td 
                        key={cellIndex} 
                        className={`px-4 py-2.5 text-zinc-300 text-xs ${
                          align === "right" ? "text-right font-mono" : align === "center" ? "text-center" : "text-left"
                        }`}
                      >
                        {parseInline(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableAlignments = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Dish Cards Block
    if (line.startsWith("```dish-cards")) {
      flushList(i);
      flushTable(i);
      inDishCards = true;
      dishCardContent = "";
      continue;
    }

    if (inDishCards) {
      if (line.startsWith("```")) {
        inDishCards = false;
        try {
          const cleanJson = dishCardContent.replace(/'/g, '"').trim();
          const ids: number[] = JSON.parse(cleanJson);
          elements.push(
            <DishCardsGrid 
              key={`dish-cards-${i}`} 
              ids={ids} 
              menuData={menuData} 
              setInputText={setInputText} 
            />
          );
        } catch (e) {
          console.error("Failed to parse dish-cards JSON:", dishCardContent, e);
          elements.push(
            <p key={`dish-cards-err-${i}`} className="text-xs text-red-400 italic font-sans">
              [Failed to render dish cards]
            </p>
          );
        }
        continue;
      }
      dishCardContent += line;
      continue;
    }

    // Table Row
    if (line.startsWith("|")) {
      flushList(i);
      inTable = true;
      const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isSeparator = cells.every(c => c.startsWith(":") || c.endsWith(":") || c.replace(/-/g, "") === "");
      
      if (isSeparator) {
        tableAlignments = cells.map(c => {
          const left = c.startsWith(":");
          const right = c.endsWith(":");
          if (left && right) return "center";
          if (right) return "right";
          return "left";
        });
      } else if (tableHeaders.length === 0 && tableRows.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable(i);
    }

    // List Item
    if (line.startsWith("*") || line.startsWith("-")) {
      inList = true;
      const content = line.substring(1).trim();
      listItems.push(
        <li key={`li-${i}-${content}`} className="text-zinc-200">
          {parseInline(content)}
        </li>
      );
      continue;
    } else {
      flushList(i);
    }

    // Headings (###)
    if (line.startsWith("###")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-zinc-100 mt-4 mb-2 font-sans">
          {parseInline(line.substring(3).trim())}
        </h3>
      );
      continue;
    }

    // Empty space
    if (line === "") {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="text-sm text-zinc-200 leading-relaxed my-1 font-sans">
        {parseInline(line)}
      </p>
    );
  }

  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

export default function Home() {
  // Authentication & Session States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState("");

  // Auth Inputs
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [authError, setAuthError] = useState("");

  // UI Panel States
  const [activeTab, setActiveTab] = useState<"menu" | "profile" | "orders">("menu");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Data States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [memory, setMemory] = useState<UserMemory>({
    user_id: 0,
    email: "",
    name: null,
    phone_number: null,
    address: null,
    preferences: null,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Verify backend connectivity
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (res.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch (e) {
        setBackendOnline(false);
      }
    };
    checkStatus();
    fetchMenu();
  }, []);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.detail || "Authentication failed");
        return;
      }

      const loggedUser = data.user as UserProfile;
      
      // If Chef logs in, redirect to chef dashboard
      if (loggedUser.role === "chef") {
        sessionStorage.setItem("tablemate_user", JSON.stringify(loggedUser));
        window.location.href = "/chef";
        return;
      }

      setUser(loggedUser);
      setIsConnected(true);
      
      // Setup session ID
      const sessId = `sess-${loggedUser.id}-${Date.now().toString(36)}`;
      setSessionId(sessId);

      // Fetch user data
      await fetchMemory(loggedUser.id);
      await fetchOrders(loggedUser.id);
      await fetchChatHistory(sessId, loggedUser.id);

      // Clear input fields
      setPasswordInput("");
    } catch (e) {
      setAuthError("Failed to reach authentication server");
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!emailInput.trim() || !passwordInput.trim() || !phoneInput.trim()) {
      setAuthError("Email, password, and phone number are required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput.trim(),
          phone_number: phoneInput.trim(),
          name: nameInput.trim() || null,
          address: addressInput.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.detail || "Registration failed");
        return;
      }

      // Automatically transition to login
      setAuthMode("login");
      setAuthError("Registration successful! Please login.");
      setPasswordInput("");
    } catch (e) {
      setAuthError("Failed to reach server during registration");
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUser(null);
    setSessionId("");
    setMessages([]);
    setOrders([]);
    setMemory({ user_id: 0, email: "", name: null, phone_number: null, address: null, preferences: null });
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API_URL}/api/menu`);
      if (res.ok) {
        const data = await res.json();
        setMenuData(data);
      }
    } catch (e) {
      console.error("Error fetching menu:", e);
    }
  };

  const fetchMemory = async (userId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/memory?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMemory(data);
      }
    } catch (e) {
      console.error("Error fetching memory:", e);
    }
  };

  const fetchOrders = async (userId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/orders?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Error fetching orders:", e);
    }
  };

  const fetchChatHistory = async (sessId: string, userId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/history?session_id=${sessId}&user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          // Add default welcome message
          setMessages([
            {
              role: "assistant",
              content:
                "Hello! I am TableMate, your personal restaurant ordering assistant. What would you like to eat today? You can ask to view our premium menu, place an order, or check status of any order!",
            },
          ]);
        } else {
          setMessages(data);
        }
      }
    } catch (e) {
      console.error("Error fetching chat history:", e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading || !isConnected || !user) return;

    if (!textToSend) setInputText("");

    // Add user message locally for responsive UI
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          user_id: user.id,
        }),
      });

      if (res.ok) {
        await fetchChatHistory(sessionId, user.id);
        await fetchMemory(user.id);
        await fetchOrders(user.id);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I encountered an error trying to process that. Please verify the backend is online.",
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not reach TableMate's brain. Please verify the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!sessionId || !user) return;
    try {
      const res = await fetch(`${API_URL}/api/chat/clear?session_id=${sessionId}&user_id=${user.id}`, {
        method: "POST",
      });
      if (res.ok) {
        setMessages([
          {
            role: "assistant",
            content: "Short-term conversation history cleared. How can TableMate help you now?",
          },
        ]);
      }
    } catch (e) {
      console.error("Error clearing history:", e);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />;
      case "in baking":
        return <Coffee className="w-4 h-4 text-amber-500 animate-spin" />;
      case "baked":
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case "in-delivery":
        return <Truck className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "in baking":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "baked":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "in-delivery":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-zinc-950 text-zinc-50 antialiased selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Banner / Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 glass backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 shadow-lg bg-zinc-900">
            <Image src="/logo.png" alt="TableMate Logo" fill className="object-cover" priority sizes="40px" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              TableMate
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                v1.2 Secure
              </span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium">Smart Dining Portal</p>
          </div>
        </div>

        {/* Backend Status Check */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-zinc-400">Server:</span>
            {backendOnline === null ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                Checking
              </span>
            ) : backendOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Offline
              </span>
            )}
          </div>

          <a
            href="/chef"
            className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Chef Console
          </a>
          
          {isConnected && user && (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      {!isConnected || !user ? (
        /* Login / Register Landing Screen */
        <main className="flex flex-col items-center justify-center flex-1 p-6 text-center max-w-xl mx-auto w-full">
          <div className="relative mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500 to-pink-500 rounded-full blur-lg opacity-45 animate-pulse" />
            <div className="relative w-24 h-24 overflow-hidden bg-zinc-900 border border-white/10 rounded-full shadow-2xl">
              <Image src="/logo.png" alt="TableMate Logo Large" fill className="object-cover" priority sizes="96px" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500">TableMate</span>
          </h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Your premium restaurant dining ordering assistant. Sign up or log in to place orders in PKR and build your custom memory profile.
          </p>

          {/* Authentication Card */}
          <div className="w-full max-w-md p-6 bg-zinc-900/60 border border-white/10 rounded-2xl glass text-left shadow-xl space-y-4">
            <div className="flex border-b border-white/10 pb-3">
              <button
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`flex-1 text-center py-2 text-sm font-bold transition-all ${
                  authMode === "login" ? "text-amber-400 border-b-2 border-amber-500" : "text-zinc-500 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`flex-1 text-center py-2 text-sm font-bold transition-all ${
                  authMode === "register" ? "text-amber-400 border-b-2 border-amber-500" : "text-zinc-500 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === "login" ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-4 text-sm bg-zinc-950/70 border border-white/10 rounded-xl glass-input text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Password</label>
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
                  disabled={backendOnline === false}
                  className="w-full py-3 px-6 font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50"
                >
                  Sign In
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Full Name</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full py-2 pl-9 pr-4 text-sm bg-zinc-950/70 border border-white/10 rounded-xl glass-input text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full py-2 pl-9 pr-4 text-sm bg-zinc-950/70 border border-white/10 rounded-xl glass-input text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full py-2 pl-9 pr-4 text-sm bg-zinc-950/70 border border-white/10 rounded-xl glass-input text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Phone Number *</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      placeholder="03441234567"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full py-2 pl-9 pr-4 text-sm bg-zinc-950/70 border border-white/10 rounded-xl glass-input text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Street, City"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      className="w-full py-2 pl-9 pr-4 text-sm bg-zinc-950/70 border border-white/10 rounded-xl glass-input text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={backendOnline === false}
                  className="w-full py-2.5 px-6 font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  Create Account
                </button>
              </form>
            )}
          </div>
          
          <div className="mt-6 flex justify-center w-full max-w-md px-2 text-xs text-zinc-500">
            <span>🔒 Secure Postgres Encryption</span>
          </div>
        </main>
      ) : (
        /* Authenticated Ordering Dashboard */
        <main className="flex flex-col flex-1 overflow-hidden h-[calc(100vh-73px)] items-center bg-zinc-950">
          
          {/* Center Chat Panel taking full width */}
          <section className="flex flex-col w-full max-w-4xl flex-1 bg-zinc-950/40 border-x border-white/10 relative overflow-hidden h-full">
            {/* Conversation Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-zinc-900/30 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Guest: {user.name} | Session: {sessionId.substring(15, 25)}...
                </span>
              </div>
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Conversation
              </button>
            </div>

            {/* Chat Box Messages list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, index) => {
                if (msg.role === "tool") {
                  return null;
                }

                if (msg.role === "assistant" && msg.tool_calls) {
                  return null;
                }

                const isUser = msg.role === "user";

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : ""} animate-slide-in`}
                  >
                    {/* Avatar */}
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isUser
                          ? "bg-zinc-800 border border-white/10"
                          : "bg-gradient-to-tr from-amber-500 to-amber-600 shadow-md shadow-amber-500/10 text-black"
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`flex flex-col max-w-[75%] rounded-2xl px-4.5 py-3 border ${
                        isUser
                          ? "bg-zinc-900 border-white/10 rounded-tr-none"
                          : "bg-zinc-900/70 border-white/5 rounded-tl-none"
                      }`}
                    >
                      <span className="text-xs text-zinc-500 font-medium mb-1 font-mono">
                        {isUser ? "You" : "TableMate"}
                      </span>
                      <div className="text-sm text-zinc-100 leading-relaxed">
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <Markdown content={msg.content || ""} menuData={menuData} setInputText={setInputText} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loader indicator */}
              {loading && (
                <div className="flex items-start gap-3.5 animate-slide-in">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-black shrink-0 animate-bounce">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col bg-zinc-900/70 border border-white/5 rounded-2xl rounded-tl-none px-5 py-4 max-w-[75%]">
                    <span className="text-xs text-zinc-500 font-medium mb-1 font-mono">TableMate</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Actions Suggestions */}
            <div className="px-6 py-2 flex flex-wrap gap-2 border-t border-white/5 bg-zinc-900/10">
              <button
                onClick={() => handleSendMessage("Show me the menu")}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 transition-all"
              >
                📋 View Menu (PKR)
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    "Search menu for burger category Mains"
                  )
                }
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 transition-all"
              >
                🔍 Search Burger
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    "Place an order for a Wagyu Burger. Deliver to my address."
                  )
                }
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 transition-all"
              >
                🍔 Order Burger
              </button>
              <button
                onClick={() => handleSendMessage("Cancel my last order")}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 transition-all"
              >
                ❌ Cancel Order
              </button>
            </div>

            {/* Message Input Footer */}
            <div className="p-4 border-t border-white/10 bg-zinc-950 sticky bottom-0 z-10 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask TableMate to check the menu, search, order, or cancel..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={loading}
                  className="w-full py-4 pl-4 pr-14 text-sm bg-zinc-900/60 text-white rounded-xl border border-white/15 glass-input shadow-inner focus:outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputText.trim()}
                  className="absolute right-2 p-2.5 rounded-lg bg-amber-500 text-black hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-amber-500 disabled:pointer-events-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

        </main>
      )}
      
      {/* Footer Branding */}
      <footer className="text-center py-3 text-[10px] text-zinc-600 bg-zinc-950 border-t border-white/5 shrink-0">
        © 2026 TableMate Dining Portal. Secure Unified PostgreSQL backend.
      </footer>

    </div>
  );
}

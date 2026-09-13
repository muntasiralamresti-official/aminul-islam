"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Users, GraduationCap, CreditCard, CalendarCheck, Settings, LogOut, Menu, X, Search, PieChart, Download } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Batches", href: "/dashboard/batches", icon: GraduationCap },
  { name: "Students", href: "/dashboard/students", icon: Users },
  { name: "Fees & Payments", href: "/dashboard/fees", icon: CreditCard },
  { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
  { name: "Reports", href: "/dashboard/reports", icon: PieChart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const mobileNavigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/dashboard/students", icon: Users },
  { name: "Fees", href: "/dashboard/fees", icon: CreditCard },
  { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
];

const requestInstall = () => window.dispatchEvent(new Event("aminul-islam-install-request"));
const haptic = (duration = 8) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(duration);
};

function InstallButton({ mobile = false }) {
  return <button type="button" onClick={() => { haptic(); requestInstall(); }} className={clsx(mobile ? "group flex w-full items-center rounded-xl px-4 py-3 text-base font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-700" : "group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700")}><Download className={clsx(mobile ? "mr-4 h-5 w-5" : "mr-3 h-6 w-6", "text-gray-400 group-hover:text-blue-600")} aria-hidden="true" />Install App</button>;
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [centerName, setCenterName] = useState("Aminul Islam");
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const cachedName = sessionStorage.getItem("aminul-islam-center-name");
    if (cachedName) {
      setCenterName(cachedName);
      return;
    }

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.centerName) {
          setCenterName(data.centerName);
          sessionStorage.setItem("aminul-islam-center-name", data.centerName);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    mobileNavigation.forEach((item) => router.prefetch(item.href));
    router.prefetch("/dashboard/batches");
    router.prefetch("/dashboard/reports");
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    haptic();
    router.push(query ? `/dashboard/students?search=${encodeURIComponent(query)}` : "/dashboard/students");
  };

  const isStackRoute = pathname.split("/").filter(Boolean).length > 2;

  return <div className="min-h-screen bg-gray-100 flex">
    {/* Mobile drawer */}
    <div className={clsx("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "pointer-events-auto" : "pointer-events-none")} role="dialog" aria-modal="true" aria-hidden={!sidebarOpen}>
      <div className={clsx("absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-200", sidebarOpen ? "opacity-100" : "opacity-0")} aria-hidden="true" onClick={() => setSidebarOpen(false)} />
      <div className={clsx("relative flex h-full w-[min(86vw,320px)] flex-col bg-white pt-[max(1rem,env(safe-area-inset-top))] pb-4 shadow-2xl transition-transform duration-200 ease-out", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex flex-shrink-0 items-center justify-between px-5 pb-5">
          <div className="flex min-w-0 items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm"><GraduationCap className="h-6 w-6 text-white" /></div>
            <span className="ml-3 truncate text-lg font-bold text-gray-900">{centerName}</span>
          </div>
          <button type="button" className="ml-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900" onClick={() => { haptic(); setSidebarOpen(false); }}><span className="sr-only">Close menu</span><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="mt-4 flex-1 overflow-y-auto px-3"><nav className="space-y-1.5">{navigation.map((item) => <Link key={item.name} href={item.href} onClick={() => haptic()} className={clsx(pathname === item.href ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900", "group flex min-h-12 items-center rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors")}><item.icon className={clsx(pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-blue-600", "mr-4 h-5 w-5 flex-shrink-0")} aria-hidden="true" />{item.name}</Link>)}<InstallButton mobile /></nav></div>
        <div className="safe-bottom border-t border-gray-100 p-4"><div className="flex items-center justify-between rounded-xl bg-gray-50 p-3"><div className="min-w-0 pr-2"><p className="truncate text-sm font-bold text-gray-800">{session?.user?.name || "User"}</p><p className="truncate text-xs font-medium capitalize text-gray-500">{session?.user?.role || "Admin"}</p></div><button onClick={() => { haptic(12); signOut({ callbackUrl: "/login" }); }} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm hover:bg-red-50 hover:text-red-600"><LogOut className="h-5 w-5" /></button></div></div>
      </div>
    </div>

    {/* Desktop sidebar */}
    <div className="hidden flex-shrink-0 lg:flex"><div className="flex w-64 flex-col"><div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white"><div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4"><div className="flex flex-shrink-0 items-center px-4"><GraduationCap className="h-8 w-8 text-blue-600" /><span className="ml-2 truncate text-xl font-bold text-gray-900">{centerName}</span></div><nav className="mt-8 flex-1 space-y-1 bg-white px-2">{navigation.map((item) => <Link key={item.name} href={item.href} className={clsx(pathname === item.href ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900", "group flex items-center rounded-md px-2 py-2 text-sm font-medium")}><item.icon className={clsx(pathname === item.href ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500", "mr-3 h-6 w-6 flex-shrink-0")} aria-hidden="true" />{item.name}</Link>)}<InstallButton /></nav></div><div className="flex flex-shrink-0 border-t border-gray-200 p-4"><div className="group block w-full"><div className="flex items-center justify-between"><div className="truncate pr-2"><p className="truncate text-sm font-medium text-gray-700">{session?.user?.name || "User"}</p><p className="truncate text-xs font-medium capitalize text-gray-500">{session?.user?.role || "Role"}</p></div><button onClick={() => signOut({ callbackUrl: "/login" })} className="p-2 text-gray-400 hover:text-red-500"><LogOut className="h-5 w-5" /></button></div></div></div></div></div></div>

    <div className="min-w-0 flex flex-1 flex-col overflow-hidden">
      {/* Mobile app header */}
      <div className="safe-top flex min-h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600"><GraduationCap className="h-5 w-5 text-white" /></div>
          <div className="ml-2.5 min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-wider text-blue-600">Coaching Center</p><p className="truncate text-sm font-bold text-gray-900">{centerName}</p></div>
        </div>
        <button type="button" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900" onClick={() => { haptic(); setSidebarOpen(true); }}><span className="sr-only">Open menu</span><Menu className="h-5 w-5" aria-hidden="true" /></button>
      </div>

      {/* Search */}
      <header className="border-b border-gray-200 bg-white px-3 py-2.5 sm:px-6 lg:px-8 lg:py-3"><form onSubmit={handleSearch} className="relative mx-auto max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" /><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search students by name, roll, phone, or batch..." aria-label="Search students" className="block min-h-11 w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-none outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" /></form></header>

      <main className="relative z-0 flex-1 overflow-y-auto pb-24 focus:outline-none lg:pb-0"><div className="py-3 sm:py-6"><div key={pathname} className={clsx("mx-auto max-w-7xl px-3 sm:px-6 md:px-8 page-transition", isStackRoute && "page-transition-stack")}>{children}</div></div></main>
    </div>

    {/* Native-style mobile bottom navigation */}
    <nav className="safe-bottom fixed bottom-0 z-40 flex w-full items-center border-t border-gray-200 bg-white/95 px-1 pt-1 shadow-[0_-4px_18px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden" aria-label="Mobile navigation">
      {mobileNavigation.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
        return <Link key={item.name} href={item.href} prefetch onClick={() => haptic()} aria-current={active ? "page" : undefined} className={clsx(active ? "text-blue-600" : "text-gray-500 hover:text-gray-900", "native-tab flex min-h-14 flex-1 flex-col items-center justify-center rounded-xl px-1 py-1 text-[10px] font-semibold transition-colors active:scale-95 active:opacity-70")}><span className={clsx("native-tab-icon mb-0.5 flex h-7 w-10 items-center justify-center rounded-full", active && "native-tab-icon-active")}><item.icon className="h-[19px] w-[19px]" aria-hidden="true" /></span>{item.name}</Link>;
      })}
      <button type="button" onClick={() => { haptic(); setSidebarOpen(true); }} className="native-tab flex min-h-14 flex-1 flex-col items-center justify-center rounded-xl px-1 py-1 text-[10px] font-semibold text-gray-500 transition-colors hover:text-gray-900 active:scale-95 active:opacity-70"><span className="native-tab-icon mb-0.5 flex h-7 w-10 items-center justify-center rounded-full"><Menu className="h-[19px] w-[19px]" /></span>More</button>
    </nav>
  </div>;
}

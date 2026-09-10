"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  CalendarCheck,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Search,
  PieChart,
  Download,
} from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Batches", href: "/dashboard/batches", icon: GraduationCap },
  { name: "Students", href: "/dashboard/students", icon: Users },
  { name: "Exams & Results", href: "/dashboard/exams", icon: BookOpen },
  { name: "Fees & Payments", href: "/dashboard/fees", icon: CreditCard },
  { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
  { name: "Reports", href: "/dashboard/reports", icon: PieChart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const requestInstall = () => {
  window.dispatchEvent(new Event("aminul-islam-install-request"));
};

function InstallButton({ mobile = false }) {
  return (
    <button
      type="button"
      onClick={requestInstall}
      className={clsx(
        mobile
          ? "group flex w-full items-center rounded-xl px-4 py-3 text-base font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-700"
          : "group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700",
      )}
    >
      <Download
        className={clsx(
          mobile ? "mr-4 h-5 w-5" : "mr-3 h-6 w-6",
          "text-gray-400 group-hover:text-blue-600",
        )}
        aria-hidden="true"
      />
      Install App
    </button>
  );
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [centerName, setCenterName] = useState("Aminul Islam");
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.centerName) setCenterName(data.centerName);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(
      query
        ? `/dashboard/students?search=${encodeURIComponent(query)}`
        : "/dashboard/students",
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar */}
      <div
        className={clsx("fixed inset-0 z-40 lg:hidden", sidebarOpen ? "block" : "hidden")}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />

        <div className="relative flex h-full w-full max-w-[280px] flex-col bg-white pt-5 pb-4 shadow-xl transition-transform duration-300">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-shrink-0 items-center px-6">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="ml-3 truncate text-xl font-bold text-gray-900">{centerName}</span>
          </div>

          <div className="mt-8 h-0 flex-1 overflow-y-auto">
            <nav className="space-y-2 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    pathname === item.href
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center rounded-xl px-4 py-3 text-base font-semibold transition-all",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={clsx(
                      pathname === item.href
                        ? "text-white"
                        : "text-gray-400 group-hover:text-blue-600",
                      "mr-4 h-5 w-5 flex-shrink-0",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <InstallButton mobile />
            </nav>
          </div>

          <div className="flex flex-shrink-0 border-t border-gray-100 p-4">
            <div className="group block w-full">
              <div className="flex items-center justify-between">
                <div className="truncate pr-2 pl-2">
                  <p className="truncate text-sm font-bold text-gray-800">{session?.user?.name || "User"}</p>
                  <p className="truncate text-xs font-medium capitalize text-gray-500">{session?.user?.role || "Admin"}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-full bg-gray-50 p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden flex-shrink-0 lg:flex">
        <div className="flex w-64 flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="ml-2 truncate text-xl font-bold text-gray-900">{centerName}</span>
              </div>
              <nav className="mt-8 flex-1 space-y-1 bg-white px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                    )}
                  >
                    <item.icon
                      className={clsx(
                        pathname === item.href
                          ? "text-blue-700"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-6 w-6 flex-shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
                <InstallButton />
              </nav>
            </div>

            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <div className="group block w-full">
                <div className="flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="truncate text-sm font-medium text-gray-700">{session?.user?.name || "User"}</p>
                    <p className="truncate text-xs font-medium capitalize text-gray-500">{session?.user?.role || "Role"}</p>
                  </div>
                  <button onClick={() => signOut({ callbackUrl: "/login" })} className="p-2 text-gray-400 hover:text-red-500">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-4 lg:hidden">
          <div className="flex items-center overflow-hidden">
            <GraduationCap className="h-8 w-8 flex-shrink-0 text-blue-600" />
            <span className="ml-2 truncate text-base font-bold text-gray-900 sm:text-xl">{centerName}</span>
          </div>
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <header className="border-b border-gray-200 bg-white px-3 py-3 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="relative mx-auto max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search students by name, roll, phone, or batch..."
              aria-label="Search students"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </form>
        </header>

        <main className="relative z-0 flex-1 overflow-y-auto pb-20 focus:outline-none lg:pb-0">
          <div className="py-4 sm:py-6">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 z-40 flex w-full items-center justify-around border-t border-gray-200 bg-white pt-1 pb-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden">
        {[
          { name: "Home", href: "/dashboard", icon: LayoutDashboard },
          { name: "Students", href: "/dashboard/students", icon: Users },
          { name: "Fees", href: "/dashboard/fees", icon: CreditCard },
          { name: "Menu", href: "#", icon: Menu, isMenu: true },
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => (item.isMenu ? setSidebarOpen(true) : router.push(item.href))}
            className={clsx(
              pathname === item.href && !item.isMenu ? "text-blue-600" : "text-gray-500 hover:text-gray-900",
              "flex w-full flex-col items-center px-2 py-3 text-xs font-medium transition-colors",
            )}
          >
            <item.icon className={clsx("mb-1 h-6 w-6", pathname === item.href && !item.isMenu ? "text-blue-600" : "")} />
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

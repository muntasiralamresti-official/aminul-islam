'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
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
  Search
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Batches', href: '/dashboard/batches', icon: GraduationCap },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Exams & Results', href: '/dashboard/exams', icon: BookOpen },
  { name: 'Fees & Payments', href: '/dashboard/fees', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [centerName, setCenterName] = useState('Coaching Center');
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.centerName) {
          setCenterName(data.centerName);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/dashboard/students?search=${encodeURIComponent(query)}` : '/dashboard/students');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar */}
      <div className={clsx("fixed inset-0 z-40 lg:hidden", sidebarOpen ? "block" : "hidden")} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="relative flex-1 flex flex-col max-w-[280px] w-full pt-5 pb-4 bg-white shadow-xl h-full transition-transform duration-300">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-6">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="ml-3 text-xl font-bold text-gray-900 truncate">{centerName}</span>
          </div>
          
          <div className="mt-8 flex-1 h-0 overflow-y-auto">
            <nav className="px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    pathname === item.href
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                    'group flex items-center px-4 py-3 text-base font-semibold rounded-xl transition-all'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={clsx(
                      pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-blue-600',
                      'mr-4 flex-shrink-0 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-100 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <div className="truncate pr-2 pl-2">
                  <p className="text-sm font-bold text-gray-800 truncate">{session?.user?.name || 'User'}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize truncate">{session?.user?.role || 'Admin'}</p>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-gray-400 hover:text-red-600 p-2 bg-gray-50 rounded-full hover:bg-red-50 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 truncate">{centerName}</span>
              </div>
              <nav className="mt-8 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        pathname === item.href ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-6 w-6'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="text-sm font-medium text-gray-700 truncate">{session?.user?.name || 'User'}</p>
                    <p className="text-xs font-medium text-gray-500 capitalize truncate">{session?.user?.role || 'Role'}</p>
                  </div>
                  <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-gray-400 hover:text-red-500 p-2">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 flex flex-col flex-1 overflow-hidden">
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 h-16 px-3 sm:px-4">
          <div className="flex items-center overflow-hidden">
            <GraduationCap className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <span className="ml-2 text-base sm:text-xl font-bold text-gray-900 truncate">{centerName}</span>
          </div>
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <header className="bg-white border-b border-gray-200 px-3 py-3 sm:px-6 lg:px-8">
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
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none pb-20 lg:pb-0">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center z-40 pb-2 pt-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {[
          { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Students', href: '/dashboard/students', icon: Users },
          { name: 'Fees', href: '/dashboard/fees', icon: CreditCard },
          { name: 'Menu', href: '#', icon: Menu, isMenu: true }
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => {
              if (item.isMenu) {
                setSidebarOpen(true);
              } else {
                router.push(item.href);
              }
            }}
            className={clsx(
              pathname === item.href && !item.isMenu ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900',
              'flex flex-col items-center py-3 px-2 w-full text-xs font-medium transition-colors'
            )}
          >
            <item.icon className={clsx("h-6 w-6 mb-1", pathname === item.href && !item.isMenu ? 'text-blue-600' : '')} />
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

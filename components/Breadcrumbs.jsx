'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

const labels = {
  dashboard: 'Dashboard',
  students: 'Students',
  batches: 'Batches',
  fees: 'Fees & Payments',
  attendance: 'Attendance',
  reports: 'Reports',
  settings: 'Settings',
  new: 'New',
  edit: 'Edit',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length || pathname === '/dashboard') return null;
  let href = '';
  const items = parts.map((part, index) => {
    href += `/${part}`;
    const isLast = index === parts.length - 1;
    const label = labels[part] || (part.length > 20 ? 'Details' : part);
    return { href, label, isLast };
  });
  return <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 overflow-x-auto text-sm"><Link href="/dashboard" className="inline-flex shrink-0 items-center gap-1 text-gray-400 transition-colors hover:text-blue-600"><Home className="h-4 w-4" /><span className="sr-only">Dashboard</span></Link>{items.map((item) => <span key={item.href} className="inline-flex shrink-0 items-center gap-1.5"><ChevronRight className="h-4 w-4 text-gray-300" aria-hidden="true" />{item.isLast ? <span className="font-medium text-gray-600">{item.label}</span> : <Link href={item.href} className="text-gray-400 transition-colors hover:text-blue-600">{item.label}</Link>}</span>)}</nav>;
}

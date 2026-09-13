"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, RefreshCw, WifiOff, Loader2, GraduationCap, Phone, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import ConfirmDialog from "@/components/ConfirmDialog";

const STUDENTS_CACHE_TTL = 30000;
const getCacheKey = (page, search) => `aminul-islam-students-${page}-${search}`;

function StudentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [pulling, setPulling] = useState(false);
  const hasDataRef = useRef(false);
  const prefetchRef = useRef(new Set());
  const touchStartRef = useRef({ x: 0, y: 0 });
  const pageSize = 10;

  useEffect(() => {
    const nextSearch = searchParams.get("search") || "";
    const nextPage = Math.max(1, Number(searchParams.get("page") || 1) || 1);
    setSearchInput(nextSearch);
    setSearchQuery(nextSearch);
    setCurrentPage(nextPage);
  }, [searchParams]);

  useEffect(() => {
    const value = searchInput.trim();
    if (value === searchQuery) return;
    const timer = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1);
      const params = new URLSearchParams();
      if (value) params.set("search", value);
      const query = params.toString();
      router.replace(query ? `/dashboard/students?${query}` : "/dashboard/students");
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, router]);

  const saveCache = useCallback((key, data) => {
    try { sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch {}
  }, []);

  const prefetchNextPage = useCallback(async (page, search, totalPagesValue) => {
    const nextPage = page + 1;
    if (nextPage > totalPagesValue) return;
    const key = getCacheKey(nextPage, search);
    if (prefetchRef.current.has(key)) return;
    prefetchRef.current.add(key);
    try {
      const res = await fetch(`/api/students?page=${nextPage}&limit=${pageSize}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      saveCache(key, { students: data.students || [], total: data.total || 0, totalPages: data.totalPages || 1 });
    } catch {} finally { prefetchRef.current.delete(key); }
  }, [saveCache]);

  const fetchStudents = useCallback(async ({ force = false } = {}) => {
    const cacheKey = getCacheKey(currentPage, searchQuery);
    let loadedFromCache = false;
    if (!force) {
      try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
        if (cached?.data && Date.now() - cached.savedAt < STUDENTS_CACHE_TTL) {
          setStudents(cached.data.students || []); setTotal(cached.data.total || 0); setTotalPages(cached.data.totalPages || 1);
          setLoading(false); setRefreshing(true); hasDataRef.current = true; loadedFromCache = true;
        }
      } catch {}
    }
    if (!hasDataRef.current) setLoading(true); else if (!loadedFromCache) setRefreshing(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(pageSize) });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/students?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students");
      const result = { students: data.students || [], total: data.total || 0, totalPages: data.totalPages || 1 };
      setStudents(result.students); setTotal(result.total); setTotalPages(result.totalPages); hasDataRef.current = true;
      saveCache(cacheKey, result); prefetchNextPage(currentPage, searchQuery, result.totalPages);
    } catch (fetchError) {
      const message = fetchError.message || "Failed to load students";
      if (!hasDataRef.current) { setError(message); toast.error(message); }
    } finally { setLoading(false); setRefreshing(false); }
  }, [currentPage, searchQuery, prefetchNextPage, saveCache]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const refreshStudents = useCallback(async () => {
    if (refreshing) return;
    try { sessionStorage.removeItem(getCacheKey(currentPage, searchQuery)); } catch {}
    hasDataRef.current = false;
    await fetchStudents({ force: true });
  }, [currentPage, searchQuery, refreshing, fetchStudents]);

  const handleTouchStart = useCallback((event) => {
    if (window.scrollY > 2 || refreshing || event.touches.length !== 1) return;
    const touch = event.touches[0]; touchStartRef.current = { x: touch.clientX, y: touch.clientY }; setPulling(true);
  }, [refreshing]);
  const handleTouchMove = useCallback((event) => {
    if (!pulling || refreshing || window.scrollY > 2 || event.touches.length !== 1) return;
    const touch = event.touches[0]; const deltaY = touch.clientY - touchStartRef.current.y; const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    if (deltaY <= 0 || deltaY < deltaX) { setPullDistance(0); return; }
    if (deltaY > 8) event.preventDefault(); setPullDistance(Math.min(88, deltaY * 0.45));
  }, [pulling, refreshing]);
  const handleTouchEnd = useCallback(() => {
    if (!pulling) return; const shouldRefresh = pullDistance >= 54 && !refreshing; setPulling(false); setPullDistance(0); if (shouldRefresh) refreshStudents();
  }, [pulling, pullDistance, refreshing, refreshStudents]);

  const updateUrl = (page) => {
    const params = new URLSearchParams(); if (searchQuery) params.set("search", searchQuery); if (page > 1) params.set("page", String(page));
    const query = params.toString(); router.replace(query ? `/dashboard/students?${query}` : "/dashboard/students");
  };
  const handlePageChange = (page) => { const nextPage = Math.max(1, Math.min(totalPages, page)); setCurrentPage(nextPage); updateUrl(nextPage); };

  const handleDelete = async () => {
    if (!deleteId) return; const id = deleteId; setDeleteId(null);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error("Failed to delete student");
      toast.success("Student deleted"); hasDataRef.current = false;
      try { Object.keys(sessionStorage).filter((key) => key.startsWith("aminul-islam-students-")).forEach((key) => sessionStorage.removeItem(key)); } catch {}
      if (students.length === 1 && currentPage > 1) handlePageChange(currentPage - 1); else fetchStudents({ force: true });
    } catch (deleteError) { toast.error(deleteError.message || "Error deleting student"); }
  };

  if (loading) return <div><div className="mb-8 flex items-center justify-between"><div className="space-y-2"><div className="h-6 w-28 animate-pulse rounded bg-gray-200" /><div className="h-4 w-72 animate-pulse rounded bg-gray-100" /></div><div className="hidden h-10 w-32 animate-pulse rounded-md bg-gray-200 sm:block" /></div><TableSkeleton columns={6} rows={7} /></div>;
  if (error && students.length === 0) return <div className="flex min-h-[420px] items-center justify-center"><div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><WifiOff className="h-7 w-7" /></div><h2 className="mt-4 text-lg font-semibold text-gray-900">Couldn&apos;t load students</h2><p className="mt-2 text-sm text-gray-500">Check your internet connection or try again.</p><button onClick={() => fetchStudents({ force: true })} className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw className="mr-2 h-4 w-4" /> Retry</button></div></div>;

  const firstResult = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, total);

  return (
    <div className="w-full pb-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={{ touchAction: pulling ? "none" : "pan-y" }}>
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[120] flex justify-center sm:hidden" style={{ paddingTop: `calc(${Math.max(0, pullDistance - 30)}px + env(safe-area-inset-top))`, opacity: Math.min(1, pullDistance / 45) }} aria-hidden="true"><div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg"><RefreshCw className={`h-4 w-4 text-blue-600 transition-transform ${pullDistance >= 54 ? "rotate-180" : ""} ${refreshing ? "animate-spin" : ""}`} />
      </div></div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><h1 className="text-xl font-semibold text-gray-900">Students</h1><p className="mt-2 text-sm text-gray-700">A list of all the students in your coaching center.</p></div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Link href="/dashboard/students/new" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Add Student</Link><button onClick={() => refreshStudents()} className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50" disabled={refreshing}><RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh</button></div>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><input type="search" inputMode="search" placeholder="Search students..." value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="min-h-11 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" /><div className="flex items-center justify-between gap-3 text-xs text-gray-500"><span>{firstResult}–{lastResult} of {total}</span><select value={pageSize} disabled className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs"><option>{pageSize}</option></select></div></div></div>

      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:block"><table className="w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Student</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Roll</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Batch</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Phone</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{students.map((student) => <tr key={student._id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm font-semibold text-gray-900">{student.name}</td><td className="px-4 py-3 text-sm text-gray-600">{student.rollNumber || "—"}</td><td className="px-4 py-3 text-sm text-gray-600">{student.batch?.name || "—"}</td><td className="px-4 py-3 text-sm text-gray-600">{student.phone || "—"}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><Link href={`/dashboard/students/${student._id}`} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></Link><Link href={`/dashboard/students/${student._id}/edit`} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"><Edit className="h-4 w-4" /></Link><button onClick={() => setDeleteId(student._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>

      <div className="mt-4 space-y-3 sm:hidden">{students.map((student) => <div key={student._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex items-center gap-3 p-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><GraduationCap className="h-6 w-6" /></div><div className="min-w-0 flex-1"><p className="truncate font-bold text-gray-900">{student.name}</p><p className="mt-0.5 text-xs text-gray-500">Roll {student.rollNumber || "—"} • {student.batch?.name || "No batch"}</p></div><ChevronRight className="h-5 w-5 text-gray-300" /></div><div className="grid grid-cols-2 border-t border-gray-100 bg-gray-50/60"><div className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-gray-600"><Phone className="h-4 w-4 text-gray-400" />{student.phone || "No phone"}</div><Link href={`/dashboard/students/${student._id}`} className="flex items-center justify-center border-l border-gray-100 px-4 py-3 text-xs font-bold text-blue-600">View profile</Link></div><div className="flex gap-2 border-t border-gray-100 p-3"><Link href={`/dashboard/students/${student._id}/edit`} className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700">Edit</Link><button onClick={() => setDeleteId(student._id)} className="flex flex-1 items-center justify-center rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600">Delete</button></div></div>)}</div>

      {totalPages > 1 && <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 shadow-sm"><button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-40">Previous</button><span className="text-xs font-semibold text-gray-500">Page {currentPage} of {totalPages}</span><button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-40">Next</button></div>}

      <ConfirmDialog open={Boolean(deleteId)} title="Delete student?" message="This will permanently delete the student and related records." confirmLabel="Delete Student" cancelLabel="Cancel" onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}

export default function StudentsPage() {
  return <Suspense fallback={<div><TableSkeleton columns={6} rows={7} /></div>}><StudentsContent /></Suspense>;
}

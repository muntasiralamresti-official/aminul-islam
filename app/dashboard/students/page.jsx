"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, RefreshCw, WifiOff, Loader2 } from "lucide-react";
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
  const pageSize = 10;

  useEffect(() => {
    const nextSearch = searchParams.get("search") || "";
    const nextPage = Math.max(1, Number(searchParams.get("page") || 1) || 1);
    setSearchInput(nextSearch);
    setSearchQuery(nextSearch);
    setCurrentPage(nextPage);
  }, [searchParams]);

  // Do not hit the API on every keystroke. Searching waits until the user pauses.
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchInput.trim();
      setSearchQuery(value);
      setCurrentPage(1);
      const params = new URLSearchParams();
      if (value) params.set("search", value);
      const query = params.toString();
      router.replace(query ? `/dashboard/students?${query}` : "/dashboard/students");
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, router]);

  const fetchStudents = useCallback(async ({ force = false } = {}) => {
    const cacheKey = getCacheKey(currentPage, searchQuery);
    if (!force) {
      try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
        if (cached?.data && Date.now() - cached.savedAt < STUDENTS_CACHE_TTL) {
          setStudents(cached.data.students || []);
          setTotal(cached.data.total || 0);
          setTotalPages(cached.data.totalPages || 1);
          setLoading(false);
          setRefreshing(true);
        }
      } catch {}
    }

    if (students.length === 0) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(pageSize) });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students");
      setStudents(data.students || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      try { sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data })); } catch {}
    } catch (fetchError) {
      const message = fetchError.message || "Failed to load students";
      if (students.length === 0) {
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, searchQuery, students.length]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const updateUrl = (page) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.replace(query ? `/dashboard/students?${query}` : "/dashboard/students");
  };

  const handlePageChange = (page) => {
    const nextPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(nextPage);
    updateUrl(nextPage);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      toast.success("Student deleted");
      try {
        Object.keys(sessionStorage).filter((key) => key.startsWith("aminul-islam-students-")).forEach((key) => sessionStorage.removeItem(key));
      } catch {}
      if (students.length === 1 && currentPage > 1) handlePageChange(currentPage - 1); else fetchStudents({ force: true });
    } catch (deleteError) { toast.error(deleteError.message || "Error deleting student"); }
  };

  if (loading) return <div><div className="mb-8 flex items-center justify-between"><div className="space-y-2"><div className="h-6 w-28 animate-pulse rounded bg-gray-200" /><div className="h-4 w-72 animate-pulse rounded bg-gray-100" /></div><div className="hidden h-10 w-32 animate-pulse rounded-md bg-gray-200 sm:block" /></div><TableSkeleton columns={6} rows={7} /></div>;

  if (error && students.length === 0) return <div className="flex min-h-[420px] items-center justify-center"><div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><WifiOff className="h-7 w-7" /></div><h2 className="mt-4 text-lg font-semibold text-gray-900">Couldn&apos;t load students</h2><p className="mt-2 text-sm text-gray-500">Check your internet connection or try again.</p><button onClick={() => fetchStudents({ force: true })} className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw className="mr-2 h-4 w-4" /> Retry</button></div></div>;

  const firstResult = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, total);

  return (
    <div className="w-full">
      <div className="sm:flex sm:items-center justify-between"><div className="sm:flex-auto"><h1 className="text-xl font-semibold text-gray-900">Students</h1><p className="mt-2 text-sm text-gray-700">A list of all the students in your coaching center.</p></div><div className="mt-4 sm:mt-0 sm:flex-none flex flex-col sm:flex-row gap-3"><div className="relative"><input type="text" placeholder="Search by name, roll, phone or batch..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="block w-full sm:w-72 rounded-xl border border-gray-300 p-2.5 text-sm text-black shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><Link href="/dashboard/students/new" className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Add Student</Link></div></div>

      <div className="mt-8 w-full flex flex-col"><div className="w-full overflow-x-auto rounded-xl shadow-sm ring-1 ring-black/5"><table className="w-full min-w-[900px] table-fixed divide-y divide-gray-200"><colgroup><col className="w-[11%]" /><col className="w-[24%]" /><col className="w-[20%]" /><col className="w-[25%]" /><col className="w-[10%]" /><col className="w-[10%]" /></colgroup><thead className="bg-gray-50"><tr><th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Roll No</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Batch</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th><th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{students.map((student) => <tr key={student._id} className="transition-colors hover:bg-gray-50/80"><td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{student.rollNumber}</td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><div className="flex items-center"><div className="h-8 w-8 flex-shrink-0">{student.photo ? <img className="h-8 w-8 rounded-full object-cover border" src={student.photo} alt="" /> : <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{student.name.charAt(0)}</div>}</div><div className="ml-3 truncate font-medium text-gray-900">{student.name}</div></div></td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.phone}</td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><div className="truncate">{student.batch?.name || "N/A"}</div></td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${student.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{student.status}</span></td><td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"><Link href={`/dashboard/students/${student._id}`} className="text-gray-600 hover:text-gray-900 mr-4" aria-label={`View ${student.name}`}><Eye className="inline h-4 w-4" /></Link><Link href={`/dashboard/students/${student._id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4" aria-label={`Edit ${student.name}`}><Edit className="inline h-4 w-4" /></Link><button onClick={() => setDeleteId(student._id)} className="text-red-600 hover:text-red-900" aria-label={`Delete ${student.name}`}><Trash2 className="inline h-4 w-4" /></button></td></tr>)}{students.length === 0 && <tr><td colSpan="6" className="py-14 text-center"><div className="mx-auto max-w-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Plus className="h-6 w-6" /></div><p className="mt-3 text-sm font-medium text-gray-900">{searchQuery ? "No students match your search" : "No students found"}</p><p className="mt-1 text-sm text-gray-500">{searchQuery ? "Try a different name, roll, phone, or batch." : "Create your first student to get started."}</p></div></td></tr>}</tbody></table>{total > 0 && <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-gray-600">Showing {firstResult} to {lastResult} of {total} students</p><div className="flex items-center gap-2"><button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Previous</button><span className="min-w-20 text-center text-sm text-gray-600">Page {currentPage} of {totalPages}</span><button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Next</button></div></div>}</div></div>
      {refreshing && <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</div>}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete student?" message="This will permanently remove the student from the system." confirmLabel="Delete student" onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}

export default function StudentsPage() { return <Suspense fallback={<TableSkeleton columns={6} rows={7} />}><StudentsContent /></Suspense>; }

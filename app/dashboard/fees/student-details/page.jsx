"use client";

import { useEffect, useState } from "react";
import { Search, UserRound } from "lucide-react";
import StudentFeeDetails from "@/components/StudentFeeDetails";
import { TableSkeleton } from "@/components/LoadingSkeleton";

export default function StudentFeeDetailsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students?all=true")
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((student) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return student.name?.toLowerCase().includes(q) || student.rollNumber?.toLowerCase().includes(q);
  }).slice(0, 30);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Fee Details</h1>
        <p className="mt-1 text-sm text-gray-600">Open a student to see Jan–Dec fees, previous due, outstanding balance and payment history.</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student name or roll..." className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500" aria-label="Search students for fee details" />
      </div>

      {loading ? <TableSkeleton rows={8} columns={3} /> : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {filtered.map((student) => (
              <button key={student._id} onClick={() => setSelectedId(student._id)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-gray-50 sm:px-5">
                <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><div className="truncate text-sm font-semibold text-gray-900">{student.name}</div><div className="text-xs text-gray-500">Roll: {student.rollNumber}{student.batch?.name ? ` · ${student.batch.name}` : ""}</div></div></div>
                <span className="shrink-0 text-xs font-semibold text-blue-600">View Details →</span>
              </button>
            ))}
            {filtered.length === 0 && <div className="px-5 py-10 text-center text-sm text-gray-500">No students found.</div>}
          </div>
        </div>
      )}

      {selectedId && <StudentFeeDetails studentId={selectedId} onClose={() => setSelectedId("")} />}
    </div>
  );
}

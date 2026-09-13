"use client";

import { useEffect, useState } from "react";
import { Grid2X2, List } from "lucide-react";

const getStorageKey = (page) => `aminul-islam-view-mode-${page}`;

export default function ViewModeLayout({ page, children }) {
  const [mode, setMode] = useState("grid");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(page));
      if (saved === "grid" || saved === "list") setMode(saved);
    } catch {}
  }, [page]);

  useEffect(() => {
    try { localStorage.setItem(getStorageKey(page), mode); } catch {}
  }, [page, mode]);

  return (
    <div className={`view-mode-page view-mode-${page} view-mode-${mode}`}>
      <div className="mb-3 flex justify-end sm:mb-4">
        <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm" role="group" aria-label="View mode">
          <button
            type="button"
            onClick={() => setMode("grid")}
            aria-pressed={mode === "grid"}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${mode === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
          >
            <Grid2X2 className="h-4 w-4" /> Grid
          </button>
          <button
            type="button"
            onClick={() => setMode("list")}
            aria-pressed={mode === "list"}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${mode === "list" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
          >
            <List className="h-4 w-4" /> List
          </button>
        </div>
      </div>

      {children}

      <style jsx global>{`
        .view-mode-page .view-mode-page { margin-top: 0; }

        /* Students: reuse the existing rich mobile cards as the Grid view. */
        .view-mode-students.view-mode-grid .overflow-hidden.rounded-2xl.border.border-gray-200.bg-white.shadow-sm:has(table) {
          display: none !important;
        }
        .view-mode-students.view-mode-grid .mt-4.space-y-3.sm\\:hidden {
          display: block !important;
        }
        .view-mode-students.view-mode-list .mt-4.space-y-3.sm\\:hidden {
          display: none !important;
        }
        .view-mode-students.view-mode-list .overflow-hidden.rounded-2xl.border.border-gray-200.bg-white.shadow-sm:has(table) {
          display: block !important;
        }
        .view-mode-students.view-mode-grid .mt-4.space-y-3.sm\\:hidden > div {
          width: 100%;
        }

        /* Fees: use the existing mobile cards for Grid and tables for List. */
        .view-mode-fees.view-mode-grid .hidden.overflow-x-auto.sm\\:block:has(table) {
          display: none !important;
        }
        .view-mode-fees.view-mode-grid .divide-y.divide-gray-100.sm\\:hidden {
          display: block !important;
        }
        .view-mode-fees.view-mode-list .divide-y.divide-gray-100.sm\\:hidden {
          display: none !important;
        }
        .view-mode-fees.view-mode-list .hidden.overflow-x-auto.sm\\:block:has(table) {
          display: block !important;
        }

        /* Attendance: Grid becomes compact student cards; List keeps the table. */
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) {
          overflow: visible !important;
        }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) table {
          min-width: 0 !important;
          width: 100% !important;
          border-collapse: separate;
          border-spacing: 0 .65rem;
        }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) thead {
          display: none !important;
        }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody {
          display: grid !important;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: .75rem;
        }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody tr {
          display: grid !important;
          grid-template-columns: 1fr;
          gap: 0;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          background: white;
          box-shadow: 0 4px 14px rgba(15, 23, 42, .05);
        }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody td {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          min-width: 0;
          padding: .7rem .9rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody td:last-child { border-bottom: 0; }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody td:nth-child(1) { display: none !important; }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody td:nth-child(2)::before { content: "Roll"; color: #94a3b8; font-size: .65rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody td:nth-child(3)::before { content: "Student"; color: #94a3b8; font-size: .65rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody td:nth-child(4)::before { content: "Attendance"; color: #94a3b8; font-size: .65rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody td:nth-child(3) { font-weight: 800; color: #0f172a; }
        .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody td:nth-child(4) > div { margin-left: auto; }
        .view-mode-attendance.view-mode-list .overflow-x-auto:has(table) table { min-width: 720px; }

        @media (min-width: 640px) {
          .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .view-mode-attendance.view-mode-grid .overflow-x-auto:has(table) tbody {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

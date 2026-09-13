"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";

function MobileRecordPaymentButton() {
  useEffect(() => {
    const clickExistingButton = () => {
      const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.replace(/\s+/g, " ").trim().includes("Record Payment"));
      if (button) button.click();
    };
    const handleKey = (event) => {
      if (event.key === "r" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        clickExistingButton();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.replace(/\s+/g, " ").trim().includes("Record Payment"));
        if (button) button.click();
      }}
      className="fees-record-payment-mobile fixed z-[70] hidden items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(37,99,235,.32)] active:scale-[.98]"
      aria-label="Record payment"
    >
      <Plus className="h-5 w-5" />
      Record Payment
    </button>
  );
}

export default function FeesLayout({ children }) {
  return (
    <>
      {children}
      <MobileRecordPaymentButton />
      <style jsx global>{`
        @media (max-width: 639px) {
          .fees-record-payment-mobile {
            display: inline-flex !important;
            right: 1rem;
            bottom: calc(4.9rem + env(safe-area-inset-bottom));
          }

          /* Modern student fee cards */
          main .overflow-x-auto:has(table thead th:nth-child(10)) {
            overflow: visible !important;
            padding: .25rem !important;
            background: #f8fafc;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) table {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) thead {
            display: none !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody {
            display: grid !important;
            gap: .85rem !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody tr {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            overflow: hidden;
            border: 1px solid #e2e8f0 !important;
            border-radius: 1.35rem !important;
            background: #fff !important;
            box-shadow: 0 10px 30px rgba(15,23,42,.07) !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            gap: .75rem;
            min-width: 0;
            padding: .72rem .9rem !important;
            border-bottom: 1px solid #eef2f7 !important;
            white-space: normal !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td::before {
            color: #94a3b8;
            font-size: .59rem;
            font-weight: 800;
            letter-spacing: .07em;
            text-transform: uppercase;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(1) { display: none !important; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(2) {
            grid-column: 1 / -1;
            justify-content: flex-start;
            min-height: 4.7rem;
            padding: 1rem !important;
            background: linear-gradient(135deg,#f8fbff,#fff) !important;
            border-bottom: 1px solid #eef2f7 !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(2)::before { display: none; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(2) > div > div:first-child { font-size: 1rem; font-weight: 800; color: #0f172a; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(2) > div > div:last-child { margin-top: .2rem; font-size: .7rem; color: #64748b; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(3) { grid-column: 1 / -1; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(3)::before { content: "Batch"; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(4)::before { content: "Monthly"; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(5)::before { content: "Paid"; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(6)::before { content: "Previous Due"; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(7)::before { content: "Current Due"; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(8) { grid-column: 1 / -1; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(8)::before { content: "Last Payment"; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(9)::before { content: "Last Amount"; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(10) { grid-column: 1 / -1; justify-content: flex-start; gap: .75rem; border-bottom: 0 !important; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(10)::before { content: "Status"; }

          /* Modern payment-history cards */
          main .overflow-x-auto:has(table thead th:nth-child(7)) {
            overflow: visible !important;
            padding: .25rem !important;
            background: #f8fafc;
          }
          main .overflow-x-auto:has(table thead th:nth-child(7)) table {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(7)) thead { display: none !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody { display: grid !important; gap: .75rem !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody tr {
            display: grid !important;
            grid-template-columns: 1fr auto;
            overflow: hidden;
            border: 1px solid #e2e8f0 !important;
            border-radius: 1.25rem !important;
            background: #fff !important;
            box-shadow: 0 8px 24px rgba(15,23,42,.06) !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td {
            display: flex !important;
            align-items: center;
            padding: .75rem .9rem !important;
            border-bottom: 1px solid #f1f5f9 !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td::before { color:#94a3b8; font-size:.58rem; font-weight:800; text-transform:uppercase; margin-right:.65rem; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(1) { grid-column: 1 / -1; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(1)::before { content:"Date"; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(2) { grid-column: 1 / -1; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(2)::before { content:"Student"; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(3)::before { content:"Month"; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(4)::before { content:"Amount"; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(5)::before { content:"Method"; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(6) { justify-content:flex-start; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(6)::before { content:"Status"; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(7) { grid-column: 1 / -1; justify-content:flex-end; border-bottom:0 !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td:nth-child(7)::before { display:none; }
        }
      `}</style>
    </>
  );
}

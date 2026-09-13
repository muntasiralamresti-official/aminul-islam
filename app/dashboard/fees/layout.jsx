"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";

function triggerRecordPayment() {
  const button = Array.from(document.querySelectorAll("button")).find((item) => {
    const text = item.textContent?.replace(/\s+/g, " ").trim() || "";
    return text.includes("Record Payment") && !item.classList.contains("fees-record-payment-mobile");
  });
  if (button) button.click();
}

function MobileRecordPaymentButton() {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key.toLowerCase() === "r" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        triggerRecordPayment();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <button
      type="button"
      onClick={triggerRecordPayment}
      className="fees-record-payment-mobile fixed z-[999] flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(37,99,235,.35)] transition active:scale-[.98] sm:hidden"
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
            left: 1rem;
            right: 1rem;
            bottom: calc(4.85rem + env(safe-area-inset-bottom));
            width: calc(100% - 2rem);
            min-height: 52px;
          }

          /* Student-wise fee table -> compact app cards */
          main .overflow-x-auto:has(table thead th:nth-child(10)) {
            overflow: visible !important;
            padding: .25rem !important;
            background: transparent !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) table { display: block !important; width: 100% !important; min-width: 0 !important; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) thead { display: none !important; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody { display: grid !important; gap: .75rem !important; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody tr {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            overflow: hidden;
            border: 1px solid #e2e8f0 !important;
            border-radius: 22px !important;
            background: #fff !important;
            box-shadow: 0 10px 28px rgba(15,23,42,.07) !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            gap: .6rem;
            min-width: 0;
            padding: .8rem .9rem !important;
            border-bottom: 1px solid #eef2f7 !important;
            white-space: normal !important;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td::before {
            color: #94a3b8;
            font-size: .58rem;
            font-weight: 800;
            letter-spacing: .06em;
            text-transform: uppercase;
          }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(1) { display: none !important; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(2) {
            grid-column: 1 / -1;
            justify-content: flex-start;
            min-height: 70px;
            padding: 1rem !important;
            background: linear-gradient(135deg,#eff6ff,#ffffff) !important;
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
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(10) { grid-column: 1 / -1; justify-content: flex-start; border-bottom: 0 !important; }
          main .overflow-x-auto:has(table thead th:nth-child(10)) tbody td:nth-child(10)::before { content: "Status"; }

          /* Payment history -> clean stacked cards */
          main .overflow-x-auto:has(table thead th:nth-child(7)) { overflow: visible !important; padding: .25rem !important; background: transparent !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) table { display: block !important; width: 100% !important; min-width: 0 !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) thead { display: none !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody { display: grid !important; gap: .7rem !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody tr { display: grid !important; grid-template-columns: 1fr auto; overflow: hidden; border: 1px solid #e2e8f0 !important; border-radius: 20px !important; background: #fff !important; box-shadow: 0 8px 24px rgba(15,23,42,.06) !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td { display: flex !important; align-items: center; padding: .75rem .9rem !important; border-bottom: 1px solid #f1f5f9 !important; }
          main .overflow-x-auto:has(table thead th:nth-child(7)) tbody td::before { color:#94a3b8; font-size:.58rem; font-weight:800; text-transform:uppercase; margin-right:.6rem; }
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

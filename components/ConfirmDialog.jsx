'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const haptic = (duration = 8) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(duration);
};

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel,
  cancelLabel,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  danger = true,
}) {
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const resolvedConfirmLabel = confirmLabel ?? confirmText ?? 'Confirm';
  const resolvedCancelLabel = cancelLabel ?? cancelText ?? 'Cancel';

  useEffect(() => {
    if (!open) return;
    setDragY(0);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  const handleTouchStart = (event) => {
    startY.current = event.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (event) => {
    const distance = Math.max(0, event.touches[0].clientY - startY.current);
    setDragY(Math.min(distance, 220));
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (dragY > 90) {
      haptic();
      onCancel?.();
    }
    setDragY(0);
  };

  if (!open) return null;

  return (
    <div className="ui-bottom-sheet-shell fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <button type="button" className="ui-bottom-sheet-backdrop absolute inset-0 bg-gray-950/45 backdrop-blur-[2px]" aria-label="Close" onClick={onCancel} />
      <div
        className="ui-bottom-sheet relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragging ? 'none' : undefined }}
      >
        <div
          className="flex touch-none justify-center py-2 sm:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-hidden="true"
        >
          <span className="h-1.5 w-11 rounded-full bg-gray-300" />
        </div>
        <button type="button" onClick={onCancel} className="absolute right-3 top-3 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close dialog">
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pb-6 pt-3 sm:p-7">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 id="confirm-dialog-title" className="mt-5 text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">{message}</p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/80 p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => { haptic(); onCancel?.(); }} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">{resolvedCancelLabel}</button>
          <button type="button" onClick={() => { haptic(12); onConfirm?.(); }} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{resolvedConfirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

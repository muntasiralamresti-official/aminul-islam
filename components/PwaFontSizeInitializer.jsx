"use client";

import { useEffect } from "react";

export const DEFAULT_FONT_SIZE = 16;
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 24;

export default function PwaFontSizeInitializer() {
  useEffect(() => {
    let stored = Number.parseInt(localStorage.getItem("app-font-size") || "", 10);
    
    // Legacy migration
    if (!Number.isFinite(stored)) {
      const legacy = Number.parseInt(localStorage.getItem("pwa-font-size-adjust") || "", 10);
      if (Number.isFinite(legacy)) {
        stored = 16 + legacy;
        localStorage.removeItem("pwa-font-size-adjust");
      }
    }

    const value = Number.isFinite(stored)
      ? Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, stored))
      : DEFAULT_FONT_SIZE;

    document.documentElement.style.fontSize = ${value}px;
    localStorage.setItem("app-font-size", String(value));
  }, []);

  return null;
}

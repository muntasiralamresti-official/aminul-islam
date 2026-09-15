"use client";

import { useEffect } from "react";

const DEFAULT_APP_FONT_ADJUST = 2;
const MIN_APP_FONT_ADJUST = -1;
const MAX_APP_FONT_ADJUST = 4;

export default function PwaFontSizeInitializer() {
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (!standalone) return;

    const stored = Number.parseInt(
      localStorage.getItem("pwa-font-size-adjust") || "",
      10
    );
    const value = Number.isFinite(stored)
      ? Math.min(MAX_APP_FONT_ADJUST, Math.max(MIN_APP_FONT_ADJUST, stored))
      : DEFAULT_APP_FONT_ADJUST;

    document.documentElement.dataset.pwaApp = "true";
    document.documentElement.style.setProperty(
      "--pwa-font-adjust",
      `${value}px`
    );
  }, []);

  return null;
}

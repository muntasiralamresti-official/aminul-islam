"use client";

import { useEffect } from "react";

function StudentPhotoEnhancer() {
  useEffect(() => {
    let cancelled = false;
    let observer;
    let timer;

    const enhance = async () => {
      if (cancelled || window.location.pathname !== "/dashboard/students") return;
      const params = new URLSearchParams(window.location.search);
      const page = params.get("page") || "1";
      const search = params.get("search") || "";
      try {
        const response = await fetch(`/api/students?page=${encodeURIComponent(page)}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ""}`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const students = payload.students || [];
        if (cancelled) return;

        const mobileList = Array.from(document.querySelectorAll('main [class~="sm:hidden"]')).find((node) => node.querySelector?.('div[class*="rounded-2xl"]'));
        const cards = mobileList ? Array.from(mobileList.children) : [];

        cards.forEach((card) => {
          const nameNode = card.querySelector("p.font-bold, p.truncate.font-bold, p.truncate.font-semibold, h2");
          const name = nameNode?.textContent?.trim();
          const student = students.find((item) => item.name === name);
          if (!student) return;
          const avatar = card.querySelector('div.rounded-full.h-12.w-12, div.h-12.w-12.rounded-full');
          if (!avatar) return;
          const source = student.photoUrl
            ? `${student.photoUrl}${student.photoUrl.includes("?") ? "&" : "?"}tr=w-160,h-160,f-webp,q-82`
            : student.photo;
          if (!source) return;
          if (avatar.dataset.studentPhoto === source) return;
          avatar.dataset.studentPhoto = source;
          avatar.innerHTML = "";
          avatar.className = "relative flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-full border-2 border-white bg-slate-100 shadow-md ring-2 ring-slate-200";
          const image = document.createElement("img");
          image.src = source;
          image.alt = "";
          image.loading = "lazy";
          image.decoding = "async";
          image.className = "h-full w-full object-cover";
          image.onerror = () => { image.remove(); avatar.textContent = student.name?.charAt(0) || "S"; avatar.className += " text-lg font-bold text-blue-700"; };
          avatar.appendChild(image);
        });
      } catch {}
    };

    enhance();
    timer = window.setInterval(enhance, 800);
    observer = new MutationObserver(() => enhance());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      observer?.disconnect();
    };
  }, []);

  return null;
}

export default function StudentsLayout({ children }) {
  return <><StudentPhotoEnhancer />{children}</>;
}

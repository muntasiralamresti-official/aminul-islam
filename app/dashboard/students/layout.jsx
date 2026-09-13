"use client";

import { useEffect } from "react";
import ViewModeLayout from "@/components/ViewModeLayout";

function StudentPhotoEnhancer() {
  useEffect(() => {
    let cancelled = false;
    let timer;
    let busy = false;

    const enhance = async () => {
      if (cancelled || busy || window.location.pathname !== "/dashboard/students") return;
      const params = new URLSearchParams(window.location.search);
      const page = params.get("page") || "1";
      const search = params.get("search") || "";
      try {
        busy = true;
        const response = await fetch(`/api/students?page=${encodeURIComponent(page)}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ""}`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const students = payload.students || [];
        if (cancelled) return;

        const mobileLists = Array.from(document.querySelectorAll('main [class~="sm:hidden"]'));
        const mobileList = mobileLists.find((node) => Array.from(node.children || []).some((child) => child.querySelector?.('div.h-12.w-12.rounded-full, div.rounded-full.h-12.w-12')));
        const cards = mobileList ? Array.from(mobileList.children) : [];

        cards.forEach((card) => {
          const nameNode = card.querySelector("p.font-bold, p.truncate.font-bold, p.truncate.font-semibold, h2");
          const name = nameNode?.textContent?.trim();
          const student = students.find((item) => item.name === name);
          if (!student) return;
          const avatar = card.querySelector('div.h-12.w-12.rounded-full, div.rounded-full.h-12.w-12');
          if (!avatar) return;
          const source = student.photoUrl
            ? `${student.photoUrl}${student.photoUrl.includes("?") ? "&" : "?"}tr=w-160,h-160,f-webp,q-82`
            : student.photo;
          if (!source || avatar.dataset.studentPhoto === source) return;
          avatar.dataset.studentPhoto = source;
          avatar.innerHTML = "";
          avatar.className = "relative flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-full border-2 border-white bg-slate-100 shadow-md ring-2 ring-slate-200";
          const image = document.createElement("img");
          image.src = source;
          image.alt = "";
          image.loading = "lazy";
          image.decoding = "async";
          image.className = "h-full w-full object-cover";
          image.onerror = () => {
            image.remove();
            avatar.textContent = student.name?.charAt(0) || "S";
            avatar.className += " text-lg font-bold text-blue-700";
          };
          avatar.appendChild(image);
        });
      } catch {} finally {
        busy = false;
      }
    };

    enhance();
    timer = window.setInterval(enhance, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}

export default function StudentsLayout({ children }) {
  return <ViewModeLayout page="students"><StudentPhotoEnhancer />{children}</ViewModeLayout>;
}

"use client";

import { useLoadingStore } from "@/store/loadingStore";

export function GlobalLoadingBar() {
  const activeRequests = useLoadingStore((state) => state.activeRequests);

  if (activeRequests === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-teal-100/40 overflow-hidden pointer-events-none"
      role="progressbar"
      aria-label="Carregando..."
    >
      <style>{`
        @keyframes global-loading-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(60%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
      <div
        className="h-full w-1/2 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)] rounded-full"
        style={{
          animation: "global-loading-slide 1.2s infinite ease-in-out",
        }}
      />
    </div>
  );
}

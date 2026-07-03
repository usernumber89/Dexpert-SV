"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineDetector() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);

    setOffline(!navigator.onLine);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[999] -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-white px-5 py-3 shadow-xl shadow-red-100/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <WifiOff className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-800">Sin conexión</p>
          <p className="text-xs text-red-600">
            Revisá tu conexión a internet
          </p>
        </div>
      </div>
    </div>
  );
}

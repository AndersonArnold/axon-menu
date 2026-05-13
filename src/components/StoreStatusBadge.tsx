"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { GradeHorarios } from "@/lib/types";
import { isStoreOpen, getTodayScheduleLabel } from "@/lib/schedule";
import { cn } from "@/lib/utils";

interface StoreStatusBadgeProps {
  grade: GradeHorarios;
  pollIntervalMs?: number;
}

export default function StoreStatusBadge({
  grade,
  pollIntervalMs = 60_000,
}: StoreStatusBadgeProps) {
  const [open, setOpen] = useState(() => isStoreOpen(grade));
  const [label, setLabel] = useState(() => getTodayScheduleLabel(grade));

  useEffect(() => {
    setOpen(isStoreOpen(grade));
    setLabel(getTodayScheduleLabel(grade));

    const timer = setInterval(() => {
      setOpen(isStoreOpen(grade));
      setLabel(getTodayScheduleLabel(grade));
    }, pollIntervalMs);

    return () => clearInterval(timer);
  }, [grade, pollIntervalMs]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-500",
        open
          ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
          : "bg-red-500/10 text-red-400 ring-1 ring-red-500/30"
      )}
      aria-live="polite"
      aria-label={`Status: ${open ? "Aberta" : "Fechada"}`}
    >
      <span className="relative flex h-2 w-2">
        {open && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            open ? "bg-emerald-400" : "bg-red-500"
          )}
        />
      </span>
      <span>{open ? "Aberto" : "Fechado"}</span>
      <span className="flex items-center gap-0.5 opacity-60 font-normal ml-0.5">
        <Clock size={10} />
        <span>{label}</span>
      </span>
    </div>
  );
}

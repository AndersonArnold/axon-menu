"use client";

import Image from "next/image";
import { Categoria } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StoriesMenuProps {
  categorias: Categoria[];
  activeId: string | null;
  primaryColor: string;
  onSelect: (id: string) => void;
}

export default function StoriesMenu({
  categorias,
  activeId,
  primaryColor,
  onSelect,
}: StoriesMenuProps) {
  if (!categorias.length) return null;

  return (
    <nav
      aria-label="Categorias"
      className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#070b12]/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.04)]"
    >
      <div className="flex gap-5 overflow-x-auto px-4 py-3 scrollbar-hide snap-x">
        {categorias.map((cat) => {
          const isActive = cat.id === activeId;
          return (
            <button
              key={cat.id}
              id={`category-btn-${cat.id}`}
              onClick={() => onSelect(cat.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 snap-start group focus:outline-none"
              aria-pressed={isActive}
              aria-label={cat.nome}
            >
              {/* Story ring */}
              <div
                className={cn(
                  "w-14 h-14 rounded-full p-[2.5px] transition-all duration-300"
                )}
                style={{
                  outline: isActive ? `2.5px solid ${primaryColor}` : "2.5px solid #334155",
                  outlineOffset: "2px",
                }}
              >
                <div
                  className="w-full h-full rounded-full overflow-hidden flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isActive ? primaryColor : "#263548",
                  }}
                >
                  {cat.icone_url ? (
                    <Image
                      src={cat.icone_url}
                      alt={cat.nome}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span
                      className={cn(
                        "text-lg font-bold transition-colors",
                        isActive ? "text-white" : "text-slate-400"
                      )}
                    >
                      {cat.nome.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Label */}
              <span
                className="text-[11px] font-medium max-w-[56px] text-center leading-tight truncate transition-colors"
                style={{ color: isActive ? primaryColor : "#64748b" }}
              >
                {cat.nome}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

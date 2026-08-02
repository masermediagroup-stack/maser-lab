"use client";

import { useRef, useState } from "react";
import {
  PROCEDURAL_MATERIALS,
  getMaterialDefinition,
} from "../../engine/material/catalog";
import type { EngineMaterialId } from "../../engine/material/types";
import { cn } from "@/lib/utils";

type MaterialDockProps = {
  activeId: EngineMaterialId;
  order: EngineMaterialId[];
  onOrderChange: (order: EngineMaterialId[]) => void;
  onSelect: (id: EngineMaterialId) => void;
  onApply: (id: EngineMaterialId) => void;
  onFavorite?: (id: EngineMaterialId) => void;
  onDuplicate?: (id: EngineMaterialId) => void;
  className?: string;
};

/**
 * Figma/Procreate-style material dock:
 * tap → inspect/select, drag onto stage → apply, long-press → actions, drag reorder.
 */
export function MaterialDock({
  activeId,
  order,
  onOrderChange,
  onSelect,
  onApply,
  onFavorite,
  onDuplicate,
  className,
}: MaterialDockProps) {
  const ids =
    order.length > 0
      ? order
      : (PROCEDURAL_MATERIALS.map((m) => m.id) as EngineMaterialId[]);
  const [menuId, setMenuId] = useState<EngineMaterialId | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const dragFrom = useRef<number | null>(null);

  const clearLongPress = () => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const onItemPointerDown = (id: EngineMaterialId, index: number) => {
    dragFrom.current = index;
    clearLongPress();
    longPressTimer.current = window.setTimeout(() => {
      setMenuId(id);
      longPressTimer.current = null;
    }, 480);
  };

  const onItemPointerUp = (id: EngineMaterialId) => {
    const wasLong = longPressTimer.current == null && menuId === id;
    clearLongPress();
    if (!wasLong && menuId !== id) {
      onSelect(id);
    }
    dragFrom.current = null;
  };

  const onItemClick = (id: EngineMaterialId) => {
    onSelect(id);
  };

  const onDragStart = (index: number) => {
    dragFrom.current = index;
    clearLongPress();
  };

  const onDrop = (index: number) => {
    const from = dragFrom.current;
    if (from == null || from === index) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(index, 0, moved);
    onOrderChange(next);
    dragFrom.current = null;
  };

  return (
    <div className={cn("mde-dock", className)} aria-label="Material dock">
      <div className="mde-dock__rail" role="list">
        {ids.map((id, index) => {
          const def = getMaterialDefinition(id);
          return (
            <div key={id} className="mde-dock__slot" role="listitem">
              <button
                type="button"
                className={cn(
                  "mde-dock__thumb",
                  activeId === id && "mde-dock__thumb--active",
                )}
                data-material={id}
                draggable
                aria-label={def?.label ?? id}
                aria-pressed={activeId === id}
                onClick={() => onItemClick(id)}
                onDoubleClick={() => onApply(id)}
                onPointerDown={() => onItemPointerDown(id, index)}
                onPointerUp={() => onItemPointerUp(id)}
                onPointerLeave={clearLongPress}
                onPointerCancel={clearLongPress}
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(index)}
                title={`${def?.label ?? id} — tap inspect, double-tap apply, long-press menu`}
              />
              <span className="mde-dock__label">{def?.label ?? id}</span>
            </div>
          );
        })}
      </div>

      {menuId ? (
        <div className="mde-dock__menu" role="menu" aria-label="Material actions">
          <p className="mde-dock__menu-title">
            {getMaterialDefinition(menuId)?.label ?? menuId}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onSelect(menuId);
              setMenuId(null);
            }}
          >
            Inspect
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onApply(menuId);
              setMenuId(null);
            }}
          >
            Apply to component
          </button>
          {onFavorite ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onFavorite(menuId);
                setMenuId(null);
              }}
            >
              Favorite
            </button>
          ) : null}
          {onDuplicate ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onDuplicate(menuId);
                setMenuId(null);
              }}
            >
              Duplicate as project
            </button>
          ) : null}
          <button type="button" role="menuitem" onClick={() => setMenuId(null)}>
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}

import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import BusChip from "./BusChip";

export default function CategoryColumn({
  categoryId,
  title,
  busIds,
  busMap,
  onBusOpenSnapshot,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: categoryId });

  return (
    <div className="column">
      <div className="column-header">
        {title}{" "}
        <span style={{ opacity: 0.7, fontWeight: 700 }}>
          ({busIds.length} buses)
        </span>
      </div>

      <div className="column-body">
        <SortableContext items={busIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className="bus-list"
            style={{
              outline: isOver ? "2px solid rgba(46, 204, 113, 0.6)" : "none",
            }}
          >
            {busIds.length === 0 ? (
              <div className="empty-hint">Drop buses here</div>
            ) : (
              busIds.map((busId) => (
                <div key={busId} style={{ marginBottom: 10 }}>
                  <BusChip
                    id={busId}
                    label={busMap[busId].label}
                    onDoubleClick={() => onBusOpenSnapshot(busId)}
                  />
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

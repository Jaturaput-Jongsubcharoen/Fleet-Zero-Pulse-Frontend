import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import BusChip from "./BusChip";

export default function CategoryColumn({ title, busIds, busMap }) {
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
          <div className="bus-list">
            {busIds.length === 0 ? (
              <div className="empty-hint">Drop buses here</div>
            ) : (
              busIds.map((busId) => (
                <div key={busId} style={{ marginBottom: 10 }}>
                  <BusChip id={busId} label={busMap[busId].label} />
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

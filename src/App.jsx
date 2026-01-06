import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import "./styles/Dashboard.css";

const CATEGORIES = [
  { id: "maintenance", label: "Maintenance" },
  { id: "storage", label: "Storage" },
  { id: "in_service", label: "In-Service" },
  { id: "long_term", label: "Long-term Maintenance" },
];

function BusChip({ id, label }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      className="bus-chip"
      {...attributes}
      {...listeners}
    >
      ⠿ Bus {label}
    </button>
  );
}

function CategoryColumn({ title, busIds, busMap }) {
  return (
    <div className="column">
      <div className="column-header">
        {title} <span style={{ opacity: 0.7, fontWeight: 700 }}>({busIds.length} buses)</span>
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

export default function App() {
  // Facilities list (user picks one)
  const facilities = useMemo(
    () => [
      { id: "facility_a", name: "Facility A" },
      { id: "facility_b", name: "Facility B" },
    ],
    []
  );

  const [selectedFacilityId, setSelectedFacilityId] = useState("facility_a");

  // All buses (global map)
  const busMap = useMemo(() => {
    const data = {};

    // Facility A buses: 101–110
    for (let n = 101; n <= 110; n++) {
      const id = `bus-${n}`;
      data[id] = { id, label: String(n), facilityId: "facility_a" };
    }

    // Facility B buses: 201–209
    for (let n = 201; n <= 209; n++) {
      const id = `bus-${n}`;
      data[id] = { id, label: String(n), facilityId: "facility_b" };
    }

    return data;
  }, []);

  // Per-facility status columns
  const [facilityBoards, setFacilityBoards] = useState(() => ({
    facility_a: {
      maintenance: ["bus-101", "bus-102", "bus-103"],
      storage: ["bus-104", "bus-105"],
      in_service: ["bus-106", "bus-107", "bus-108", "bus-109"],
      long_term: ["bus-110"],
    },
    facility_b: {
      maintenance: ["bus-201", "bus-202"],
      storage: ["bus-204", "bus-205"],
      in_service: ["bus-206", "bus-207"],
      long_term: ["bus-208", "bus-209"],
    },
  }));

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // current board (only selected facility shows)
  const board = facilityBoards[selectedFacilityId];

  const findContainer = (itemId) => {
    const keys = Object.keys(board);
    for (const k of keys) {
      if (board[k].includes(itemId)) return k;
    }
    return null;
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const from = findContainer(active.id);
    const to = findContainer(over.id) ?? over.id;

    // Only allow drops into known category containers
    if (!from || !to || !board[to]) return;

    // Same column reorder
    if (from === to) {
      const oldIndex = board[from].indexOf(active.id);
      const newIndex = board[to].indexOf(over.id);
      if (newIndex === -1) return;

      setFacilityBoards((prev) => ({
        ...prev,
        [selectedFacilityId]: {
          ...prev[selectedFacilityId],
          [from]: arrayMove(prev[selectedFacilityId][from], oldIndex, newIndex),
        },
      }));
      return;
    }

    // Move across columns
    setFacilityBoards((prev) => {
      const current = prev[selectedFacilityId];
      return {
        ...prev,
        [selectedFacilityId]: {
          ...current,
          [from]: current[from].filter((id) => id !== active.id),
          [to]: [...current[to], active.id],
        },
      };
    });
  };

  const selectedFacilityName =
    facilities.find((f) => f.id === selectedFacilityId)?.name ?? "Facility";

  return (
    <div className="page">
      <div className="header">
        <div>
          <div className="title">Fleet Zero Pulse</div>
          <div className="subtitle">Vehicle Management</div>
        </div>
      </div>

      {/* Facility selector */}
      <div className="facility-bar">
        <div className="facility-label">Select Facility:</div>
        <select
          className="facility-select"
          value={selectedFacilityId}
          onChange={(e) => setSelectedFacilityId(e.target.value)}
        >
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="facility-title">{selectedFacilityName}</div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid">
            {CATEGORIES.map((c) => (
              <SortableContext
                key={c.id}
                items={board[c.id]}
                strategy={verticalListSortingStrategy}
              >
                <CategoryColumn
                  title={c.label}
                  busIds={board[c.id]}
                  busMap={busMap}
                />
              </SortableContext>
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="drag-overlay">⠿ Bus {busMap[activeId]?.label}</div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

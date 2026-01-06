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
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import "./styles/Dashboard.css";

import CategoryColumn from "./components/CategoryColumn";
import FacilitySelector from "./components/FacilitySelector";

import {
  CATEGORIES,
  FACILITIES,
  buildBusMap,
  INITIAL_FACILITY_BOARDS,
} from "./data/fleetData";

import BusSnapshotModal from "./components/BusSnapshotModal";

export default function App() {
  const facilities = useMemo(() => FACILITIES, []);
  const [selectedFacilityId, setSelectedFacilityId] = useState("facility_a");

  const busMap = useMemo(() => buildBusMap(), []);

  const [facilityBoards, setFacilityBoards] = useState(() => ({
    ...INITIAL_FACILITY_BOARDS,
  }));

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const board = facilityBoards[selectedFacilityId];

  // Find which column currently contains this bus ID
  const findContainer = (itemId) => {
    for (const key of Object.keys(board)) {
      if (board[key].includes(itemId)) return key;
    }
    return null;
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeItemId = active.id;
    const overId = over.id;

    const from = findContainer(activeItemId);

    // IMPORTANT:
    // If dropped on an EMPTY column, overId will be the column id (e.g., "storage")
    // If dropped on a BUS, overId will be a bus id (e.g., "bus-105") so we find its container
    const to = board[overId] ? overId : findContainer(overId);

    if (!from || !to) return;

    // Reorder inside same column (only when dropping on another bus)
    if (from === to) {
      const oldIndex = board[from].indexOf(activeItemId);
      const newIndex = board[to].indexOf(overId);

      // If you dropped on the column container itself (not on a bus), do nothing
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

    // Move between columns
    setFacilityBoards((prev) => {
      const current = prev[selectedFacilityId];

      const nextFrom = current[from].filter((id) => id !== activeItemId);
      const nextTo = [...current[to]];

      // If dropped on a bus, insert before that bus
      const overIndex = nextTo.indexOf(overId);
      const insertIndex = overIndex === -1 ? nextTo.length : overIndex;

      nextTo.splice(insertIndex, 0, activeItemId);

      return {
        ...prev,
        [selectedFacilityId]: {
          ...current,
          [from]: nextFrom,
          [to]: nextTo,
        },
      };
    });
  };

  const selectedFacilityName =
    facilities.find((f) => f.id === selectedFacilityId)?.name ?? "Facility";


  const [snapshotBusId, setSnapshotBusId] = useState(null);

  const snapshotDataByBusId = useMemo(() => ({
    "bus-101": { batteryPct: 78, alertCount: 1, lastUpdated: "Today 10:42", notes: "Scheduled inspection" },
    "bus-106": { batteryPct: 64, alertCount: 0, lastUpdated: "Today 09:12", notes: "Operating normal" },
  }), []);

  const openSnapshot = (busId) => setSnapshotBusId(busId);
  const closeSnapshot = () => setSnapshotBusId(null);

  const snapshotBus = snapshotBusId
    ? {
        ...busMap[snapshotBusId],
        status: findContainer(snapshotBusId), // current column status
        ...(snapshotDataByBusId[snapshotBusId] ?? {}),
      }
    : null;

  const viewFullDetails = (bus) => {
    // later: navigate to a details page
    // for now: example
    alert(`Go to full details for Bus ${bus.label}`);
  };

return (
    <div className="page">
      <div className="header">
        <div>
          <div className="title">Fleet Zero Pulse</div>
          <div className="subtitle">Vehicle Management</div>
        </div>
      </div>

      <FacilitySelector
        facilities={facilities}
        selectedFacilityId={selectedFacilityId}
        setSelectedFacilityId={setSelectedFacilityId}
      />

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
                  categoryId={c.id}
                  title={c.label}
                  busIds={board[c.id]}
                  busMap={busMap}
                  onBusOpenSnapshot={openSnapshot}
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

      {/* Put the modal here (near the bottom, still inside .page) */}
      <BusSnapshotModal
        open={!!snapshotBusId}
        bus={snapshotBus}
        onClose={closeSnapshot}
        onViewFull={viewFullDetails}
      />
    </div>
  );
}

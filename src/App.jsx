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

import { Routes, Route, useNavigate } from "react-router-dom";
import BusDetailPage from "./pages/BusDetailPage";
import StationBusPage from "./pages/StationBusPage/StationBusPage";

export default function App() {
  const navigate = useNavigate();

  const facilities = useMemo(() => FACILITIES, []);
  const [selectedFacilityId, setSelectedFacilityId] = useState("facility_a");

  const busMap = useMemo(() => buildBusMap(), []);

  const [facilityBoards, setFacilityBoards] = useState(() => ({
    ...INITIAL_FACILITY_BOARDS,
  }));

  // Shared editable bus details (used by Station page and Detail page later)
  const [busDetails, setBusDetails] = useState(() => ({
    "bus-101": {
      status: "Under Repair",
      lastService: "2024-01-15",
      notes: "Engine maintenance",
    },
    "bus-102": {
      status: "Scheduled Maintenance",
      lastService: "2024-01-10",
      notes: "Regular checkup",
    },
    "bus-103": {
      status: "Waiting Parts",
      lastService: "2024-01-05",
      notes: "Brake replacement needed",
    },
  }));

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const board = facilityBoards[selectedFacilityId];

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
    const to = board[overId] ? overId : findContainer(overId);

    if (!from || !to) return;

    if (from === to) {
      const oldIndex = board[from].indexOf(activeItemId);
      const newIndex = board[to].indexOf(overId);
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

    setFacilityBoards((prev) => {
      const current = prev[selectedFacilityId];

      const nextFrom = current[from].filter((id) => id !== activeItemId);
      const nextTo = [...current[to]];

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

  // Snapshot modal state
  const [snapshotBusId, setSnapshotBusId] = useState(null);

  const openSnapshot = (busId) => setSnapshotBusId(busId);
  const closeSnapshot = () => setSnapshotBusId(null);

  const snapshotBus = snapshotBusId
    ? {
        ...busMap[snapshotBusId],
        status: findContainer(snapshotBusId),
        ...(busDetails[snapshotBusId] ?? {}),
      }
    : null;

  const viewFullDetails = (bus) => {
    closeSnapshot();
    navigate(`/bus/${bus.id}`);
  };

  const DashboardPage = (
    <>
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

      <BusSnapshotModal
        open={!!snapshotBusId}
        bus={snapshotBus}
        onClose={closeSnapshot}
        onViewFull={viewFullDetails}
      />
    </>
  );

  return (
    <div className="page">
      <Routes>
        <Route path="/" element={DashboardPage} />
        <Route path="/bus/:busId" element={<BusDetailPage />} />

        {/* Station page route */}
        <Route
          path="/station/:facilityId"
          element={
            <StationBusPage
              busDetails={busDetails}
              setBusDetails={setBusDetails}
              facilityBoards={facilityBoards}
              setFacilityBoards={setFacilityBoards}
            />
          }
        />
      </Routes>
    </div>
  );
}

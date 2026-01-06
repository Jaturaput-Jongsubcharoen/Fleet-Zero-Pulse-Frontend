import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CATEGORIES } from "../../data/fleetData";
import "./StationBusPage.css"

export default function StationBusPage({
  busDetails,
  setBusDetails,
  facilityBoards,
  setFacilityBoards,
}) {
  const CATEGORY_OPTIONS = [
    {id:"maintenance", label:"Maintenance" },
    {id:"storage", label:"Storage" },
    {id:"in_service", label:"In Service" },
    {id:"long_term", label:"Long Term Maintenance" },
  ]

  const findBusCategory = (busId) => {
    for (const catId of CATEGORY_OPTIONS) {
      if (board[catId.id].includes(busId)) {
        return catId;
      }
    }
    return null;
  };

  const { facilityId } = useParams();
  const navigate = useNavigate();

  const board = facilityBoards[facilityId];

  const [editingBusId, setEditingBusId] = useState(null);
  const [draft, setDraft] = useState({ categoryId: "maintenance", lastService: "", notes: "" });

  const facilityTitle = useMemo(() => {
    if (facilityId === "facility_a") return "Facility A";
    if (facilityId === "facility_b") return "Facility B";
    return facilityId;
  }, [facilityId]);

  const openEdit = (busId) => {
    setEditingBusId(busId);

    const current = busDetails[busId] ?? { lastService: "", notes: "" };
    const currentCategoryId = findBusCategory(busId) ?? "maintenance";

    setDraft({
      lastService: current.lastService ?? "",
      notes: current.notes ?? "",
      categoryId: currentCategoryId,
    });
  };

  const cancelEdit = () => {
    setEditingBusId(null);
    setDraft({ status: "", lastService: "", notes: "" });
  };

const saveEdit = () => {
    if (!editingBusId) return;

    // 1) Save details (notes, lastService)
    setBusDetails((prev) => ({
      ...prev,
      [editingBusId]: {
        ...(prev[editingBusId] ?? {}),
        lastService: draft.lastService,
        notes: draft.notes,
      },
    }));

    // 2) Move bus to selected category (sync with main dashboard columns)
    setFacilityBoards((prev) => {
      const currentBoard = prev[facilityId];
      if (!currentBoard) return prev;

      // find current category
      let fromCat = null;
      for (const catId of Object.keys(currentBoard)) {
        if (currentBoard[catId].includes(editingBusId)) {
          fromCat = catId;
          break;
        }
      }

      const toCat = draft.categoryId;
      if (!toCat) return prev;

      // if no change, keep board
      if (fromCat === toCat) return prev;

      return {
        ...prev,
        [facilityId]: {
          ...currentBoard,
          [fromCat]: currentBoard[fromCat].filter((id) => id !== editingBusId),
          [toCat]: [...currentBoard[toCat], editingBusId],
        },
      };
    });

    setEditingBusId(null);
  };

  if (!board) {
    return (
      <div className="page">
        <div className="card">
          <div style={{ fontWeight: 900, fontSize: 18 }}>Unknown facility</div>
          <button className="btn secondary" onClick={() => navigate("/")}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page station">
      <div className="title">Fleet Zero Pulse</div>
      <div className="subtitle">Vehicle Management | Dashboard Editor</div>
      <div className="station-topbar">
        <button className="btn secondary" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
        <div className="station-title">{facilityTitle} – Bus Management</div>
      </div>

      {/* Lists by category */}
      {CATEGORIES.map((c) => (
        <div key={c.id} className="station-section">
          <div className="station-section-title">
            {c.label} <span className="muted">({board[c.id].length} buses)</span>
          </div>

          <div className="station-list">
            {board[c.id].map((busId) => {
              const d = busDetails[busId] ?? {};
              return (
                <div key={busId} className="station-card">
                  <div className="station-card-row">
                    <div className="station-bus-name">Bus {busId.replace("bus-", "")}</div>
                    <button className="btn small" onClick={() => openEdit(busId)}>
                      Edit
                    </button>
                  </div>

                  <div className="station-meta">
                    <div><span className="mutedLabel">Status:</span> {d.status ?? "--"}</div>
                    <div><span className="mutedLabel">Last Service:</span> {d.lastService ?? "--"}</div>
                    <div><span className="mutedLabel">Notes:</span> {d.notes ?? "--"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Inline editor (mobile-friendly) */}
      {editingBusId && (
        <div className="station-editor">
          <div className="station-editor-title">
            Editing Bus {editingBusId.replace("bus-", "")}
          </div>

          <label className="field">
            <span>Status</span>
            <select
              value={draft.categoryId}
              onChange={(e) =>
                setDraft((p) => ({ ...p, categoryId: e.target.value }))
              }
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Last Service</span>
            <input
              type="date"
              value={draft.lastService}
              onChange={(e) => setDraft((p) => ({ ...p, lastService: e.target.value }))}
            />
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Optional notes"
            />
          </label>

          <div className="station-editor-actions">
            <button className="btn secondary" onClick={cancelEdit}>Cancel</button>
            <button className="btn primary" onClick={saveEdit}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

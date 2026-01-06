import React from "react";

export default function BusSnapshotModal({
  open,
  bus,
  onClose,
  onViewFullDetails,
}) {
  if (!open || !bus) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()} // prevent closing when clicking inside
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title">Bus Snapshot</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="kv">
            <span className="k">Bus</span>
            <span className="v">{bus.label}</span>
          </div>
          <div className="kv">
            <span className="k">Facility</span>
            <span className="v">{bus.facilityId}</span>
          </div>

          {/* Mock snapshot fields for now (later replace with API data) */}
          <div className="kv">
            <span className="k">Status</span>
            <span className="v">{bus.status ?? "Unknown"}</span>
          </div>
          <div className="kv">
            <span className="k">Battery</span>
            <span className="v">{bus.batteryPct ?? "—"}%</span>
          </div>
          <div className="kv">
            <span className="k">Alerts</span>
            <span className="v">{bus.alerts ?? "None"}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onViewFullDetails(bus)}
          >
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
}

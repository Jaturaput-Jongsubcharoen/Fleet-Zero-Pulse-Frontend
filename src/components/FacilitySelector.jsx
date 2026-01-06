import React from "react";

export default function FacilitySelector({
  facilities,
  selectedFacilityId,
  setSelectedFacilityId,
}) {
  return (
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
  );
}

import fleetConfig from "./fleetConfig.json";
import initialBoards from "./initialBoards.json";

/* =========================
   Export static config
========================= */
export const CATEGORIES = fleetConfig.categories;
export const FACILITIES = fleetConfig.facilities;

/* =========================
   Build bus lookup map
   (fast O(1) access)
========================= */
export function buildBusMap() {
  const data = {};

  // Facility A buses: 101–110
  for (let n = 101; n <= 110; n++) {
    const id = `bus-${n}`;
    data[id] = {
      id,
      label: String(n),
      facilityId: "facility_a",
    };
  }

  // Facility B buses: 201–209
  for (let n = 201; n <= 209; n++) {
    const id = `bus-${n}`;
    data[id] = {
      id,
      label: String(n),
      facilityId: "facility_b",
    };
  }

  return data;
}

/* =========================
   Initial dashboard state
   (per facility, per category)
========================= */
export const INITIAL_FACILITY_BOARDS = initialBoards;
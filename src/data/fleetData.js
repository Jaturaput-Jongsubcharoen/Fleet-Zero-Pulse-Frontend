import fleetConfig from "./fleetConfig.json";

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
export const INITIAL_FACILITY_BOARDS = {
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
};

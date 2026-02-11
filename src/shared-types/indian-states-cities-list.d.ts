declare module "indian-states-cities-list" {
  interface IndianStatesCitiesList {
    STATE_WISE_CITIES: Record<string, string[]>; // e.g., { Karnataka: ["Bangalore", "Mysore"] }
    STATES: string[];
  }

  const data: IndianStatesCitiesList;
  export default data;
}

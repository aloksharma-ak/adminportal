declare module "indian-states-cities-list" {
  export interface StateOption {
    label: string; // "Andhra Pradesh"
    value: string; // "Andhra Pradesh"
    name: string; // "AndhraPradesh" (key used in STATE_WISE_CITIES)
  }

  export interface CityOption {
    value: string; // "Bangalore"
    label: string; // "Bangalore"
  }

  export interface IndianStatesCitiesList {
    STATES_OBJECT: StateOption[];
    STATE_WISE_CITIES: Record<string, CityOption[]>;
  }

  const data: IndianStatesCitiesList;
  export default data;
}

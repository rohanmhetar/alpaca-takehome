export interface Address {
  street_name: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface Availability {
  day_of_the_week: number;
  start_time: string;
  end_time: string;
}

export interface Client {
  id: string;
  name: string;
  availabilities: Availability[];
  address: Address;
}

export interface Clinician {
  id: string;
  name: string;
  availabilities: Availability[];
  address: Address;
  max_clients_per_day: number;
  session_duration_hours: number;
}

export interface ScheduleEntry {
  day: number;
  client_id: string;
  client_name: string;
  start_time: string;
  end_time: string;
  client_address: Address;
  drive_time: number;
} 
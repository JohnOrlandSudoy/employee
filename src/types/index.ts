export interface Employee {
  id: string;
  email: string;
  username: string;
  role: string;
  assignedBusId: string;
  profile: {
    fullName: string;
    phone: string;
    position: string;
  };
  token?: string; // Optional for login response
}

export interface LoginResponse {
  success: boolean;
  session: {
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number;
    refresh_token: string;
    user: any;
  };
  employee: Employee;
}

export interface Bus {
  id: string;
  bus_number: string;
  available_seats: number;
  total_seats: number;
  status: string;
  current_location: {
    lat: number;
    lng: number;
  } | null;
  route: Route;
}

export interface Route {
  name: string;
  start_terminal_id: string;
  end_terminal_id: string;
}

export interface Terminal {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Notification {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface Report {
  employeeId: string;
  busId: string;
  type: 'maintenance' | 'traffic' | 'passenger' | 'other';
  description: string;
}

export interface BusResponse {
  role: string;
  bus: Bus;
}